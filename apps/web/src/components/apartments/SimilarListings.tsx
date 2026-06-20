import React from "react";
import { Apartment } from "@bds/shared/payload-types";
import { PropertyCard } from "@/components/blocks/PropertyCard";
import { useTranslations } from "next-intl";

type SimilarListingsProps = {
  apartments: Apartment[];
  agentSlug: string;
  propertyType?: string | null;
};

export const SimilarListings = ({ apartments, agentSlug, propertyType }: SimilarListingsProps) => {
  const t = useTranslations("apartments");
  if (!apartments || apartments.length === 0) return null;

  return (
    <div className="flex flex-col gap-6 mt-12">
      <h3 className="text-2xl font-bold text-foreground">
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        {propertyType ? t(`similar_${propertyType}` as any) : t("similar_listings")}
      </h3>
      <div className="flex overflow-x-auto snap-x snap-mandatory gap-6 pb-4 hide-scrollbar">
        {apartments.map((apt) => (
          <div key={apt.id} className="w-[85vw] shrink-0 snap-start md:w-[calc(50%-12px)] lg:w-[calc(25%-18px)]">
            <PropertyCard
              apartment={apt}
              agentSlug={agentSlug}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
