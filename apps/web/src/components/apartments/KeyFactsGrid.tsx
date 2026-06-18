import React from "react";
import { CompassIcon, BuildingsIcon, ArrowsOutIcon, BedIcon, BathtubIcon, Armchair as ArmchairIcon } from "@phosphor-icons/react/dist/ssr";
import { useTranslations } from "next-intl";

import { Apartment } from "@bds/shared/payload-types";

type KeyFactsProps = {
  apartment: Apartment;
};

export const KeyFactsGrid = ({ apartment }: KeyFactsProps) => {
  const t = useTranslations("apartments");
  const keyFacts = apartment.keyFacts;
  if (!keyFacts) return null;

  let facts: { icon: React.ReactNode; label: string; value: string | React.ReactNode }[] = [];

  if (apartment.propertyType === "boarding_room") {
    facts = [
      {
        icon: <ArrowsOutIcon weight="duotone" className="w-5 h-5 text-primary" />,
        label: t("area"),
        value: keyFacts.area ? `${keyFacts.area} m²` : "-",
      },
      {
        icon: <BathtubIcon weight="duotone" className="w-5 h-5 text-primary" />,
        label: t("bathroom_type"),
        value: keyFacts.bathroomType ? t(`bathroom_${keyFacts.bathroomType}`) : "-",
      },
      {
        icon: <BuildingsIcon weight="duotone" className="w-5 h-5 text-primary" />,
        label: t("floor_level"),
        value: keyFacts.floorLevel ? t(`floor_${keyFacts.floorLevel}`) : "-",
      },
    ];
  } else if (apartment.propertyType === "land_house") {
    facts = [
      {
        icon: <ArrowsOutIcon weight="duotone" className="w-5 h-5 text-primary" />,
        label: t("land_area"),
        value: keyFacts.landArea ? `${keyFacts.landArea} m²` : "-",
      },
      {
        icon: <ArrowsOutIcon weight="duotone" className="w-5 h-5 text-primary" />,
        label: t("usable_area"),
        value: keyFacts.usableArea ? `${keyFacts.usableArea} m²` : "-",
      },
      {
        icon: <CompassIcon weight="duotone" className="w-5 h-5 text-primary" />,
        label: t("frontage_width"),
        value: keyFacts.frontageWidth ? `${keyFacts.frontageWidth} m` : "-",
      },
      {
        icon: <CompassIcon weight="duotone" className="w-5 h-5 text-primary" />,
        label: t("depth"),
        value: keyFacts.depth ? `${keyFacts.depth} m` : "-",
      },
      {
        icon: <BuildingsIcon weight="duotone" className="w-5 h-5 text-primary" />,
        label: t("num_floors"),
        value: keyFacts.numFloors ? `${keyFacts.numFloors}` : "-",
      },
      {
        icon: <CompassIcon weight="duotone" className="w-5 h-5 text-primary" />,
        label: t("house_direction"),
        value: keyFacts.direction ? t(`direction_${keyFacts.direction}`) : "-",
      },
    ];
  } else {
    // Default: Apartment
    facts = [
      {
        icon: <CompassIcon weight="duotone" className="w-5 h-5 text-primary" />,
        label: t("direction"),
        value: keyFacts.direction || "-",
      },
      {
        icon: <BuildingsIcon weight="duotone" className="w-5 h-5 text-primary" />,
        label: t("floor_level"),
        value: keyFacts.floorLevel ? t(`floor_${keyFacts.floorLevel}`) : "-",
      },
      {
        icon: <ArrowsOutIcon weight="duotone" className="w-5 h-5 text-primary" />,
        label: t("area"),
        value: keyFacts.area ? `${keyFacts.area} m²` : "-",
      },
      {
        icon: <BedIcon weight="duotone" className="w-5 h-5 text-primary" />,
        label: t("bedrooms"),
        value: keyFacts.bedrooms || "-",
      },
      {
        icon: <BathtubIcon weight="duotone" className="w-5 h-5 text-primary" />,
        label: t("bathrooms"),
        value: keyFacts.bathrooms || "-",
      },
    ];

    if (keyFacts.balconyDirection) {
      facts.splice(1, 0, {
        icon: <CompassIcon weight="duotone" className="w-5 h-5 text-primary" />,
        label: t("balcony_direction"),
        value: keyFacts.balconyDirection,
      });
    }
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {facts.map((fact, idx) => (
        <div key={idx} className="flex items-center gap-3 p-4 rounded-none bg-background-subtle border border-border/50 hover:border-primary/20 transition-colors">
          <div className="w-10 h-10 rounded-none bg-primary/10 flex items-center justify-center shrink-0">
            {fact.icon}
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-foreground-muted">{fact.label}</span>
            <span className="text-sm font-medium text-foreground">{fact.value}</span>
          </div>
        </div>
      ))}
    </div>
  );
};
