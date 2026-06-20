"use client";

import React from "react";
import { Apartment } from "@bds/shared/payload-types";
import { PropertyCard } from "@/components/blocks/PropertyCard";
import { DragScrollContainer } from "@/components/ui/DragScrollContainer";
import { useTranslations } from "next-intl";

type SimilarListingsProps = {
  apartments: Apartment[];
  agentSlug: string;
};

export const SimilarListings = ({ apartments, agentSlug }: SimilarListingsProps) => {
  const t = useTranslations("apartments");

  if (!apartments || apartments.length === 0) return null;

  return (
    <div className="flex flex-col gap-6 mt-6">
      <h3 className="text-xl font-bold text-foreground">
        {t("similar_listings")}
      </h3>
      <DragScrollContainer className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-4 hide-scrollbar">
        {apartments.map((apt) => (
          <div key={apt.id} className="w-[80vw] shrink-0 snap-start md:w-[calc(50%-8px)] lg:w-[calc(25%-12px)]">
            <PropertyCard
              apartment={apt}
              agentSlug={agentSlug}
            />
          </div>
        ))}
      </DragScrollContainer>
    </div>
  );
};
