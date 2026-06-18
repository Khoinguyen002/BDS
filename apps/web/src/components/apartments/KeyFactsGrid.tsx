import React from "react";
import { CompassIcon, BuildingsIcon, ArrowsOutIcon, BedIcon, BathtubIcon } from "@phosphor-icons/react/dist/ssr";

import { Apartment } from "@bds/shared/payload-types";

type KeyFactsProps = {
  keyFacts?: Apartment["keyFacts"];
  t: (key: string) => string;
};

export const KeyFactsGrid = ({ keyFacts, t }: KeyFactsProps) => {
  if (!keyFacts) return null;

  const facts = [
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

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {facts.map((fact, idx) => (
        <div key={idx} className="flex items-center gap-3 p-4 rounded-2xl bg-background-subtle border border-border/50 hover:border-primary/20 transition-colors">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
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
