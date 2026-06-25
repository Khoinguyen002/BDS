import React from "react";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getApartmentBySlug, getApartmentsByOwner } from "@/lib/payload-fetcher";
import { Breadcrumbs } from "@/components/apartments/Breadcrumbs";
import { MediaGallery } from "@/components/apartments/MediaGallery";
import { DetailBody } from "@/components/apartments/DetailBody";
import { PriceBreakdown } from "@/components/apartments/PriceBreakdown";
import { StickyCTA } from "@/components/apartments/StickyCTA";
import { SimilarListings } from "@/components/apartments/SimilarListings";
import { ViewCounter } from "@/components/apartments/ViewCounter";
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
  const t = await getTranslations("apartments");
  const description = t("property_details_desc");
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

  // "Similar" giờ dựa trên tags chung thay vì propertyType cứng.
  const tagIds = Array.isArray(apt.tags)
    ? apt.tags.map((x) => (typeof x === "object" && x ? x.id : x)).filter((x): x is number => typeof x === "number")
    : [];

  const similar = await getApartmentsByOwner(owner.id, locale, {
    tagIds: tagIds.length > 0 ? tagIds : undefined,
    listingType: apt.listingType || undefined,
    priceMin,
    priceMax,
    excludeId: apt.id,
    limit: 4
  });

  // Fallback: if not enough similar apartments, fetch without price constraint
  if (similar.length < 4) {
    const fallbackSimilar = await getApartmentsByOwner(owner.id, locale, {
      tagIds: tagIds.length > 0 ? tagIds : undefined,
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
      <ViewCounter apartmentId={apt.id} />
      <main className="min-h-screen bg-background pt-16 pb-12 md:pb-12">
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
            <div className="flex-1 min-w-0 flex flex-col gap-6">
              
              {/* Media Gallery */}
              <section>
                <div className="mb-6">
                  <h2 className="font-bold mb-2">
                    {apt.title}
                  </h2>
                  {apt.address && (
                    <p className="text-foreground-secondary flex items-center gap-1.5 text-sm md:text-base mt-2">
                      <MapPinIcon weight="fill" className="text-primary w-4 h-4 shrink-0" />
                      {apt.address}
                    </p>
                  )}
                </div>
                <MediaGallery 
                  gallery={apt.gallery || []} 
                  tourUrl={apt.tourUrl} 
                  serverUrl={serverUrl} 
                  tags={apt.tags}
                  listingType={apt.listingType}
                />
              </section>

              {/* Price Breakdown (Mobile Only) */}
              <div className="block lg:hidden">
                <PriceBreakdown price={apt.price} apartment={apt} />
              </div>

              {/* Detail Body (Dynamic rendering based on profile) */}
              <DetailBody apartment={apt} />
            </div>

            {/* RIGHT COLUMN: Sticky Sidebar */}
            <div className="w-full lg:w-96 shrink-0 flex flex-col gap-6">
              <div className="sticky top-24 flex flex-col gap-6">
                
                {/* Price Breakdown (Desktop) */}
                <div className="hidden lg:flex flex-col gap-6">
                  <PriceBreakdown price={apt.price} apartment={apt} />
                  
                  <StickyCTA 
                    owner={owner} 
                    phoneNumber={owner?.profile?.phoneNumber} 
                    zaloUrl={owner?.profile?.zaloUrl} 
                    listingType={apt.listingType} 
                    isDesktop 
                  />
                </div>
              </div>
            </div>
          </div>

          <SimilarListings apartments={similar} agentSlug={agentSlug} />
        </div>
      </main>

      {/* Sticky CTA (Mobile Only) */}
      <div className="block lg:hidden">
        <StickyCTA 
          owner={owner} 
          phoneNumber={owner?.profile?.phoneNumber} 
          zaloUrl={owner?.profile?.zaloUrl} 
          listingType={apt.listingType} 
        />
      </div>

      {/* Structured Data for SEO */}
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "RealEstateListing",
            "name": apt.title,
            "description": t("apartments.property_details_desc"),
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
