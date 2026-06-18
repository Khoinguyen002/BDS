"use client";

import React, { useState } from "react";
import { motion } from "motion/react";
import { MagnifyingGlassIcon } from "@phosphor-icons/react/dist/ssr";
import { useTranslations } from "next-intl";

export const HeroSearch = () => {
  const t = useTranslations();
  const [activeTab, setActiveTab] = useState<"sale" | "rent">("sale");
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.SyntheticEvent) => {
    e.preventDefault();
    // In a real app, this would push to /search?type=sale&q=...
    console.log(`Searching for ${searchQuery} in ${activeTab}`);
  };

  return (
    <section className="relative w-full h-[80vh] min-h-[600px] flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=2000&q=80")' }}
      >
        <div className="absolute inset-0 bg-black/50" />
      </div>

      <div className="relative z-10 w-full max-w-4xl px-4 flex flex-col items-center">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-6xl font-bold text-white text-center mb-6 tracking-tight"
        >
          {t('hero.explore_now')}
        </motion.h1>

        {/* Search Funnel */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="w-full bg-background rounded-2xl p-2 md:p-4 shadow-2xl"
        >
          {/* Tabs */}
          <div className="flex gap-2 mb-4 border-b border-border pb-2">
            <button
              onClick={() => setActiveTab("sale")}
              className={`px-6 py-2 rounded-full text-sm font-semibold transition-colors ${
                activeTab === "sale" 
                  ? "bg-primary text-primary-foreground" 
                  : "text-foreground-muted hover:bg-background-subtle"
              }`}
            >
              {t("home.tab_sale")}
            </button>
            <button
              onClick={() => setActiveTab("rent")}
              className={`px-6 py-2 rounded-full text-sm font-semibold transition-colors ${
                activeTab === "rent" 
                  ? "bg-primary text-primary-foreground" 
                  : "text-foreground-muted hover:bg-background-subtle"
              }`}
            >
              {t("home.tab_rent")}
            </button>
          </div>

          {/* Search Input */}
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground-muted" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={activeTab === "sale" ? t("home.search_placeholder_sale") : t("home.search_placeholder_rent")}
                className="w-full h-14 pl-12 pr-4 rounded-xl bg-background-subtle border border-border focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-foreground"
              />
            </div>
            <button 
              type="submit"
              className="h-14 px-8 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors shrink-0"
            >
              {t("home.search_btn")}
            </button>
          </form>
        </motion.div>
      </div>
    </section>
  );
};
