import React from "react";
import { notFound } from "next/navigation";
import { getDictionary, getApartmentBySlug, getApartmentsByOwner } from "@/lib/payload-fetcher";
import { Breadcrumbs } from "@/components/apartments/Breadcrumbs";
import { MediaGallery } from "@/components/apartments/MediaGallery";
import { KeyFactsGrid } from "@/components/apartments/KeyFactsGrid";
import { PriceBreakdown } from "@/components/apartments/PriceBreakdown";
import { SaveAndShare } from "@/components/apartments/SaveAndShare";
import { PropertyDescription } from "@/components/apartments/PropertyDescription";
import { DetailSpecsTable } from "@/components/apartments/DetailSpecsTable";
import { LegalCard } from "@/components/apartments/LegalCard";
import { AmenitiesGrid } from "@/components/apartments/AmenitiesGrid";
import { AgentCard } from "@/components/apartments/AgentCard";
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
  const dict = await getDictionary(locale);
  const t = (key: string): string => {
    const val = dict[`apartments.${key}`] || dict[`agent.${key}`] || dict[`common.${key}`] || key;
    return typeof val === 'string' ? val : key;
  };

  const apt = await getApartmentBySlug(slug, locale);
  if (!apt) notFound();

  // Validate owner
  const owner = typeof apt.owner === 'object' ? (apt.owner as User) : null;
  if (!owner || owner.agentSlug !== agentSlug) {
    notFound();
  }

  // Fetch similar apartments
  const allApartments = await getApartmentsByOwner(owner.id, locale, 5);
  const similar = allApartments.filter(a => a.id !== apt.id).slice(0, 4);

  const serverUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

  return (
    <>
      <main className="min-h-screen bg-background pb-24 md:pb-12">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-6 md:py-10">
          <Breadcrumbs
            items={[
              { label: t("home"), href: `/${locale}/${agentSlug}` },
              { label: t("apartments"), href: `/${locale}/${agentSlug}/apartments` },
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
                  <SaveAndShare apartmentId={apt.id} t={t} />
                </div>
                <MediaGallery gallery={apt.gallery || []} tourUrl={apt.tourUrl} serverUrl={serverUrl} />
              </section>

              {/* Key Facts */}
              <section>
                <h2 className="text-2xl font-bold mb-6">{t("key_facts")}</h2>
                <KeyFactsGrid keyFacts={apt.keyFacts} t={t} />
              </section>

              {/* Price Breakdown (Mobile Only) */}
              <div className="block lg:hidden">
                <PriceBreakdown price={apt.price} priceBreakdown={apt.priceBreakdown} t={t} />
              </div>

              {/* Description */}
              {(apt.details?.overview || apt.details?.highlights || apt.details?.landscape) && (
                <section className="border-t border-border/50 pt-10">
                  <h2 className="text-2xl font-bold mb-6">{t("overview")}</h2>
                  <PropertyDescription details={apt.details} t={t} />
                </section>
              )}

              {/* Detail Specs & Legal */}
              <section className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-border/50 pt-10">
                <div>
                  <h2 className="text-2xl font-bold mb-6">{t("property_details")}</h2>
                  <DetailSpecsTable keyFacts={apt.keyFacts} t={t} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold mb-6">{t("legal_status")}</h2>
                  <LegalCard legal={apt.legal} t={t} />
                </div>
              </section>

              {/* Amenities */}
              {apt.amenities && apt.amenities.length > 0 && (
                <section className="border-t border-border/50 pt-10">
                  <h2 className="text-2xl font-bold mb-6">{t("amenities")}</h2>
                  <AmenitiesGrid amenities={apt.amenities} t={t} />
                </section>
              )}

              {/* Location (Map Iframe) */}
              {apt.location?.lat && apt.location?.lng && (
                <section className="border-t border-border/50 pt-10">
                  <h2 className="text-2xl font-bold mb-6">{t("location")}</h2>
                  <div className="w-full h-80 rounded-3xl overflow-hidden bg-background-subtle">
                    <iframe
                      width="100%"
                      height="100%"
                      frameBorder="0"
                      style={{ border: 0 }}
                      src={`https://www.google.com/maps?q=${apt.location.lat},${apt.location.lng}&z=15&output=embed`}
                      allowFullScreen
                    ></iframe>
                  </div>
                </section>
              )}
            </div>

            {/* RIGHT COLUMN: Sticky Sidebar */}
            <div className="w-full lg:w-96 flex-shrink-0 flex flex-col gap-6">
              <div className="sticky top-24 flex flex-col gap-6">
                
                {/* Price Breakdown (Desktop) */}
                <div className="hidden lg:block">
                  <PriceBreakdown price={apt.price} priceBreakdown={apt.priceBreakdown} t={t} />
                </div>

                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                <AgentCard owner={apt.owner as any} listingType={apt.listingType} t={t} />
                <InvestmentROI rentalYield={apt.investment?.rentalYield} t={t} />
              </div>
            </div>
          </div>

          <SimilarListings apartments={similar} agentSlug={agentSlug} t={t} />
        </div>
      </main>

      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <StickyCTA phoneNumber={(apt.owner as any)?.profile?.phoneNumber} listingType={apt.listingType} t={t} />

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
              "price": apt.price || apt.priceBreakdown?.totalPrice,
              "priceCurrency": "VND"
            }
          })
        }}
      />
    </>
  );
}
