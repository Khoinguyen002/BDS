import React from "react";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getApartmentBySlug, getApartmentsByOwner } from "@/lib/payload-fetcher";
import { Breadcrumbs } from "@/components/apartments/Breadcrumbs";
import { MediaGallery } from "@/components/apartments/MediaGallery";
import { DetailBody } from "@/components/apartments/DetailBody";
import { PriceBreakdown } from "@/components/apartments/PriceBreakdown";
import { SaveAndShare } from "@/components/apartments/SaveAndShare";
import { StickyCTA } from "@/components/apartments/StickyCTA";
import { InvestmentROI } from "@/components/apartments/InvestmentROI";
import { SimilarListings } from "@/components/apartments/SimilarListings";
import { User } from "@bds/shared/payload-types";
import { MapPinIcon } from "@phosphor-icons/react/dist/ssr";

type PageProps = {
  params: Promise<{ locale: string; agentSlug: string; slug: string }>;
};

export async function generateMetadata({ params }: PageProps) {
  const { slug, locale } = await params;
  const apt = await getApartmentBySlug(slug, locale);

  if (!apt) {
    return { title: "Not Found" };
  }

  const title = `${apt.title} | ${apt.price ? `${apt.price.toLocaleString()} VND` : 'Liên hệ'}`;
  const description = "Thông tin chi tiết căn hộ, pháp lý và tiện ích.";
  const imageUrl = apt.gallery && apt.gallery.length > 0 && typeof apt.gallery[0] === 'object' && apt.gallery[0]?.url
    ? `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}${apt.gallery[0].url}`
    : undefined;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: imageUrl ? [{ url: imageUrl }] : [],
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: imageUrl ? [imageUrl] : [],
    },
  };
}

export default async function ApartmentDetailPage({ params }: PageProps) {
  const { locale, agentSlug, slug } = await params;
  const t = await getTranslations();

  const apt = await getApartmentBySlug(slug, locale);
  if (!apt) notFound();

  // Validate owner
  const owner = typeof apt.owner === 'object' ? (apt.owner as User) : null;
  if (!owner || owner.agentSlug !== agentSlug) {
    notFound();
  }

  // Fetch similar apartments
  const priceRange = 0.4; // 40% band
  const priceMin = apt.price ? apt.price * (1 - priceRange) : undefined;
  const priceMax = apt.price ? apt.price * (1 + priceRange) : undefined;
  
  const similar = await getApartmentsByOwner(owner.id, locale, {
    propertyType: apt.propertyType || undefined,
    listingType: apt.listingType || undefined,
    priceMin,
    priceMax,
    excludeId: apt.id,
    limit: 4
  });

  // Fallback: if not enough similar apartments, fetch without price constraint
  if (similar.length < 4) {
    const fallbackSimilar = await getApartmentsByOwner(owner.id, locale, {
      propertyType: apt.propertyType || undefined,
      listingType: apt.listingType || undefined,
      excludeId: apt.id,
      limit: 4 - similar.length
    });
    // Deduplicate
    const existingIds = new Set(similar.map(a => a.id));
    for (const fbApt of fallbackSimilar) {
      if (!existingIds.has(fbApt.id)) {
        similar.push(fbApt);
      }
    }
  }

  const serverUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

  return (
    <>
      <main className="min-h-screen bg-background pb-24 md:pb-12">
        <div className="container py-6 md:py-10">
          <Breadcrumbs
            items={[
              { label: t("nav.home"), href: `/${locale}/${agentSlug}` },
              { label: t("nav.apartments"), href: `/${locale}/${agentSlug}/apartments` },
              { label: apt.title },
            ]}
          />

          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
            {/* LEFT COLUMN: Main Info */}
            <div className="flex-1 min-w-0 flex flex-col gap-10">
              
              {/* Media Gallery */}
              <section>
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h1 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight mb-2">
                      {apt.title}
                    </h1>
                    {apt.address && (
                      <p className="text-foreground-secondary flex items-center gap-1.5 text-lg">
                        <MapPinIcon weight="fill" className="text-primary w-5 h-5" />
                        {apt.address}
                      </p>
                    )}
                  </div>
                  <SaveAndShare apartmentId={apt.id} />
                </div>
                <MediaGallery gallery={apt.gallery || []} tourUrl={apt.tourUrl} serverUrl={serverUrl} />
              </section>

              {/* Price Breakdown (Mobile Only) */}
              <div className="block lg:hidden">
                <PriceBreakdown price={apt.price} apartment={apt} />
              </div>

              {/* Detail Body (Dynamic rendering based on profile) */}
              <DetailBody apartment={apt} />
            </div>

            {/* RIGHT COLUMN: Sticky Sidebar */}
            <div className="w-full lg:w-96 flex-shrink-0 flex flex-col gap-6">
              <div className="sticky top-24 flex flex-col gap-6">
                
                {/* Price Breakdown (Desktop) */}
                <div className="hidden lg:block">
                  <PriceBreakdown price={apt.price} apartment={apt} />
                </div>

                {apt.listingType === "sale" && (
                  <InvestmentROI rentalYield={apt.investment?.rentalYield} />
                )}
              </div>
            </div>
          </div>

          <SimilarListings apartments={similar} agentSlug={agentSlug} propertyType={apt.propertyType} />
        </div>
      </main>

      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <StickyCTA owner={apt.owner as any} phoneNumber={(apt.owner as any)?.profile?.phoneNumber} zaloNumber={(apt.owner as any)?.profile?.zaloNumber} listingType={apt.listingType} />

      {/* Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "RealEstateListing",
            "name": apt.title,
            "description": "Bất động sản chi tiết",
            "offers": {
              "@type": "Offer",
              "price": apt.price,
              "priceCurrency": "VND"
            }
          })
        }}
      />
    </>
  );
}
