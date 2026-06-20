import React from "react";
import { getFeaturedAgents, getCuratedApartments, getLocations, getTags } from "@/lib/payload-fetcher";
import HeroBanner from "@/components/blocks/HeroBanner";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { CuratedCollections } from "@/components/home/CuratedCollections";
import { MarketSnapshot } from "@/components/home/MarketSnapshot";
import { FeaturedAgents } from "@/components/home/FeaturedAgents";
import { CtaSupply } from "@/components/home/CtaSupply";

interface PageProps {
  params: Promise<{
    locale: string;
  }>;
}

export default async function GlobalHomePage({ params }: PageProps) {
  const { locale } = await params;

  // Pre-fetch some data for SSR
  const [featuredAgents, rentApartments, saleApartments, locations, allTags] = await Promise.all([
    getFeaturedAgents(4),
    getCuratedApartments("rent", locale, "", 3), // We can fetch basic curations here
    getCuratedApartments("sale", locale, "", 3),
    getLocations(locale),
    getTags(locale)
  ]);
  const tagOptions = allTags.map((tg) => ({ slug: tg.slug as string, title: tg.title as string }));

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30 flex flex-col">
      <SiteHeader brandName="Bất Động Sản" homeHref={`/${locale}`} />

      <main className="flex-1">
        {/* Block 1: Hero & Smart Search */}
        <HeroBanner locations={locations} tags={tagOptions} />
        
        {/* Block 2: Curated Collections */}
        <CuratedCollections initialRent={rentApartments} initialSale={saleApartments} />

        {/* Block 3: Market Snapshot */}
        <MarketSnapshot />

        {/* Block 4: Featured Agents */}
        <FeaturedAgents locale={locale} agents={featuredAgents} />

        {/* Block 5: Call to Action */}
        <CtaSupply />
      </main>
    </div>
  );
}

