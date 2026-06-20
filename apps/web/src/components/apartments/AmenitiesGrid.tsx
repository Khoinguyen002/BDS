"use client";

import React from "react";
import * as Icons from "@phosphor-icons/react/dist/ssr";
import { CheckCircle as CheckCircleIcon } from "@phosphor-icons/react/dist/ssr";
import { useTranslations } from "next-intl";
import { Amenity, Apartment } from "@bds/shared/payload-types";

type AmenitiesGridProps = {
  amenities?: NonNullable<Apartment["amenities"]>;
};

export const AmenitiesGrid = ({ amenities }: AmenitiesGridProps) => {
  const t = useTranslations("apartments");
  if (!amenities || amenities.length === 0) return null;

  const validAmenities = amenities.filter((a): a is Amenity => typeof a === 'object' && a !== null);
  
  if (validAmenities.length === 0) return null;

  const internal = validAmenities.filter(a => a.category === 'internal');
  const external = validAmenities.filter(a => a.category === 'external');

  const renderGrid = (items: Amenity[]) => (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {items.map((amenity, idx) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const IconComponent = (Icons as any)[amenity.icon] || CheckCircleIcon;
        return (
          <div key={idx} className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-none bg-background-subtle flex items-center justify-center shrink-0">
              <IconComponent weight="duotone" className="w-5 h-5 text-secondary" />
            </div>
            <span className="text-sm font-medium">{amenity.title}</span>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="flex flex-col gap-8">
      {internal.length > 0 && (
        <div>
          <h4 className="text-lg font-bold mb-4">{t("internal_amenities")}</h4>
          {renderGrid(internal)}
        </div>
      )}
      {external.length > 0 && (
        <div>
          <h4 className="text-lg font-bold mb-4">{t("external_amenities")}</h4>
          {renderGrid(external)}
        </div>
      )}
    </div>
  );
};
