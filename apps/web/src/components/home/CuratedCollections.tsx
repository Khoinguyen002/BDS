"use client";

import React, { useState } from "react";
import { Apartment } from "@bds/shared/payload-types";
import { PropertyCard } from "@/components/blocks/PropertyCard";
import { FireIcon, HouseLineIcon, MedalIcon, CatIcon, ClockIcon, ArmchairIcon } from "@phosphor-icons/react/dist/ssr";
import { useTranslations } from "next-intl";

type CuratedCollectionsProps = {
  initialRent: Apartment[];
  initialSale: Apartment[];
};

export const CuratedCollections = ({ initialRent, initialSale }: CuratedCollectionsProps) => {
  const t = useTranslations();
  const [activeTab, setActiveTab] = useState<"sale" | "rent">("sale");

  const saleCollections = [
    { id: "cut_loss", label: t("home.collection_sale_cut_loss"), icon: <FireIcon weight="duotone" className="w-5 h-5 text-red-500" /> },
    { id: "new", label: t("home.collection_sale_new"), icon: <HouseLineIcon weight="duotone" className="w-5 h-5 text-blue-500" /> },
    { id: "pink_book", label: t("home.collection_sale_pink_book"), icon: <MedalIcon weight="duotone" className="w-5 h-5 text-yellow-500" /> },
  ];

  const rentCollections = [
    { id: "full", label: t("home.collection_rent_full"), icon: <ArmchairIcon weight="duotone" className="w-5 h-5 text-purple-500" /> },
    { id: "pet", label: t("home.collection_rent_pet"), icon: <CatIcon weight="duotone" className="w-5 h-5 text-orange-500" /> },
    { id: "free_hours", label: t("home.collection_rent_free_hours"), icon: <ClockIcon weight="duotone" className="w-5 h-5 text-green-500" /> },
  ];

  const activeCollections = activeTab === "sale" ? saleCollections : rentCollections;
  const activeApartments = activeTab === "sale" ? initialSale : initialRent;

  return (
    <section className="py-24 bg-background-subtle">
      <div className="container">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <h2 className="text-3xl font-bold tracking-tight mb-4">{t('apartments.featured_collection')}</h2>
            <div className="flex bg-background p-1 rounded-none w-fit border border-border">
              <button
                onClick={() => setActiveTab("sale")}
                className={`px-6 py-2 rounded-none text-sm font-medium transition-all ${activeTab === "sale" ? "bg-primary text-primary-foreground shadow-sm" : "text-foreground-muted hover:text-foreground"}`}
              >
                {t("home.tab_sale")}
              </button>
              <button
                onClick={() => setActiveTab("rent")}
                className={`px-6 py-2 rounded-none text-sm font-medium transition-all ${activeTab === "rent" ? "bg-primary text-primary-foreground shadow-sm" : "text-foreground-muted hover:text-foreground"}`}
              >
                {t("home.tab_rent")}
              </button>
            </div>
          </div>
          
          {/* Collection Pills */}
          <div className="flex flex-wrap gap-2">
            {activeCollections.map((col, idx) => (
              <button 
                key={col.id}
                className={`flex items-center gap-2 px-4 py-2 rounded-none border text-sm transition-all ${idx === 0 ? "border-primary bg-primary/5 text-primary" : "border-border bg-background hover:border-primary/50 text-foreground"}`}
              >
                {col.icon}
                <span className="font-medium">{col.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Property Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {activeApartments.map((apt) => {
            return (
              <PropertyCard key={apt.id} apartment={apt} />
            );
          })}
          {activeApartments.length === 0 && (
            <div className="col-span-full py-12 text-center text-foreground-muted">
              {t("apartments.no_properties")}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
