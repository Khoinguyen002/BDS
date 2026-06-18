import React from "react";

import { Apartment } from "@bds/shared/payload-types";

type DetailSpecsTableProps = {
  keyFacts?: Apartment["keyFacts"];
  t: (key: string) => string;
};

export const DetailSpecsTable = ({ keyFacts, t }: DetailSpecsTableProps) => {
  if (!keyFacts) return null;

  const specs = [
    { label: t("area"), value: keyFacts.area ? `${keyFacts.area} m²` : null },
    { label: t("bedrooms"), value: keyFacts.bedrooms },
    { label: t("bathrooms"), value: keyFacts.bathrooms },
    { label: t("direction"), value: keyFacts.direction },
    { label: t("balcony_direction"), value: keyFacts.balconyDirection },
    { label: t("floor_level"), value: keyFacts.floorLevel ? t(`floor_${keyFacts.floorLevel}`) : null },
  ].filter(spec => spec.value);

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
