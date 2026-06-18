import React from "react";
import { Apartment } from "@bds/shared/payload-types";
import { resolveProfile, DETAIL_LAYOUT } from "@/lib/detail-layout";
import { getTranslations } from "next-intl/server";

// We need to import all potential blocks
import { KeyFactsGrid } from "./KeyFactsGrid";
import { PropertyDescription } from "./PropertyDescription";
import { DetailSpecsTable } from "./DetailSpecsTable";
import { LegalCard } from "./LegalCard";
import { AmenitiesGrid } from "./AmenitiesGrid";
// New Blocks (to be created in Phase 3)
import { CostBreakdown } from "./CostBreakdown";
import { LivingRules } from "./LivingRules";
import { FurnitureStatus } from "./FurnitureStatus";
import { FixedFees } from "./FixedFees";

export const DetailBody = async ({ apartment }: { apartment: Apartment }) => {
  const t = await getTranslations("apartments");
  const profile = resolveProfile(apartment);
  const blocks = DETAIL_LAYOUT[profile];

  return (
    <div className="flex flex-col divide-y divide-border/50">
      {blocks.map((blockKey) => {
        switch (blockKey) {
          case "keyFacts":
            return (
              <section key={blockKey} className="pb-8">
                <h2 className="text-2xl font-bold mb-6">{t("key_facts")}</h2>
                <KeyFactsGrid apartment={apartment} />
              </section>
            );
          
          case "overview":
            if (!apartment.details?.overview && !apartment.details?.highlights && !apartment.details?.landscape) return null;
            return (
              <section key={blockKey} className="py-8">
                <h2 className="text-2xl font-bold mb-6">{t("overview")}</h2>
                <PropertyDescription details={apartment.details} />
              </section>
            );

          case "cost":
            return <CostBreakdown key={blockKey} apartment={apartment} />;
            
          case "rules":
            return <LivingRules key={blockKey} apartment={apartment} />;

          case "furniture":
            return <FurnitureStatus key={blockKey} apartment={apartment} />;

          case "fees":
            return <FixedFees key={blockKey} apartment={apartment} />;

          case "specs":
            return (
              <section key={blockKey} className="py-8">
                <h2 className="text-2xl font-bold mb-6">{t("property_details")}</h2>
                <DetailSpecsTable apartment={apartment} />
              </section>
            );

          case "legal":
            if (!apartment.legal) return null;
            return (
              <section key={blockKey} className="py-8">
                <h2 className="text-2xl font-bold mb-6">{t("legal_status")}</h2>
                <LegalCard legal={apartment.legal} />
              </section>
            );

          case "amenities":
            if (!apartment.amenities || apartment.amenities.length === 0) return null;
            return (
              <section key={blockKey} className="py-8">
                <h2 className="text-2xl font-bold mb-6">{t("amenities")}</h2>
                <AmenitiesGrid amenities={apartment.amenities} />
              </section>
            );

          case "location":
            if (!apartment.location?.lat || !apartment.location?.lng) return null;
            return (
              <section key={blockKey} className="py-8">
                <h2 className="text-2xl font-bold mb-6">{t("location")}</h2>
                <div className="w-full h-80 rounded-none overflow-hidden bg-background-subtle">
                  <iframe
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    style={{ border: 0 }}
                    src={`https://www.google.com/maps?q=${apartment.location.lat},${apartment.location.lng}&z=15&output=embed`}
                    allowFullScreen
                  ></iframe>
                </div>
              </section>
            );

          default:
            return null;
        }
      })}
    </div>
  );
};
