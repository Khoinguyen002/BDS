import React from "react";
import { getFeaturedAgents, getCuratedApartments } from "@/lib/payload-fetcher";
import { HeroSearch } from "@/components/home/HeroSearch";
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
  const [featuredAgents, rentApartments, saleApartments] = await Promise.all([
    getFeaturedAgents(4),
    getCuratedApartments("rent", locale, "", 3), // We can fetch basic curations here
    getCuratedApartments("sale", locale, "", 3)
  ]);

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30 flex flex-col">
      
      <main className="flex-1">
        {/* Block 1: Hero & Smart Search */}
        <HeroSearch />
        
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
