import React from "react";
import { Apartment } from "@bds/shared/payload-types";
import { PropertyCard } from "@/components/blocks/PropertyCard";

type SimilarListingsProps = {
  apartments: Apartment[];
  t: (key: string) => string;
  agentSlug: string;
};

export const SimilarListings = ({ apartments, t, agentSlug }: SimilarListingsProps) => {
  if (!apartments || apartments.length === 0) return null;

  return (
    <div className="flex flex-col gap-6 mt-12">
      <h3 className="text-2xl font-bold text-foreground">{t("similar_listings")}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {apartments.map((apt) => (
          <PropertyCard
            key={apt.id}
            apartment={apt}
            agentSlug={agentSlug}
          />
        ))}
      </div>
    </div>
  );
};
