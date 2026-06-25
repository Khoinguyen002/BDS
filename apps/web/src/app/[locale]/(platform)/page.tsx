import React from "react";
import { getFeaturedAgents, getCuratedApartments, getLocations, getTags, getHomepage } from "@/lib/payload-fetcher";
import HeroBanner from "@/components/blocks/HeroBanner";
import { CuratedCollections } from "@/components/home/CuratedCollections";
import { MarketSnapshot } from "@/components/home/MarketSnapshot";
import { FeaturedAgents } from "@/components/home/FeaturedAgents";
import { CtaSupply } from "@/components/home/CtaSupply";
import PlatformPricingBlock from "@/components/home/PlatformPricingBlock";
import ContactForm from "@/components/blocks/ContactForm";

interface PageProps {
  params: Promise<{
    locale: string;
  }>;
}

export default async function GlobalHomePage({ params }: PageProps) {
  const { locale } = await params;

  // Pre-fetch some data for SSR
  const [featuredAgents, rentApartments, saleApartments, locations, allTags, homepageData] = await Promise.all([
    getFeaturedAgents(4),
    getCuratedApartments("rent", locale, {}, 3),
    getCuratedApartments("sale", locale, {}, 3),
    getLocations(locale),
    getTags(locale),
    getHomepage(),
  ]);
  const tagOptions = allTags.map((tg) => ({ slug: tg.slug as string, title: tg.title as string }));

  const blocks = homepageData?.blocks || [];

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30 flex flex-col">
      <main className="flex-1">
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        {blocks.map((block: any, idx: number) => {
          switch (block.blockType) {
            case "platformHeroBanner":
              return (
                <HeroBanner 
                  key={idx} 
                  locations={locations} 
                  tags={tagOptions} 
                  title={block.title} 
                  subtitle={block.subtitle} 
                />
              );
            case "curatedCollections": {
              const hasFilter = block.apartmentsFilter && block.apartmentsFilter.length > 0;
              let parsedRent = rentApartments;
              let parsedSale = saleApartments;
              if (hasFilter) {
                 const apts = block.apartmentsFilter.map((ap: any) => typeof ap === 'object' ? ap : ({} as any)).filter((a: any) => a.id);
                 parsedRent = apts.filter((a: any) => a.listingType === 'rent');
                 parsedSale = apts.filter((a: any) => a.listingType === 'sale');
              }
              return (
                <CuratedCollections 
                  key={idx} 
                  initialRent={parsedRent} 
                  initialSale={parsedSale} 
                  title={block.title} 
                  description={block.description} 
                />
              );
            }
            case "marketSnapshot":
              return (
                <MarketSnapshot 
                  key={idx} 
                  title={block.title} 
                />
              );
            case "platformFeaturedAgents": {
              const agents = featuredAgents.slice(0, block.limit || 4);
              return (
                <FeaturedAgents 
                  key={idx} 
                  locale={locale} 
                  agents={agents} 
                  title={block.title} 
                />
              );
            }
            case "platformPricing":
              return (
                <PlatformPricingBlock 
                  key={idx} 
                  locale={locale} 
                  title={block.title} 
                  description={block.description} 
                  plansList={block.plansList}
                />
              );
            case "ctaSupply":
              return (
                <CtaSupply 
                  key={idx} 
                  title={block.title} 
                  description={block.description} 
                  buttonLabel={block.buttonLabel} 
                  buttonLink={block.buttonLink} 
                />
              );
            case "contactForm":
              return (
                <ContactForm 
                  key={idx} 
                  {...block} 
                  ownerId={undefined} // No specific owner for platform leads
                />
              );
            default:
              return null;
          }
        })}
        {/* Render defaults if CMS is completely empty */}
        {blocks.length === 0 && (
          <>
            <HeroBanner locations={locations} tags={tagOptions} />
            <CuratedCollections initialRent={rentApartments} initialSale={saleApartments} />
            <MarketSnapshot />
            <FeaturedAgents locale={locale} agents={featuredAgents} />
            <CtaSupply />
          </>
        )}
      </main>
    </div>
  );
}

