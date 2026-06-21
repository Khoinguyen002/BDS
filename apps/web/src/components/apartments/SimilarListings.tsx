"use client";

import { PropertyCard } from "@/components/blocks/PropertyCard";
import { Apartment } from "@bds/shared/payload-types";
import { useTranslations } from "next-intl";
import useEmblaCarousel from "embla-carousel-react";

type SimilarListingsProps = {
  apartments: Apartment[];
  agentSlug: string;
};

export const SimilarListings = ({
  apartments,
  agentSlug,
}: SimilarListingsProps) => {
  const t = useTranslations("apartments");

  const [emblaRef] = useEmblaCarousel({
    align: "start",
    dragFree: true,
    containScroll: "trimSnaps",
  });

  if (!apartments || apartments.length === 0) return null;

  return (
    <div className="flex flex-col gap-6 mt-6">
      <h3 className="font-bold">{t("similar_listings")}</h3>
      <div className="overflow-hidden w-full pb-4" ref={emblaRef}>
        <div className="flex gap-4">
          {apartments.map((apt) => (
            <div
              key={apt.id}
              className="flex-[0_0_85%] sm:flex-[0_0_calc(50%-0.5rem)] md:flex-[0_0_calc(33.333%-0.667rem)] lg:flex-[0_0_calc(25%-0.75rem)] min-w-0"
            >
              <PropertyCard apartment={apt} agentSlug={agentSlug} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
