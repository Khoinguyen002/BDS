"use client";

import { PropertyCard } from "@/components/blocks/PropertyCard";
import { Apartment } from "@bds/shared/payload-types";
import { useTranslations } from "next-intl";
import "swiper/css";
import "swiper/css/free-mode";
import { Swiper, SwiperSlide } from "swiper/react";

type SimilarListingsProps = {
  apartments: Apartment[];
  agentSlug: string;
};

export const SimilarListings = ({
  apartments,
  agentSlug,
}: SimilarListingsProps) => {
  const t = useTranslations("apartments");

  if (!apartments || apartments.length === 0) return null;

  return (
    <div className="flex flex-col gap-6 mt-6">
      <h3 className="font-bold">{t("similar_listings")}</h3>
      <Swiper
        grabCursor
        slidesPerView={1.2}
        spaceBetween={16}
        breakpoints={{
          768: { slidesPerView: 2 },
          1024: { slidesPerView: 4 },
        }}
        className="w-full"
      >
        {apartments.map((apt) => (
          <SwiperSlide key={apt.id} className="h-auto">
            <PropertyCard apartment={apt} agentSlug={agentSlug} />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};
