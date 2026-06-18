import React from "react";

import { Apartment } from "@bds/shared/payload-types";
import { useTranslations } from "next-intl";

type DetailSpecsTableProps = {
  apartment: Apartment;
};

export const DetailSpecsTable = ({ apartment }: DetailSpecsTableProps) => {
  const t = useTranslations("apartments");
  const keyFacts = apartment.keyFacts;
  if (!keyFacts) return null;

  let rawSpecs: { label: string; value: string | number | null | undefined }[] = [];

  if (apartment.propertyType === "boarding_room") {
    rawSpecs = [
      { label: t("area"), value: keyFacts.area ? `${keyFacts.area} m²` : null },
      { label: t("floor_level"), value: keyFacts.floorLevel ? t(`floor_${keyFacts.floorLevel}`) : null },
      { label: t("bathroom_type"), value: keyFacts.bathroomType ? t(`bathroom_${keyFacts.bathroomType}`) : null },
    ];
  } else if (apartment.propertyType === "land_house") {
    rawSpecs = [
      { label: t("land_area"), value: keyFacts.landArea ? `${keyFacts.landArea} m²` : null },
      { label: t("usable_area"), value: keyFacts.usableArea ? `${keyFacts.usableArea} m²` : null },
      { label: t("frontage_width"), value: keyFacts.frontageWidth ? `${keyFacts.frontageWidth} m` : null },
      { label: t("depth"), value: keyFacts.depth ? `${keyFacts.depth} m` : null },
      { label: t("num_floors"), value: keyFacts.numFloors },
      { label: t("num_basements"), value: keyFacts.numBasements },
      { label: t("house_direction"), value: keyFacts.direction ? t(`direction_${keyFacts.direction}`) : null },
      { label: t("has_rooftop"), value: keyFacts.hasRooftop ? "Có" : "Không" },
      { label: t("structure_type"), value: keyFacts.structureType ? t(`structure_${keyFacts.structureType}`) : null },
      { label: t("alley_width"), value: keyFacts.alleyWidth ? `${keyFacts.alleyWidth} m` : null },
      { label: t("is_main_road"), value: keyFacts.isMainRoad ? "Có" : null },
      { label: t("is_business_facade"), value: keyFacts.isBusinessFacade ? "Có" : null },
    ];
  } else {
    // Default Apartment
    rawSpecs = [
      { label: t("area"), value: keyFacts.area ? `${keyFacts.area} m²` : null },
      { label: t("bedrooms"), value: keyFacts.bedrooms },
      { label: t("bathrooms"), value: keyFacts.bathrooms },
      { label: t("direction"), value: keyFacts.direction },
      { label: t("balcony_direction"), value: keyFacts.balconyDirection },
      { label: t("floor_level"), value: keyFacts.floorLevel ? t(`floor_${keyFacts.floorLevel}`) : null },

      { label: t("handover_year"), value: keyFacts.handoverYear },
      { label: t("building_quality"), value: keyFacts.buildingQuality ? t(`quality_${keyFacts.buildingQuality}`) : null },
    ];
  }

  const specs = rawSpecs.filter(spec => spec.value !== null && spec.value !== undefined && spec.value !== "");

  if (specs.length === 0) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
      {specs.map((spec, idx) => (
        <div key={idx} className="flex justify-between items-center py-3 border-b border-border/50">
          <span className="text-foreground-muted">{spec.label}</span>
          <span className="font-medium text-foreground">{spec.value}</span>
        </div>
      ))}
    </div>
  );
};
