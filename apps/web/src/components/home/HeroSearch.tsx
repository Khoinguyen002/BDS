"use client";

import React from "react";
import { motion } from "motion/react";
import { useTranslations } from "next-intl";
import { SearchFunnel } from "./SearchFunnel";

import type { Location } from "@bds/shared/payload-types";

type HeroSearchProps = {
  agentSlug?: string;
  locations?: Location[];
};

export const HeroSearch = ({ agentSlug, locations = [] }: HeroSearchProps) => {
  const t = useTranslations();
  


  return (
    <section className="relative w-full h-[80vh] min-h-[600px] flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=2000&q=80")' }}
      >
        <div className="absolute inset-0 bg-zinc-950/60" />
      </div>

      <div className="relative z-10 w-full container max-w-4xl flex flex-col items-center">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-6xl font-bold text-white text-center mb-6 tracking-tight"
        >
          {t('hero.explore_now')}
        </motion.h1>

        {/* Search Funnel */}
        <SearchFunnel agentSlug={agentSlug} locations={locations} />
      </div>
    </section>
  );
};
