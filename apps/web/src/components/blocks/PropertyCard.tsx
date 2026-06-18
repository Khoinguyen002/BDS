"use client";

import React from "react";
import type { Apartment } from "@bds/shared/payload-types";
import Image from "next/image";
import Link from "next/link";
import { env } from "@/env";
import { MapPinIcon, ArrowsOutIcon, BedIcon, BathtubIcon } from "@phosphor-icons/react/dist/ssr";
import { useLocale, useTranslations } from "next-intl";

type PropertyCardProps = {
  apartment: Apartment;
  agentSlug?: string;
};

export const PropertyCard = ({ apartment, agentSlug }: PropertyCardProps) => {
  const locale = useLocale();
  const t = useTranslations("apartments");

  const formatVND = (price?: number | null) => {
    if (!price) return t("price_contact");
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const fallbackImage = "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80";
  let imageUrl = fallbackImage;
  if (
    apartment.gallery &&
    apartment.gallery.length > 0 &&
    apartment.gallery[0] &&
    typeof apartment.gallery[0] === "object" &&
    "url" in apartment.gallery[0] &&
    apartment.gallery[0].url
  ) {
    const url = apartment.gallery[0].url as string;
    imageUrl = url.startsWith("http")
      ? url
      : `${env.PAYLOAD_PUBLIC_SERVER_URL || "http://localhost:3001"}${url}`;
  }

  // The detail URL
  const href = agentSlug
    ? `/${locale}/${agentSlug}/apartments/${apartment.slug || apartment.id}`
    : `/${locale}/apartments/${apartment.slug || apartment.id}`;

  const price = apartment.priceBreakdown?.totalPrice || apartment.price;

  return (
    <Link href={href} className="group block bg-background-subtle rounded-3xl overflow-hidden border border-border/50 hover:border-primary/30 transition-all hover:-translate-y-1">
      <div className="relative w-full aspect-[4/3] overflow-hidden bg-zinc-100 dark:bg-zinc-900">
        <Image
          src={imageUrl}
          alt={apartment.title}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className="absolute top-4 left-4 bg-background/90 backdrop-blur-md px-3 py-1.5 rounded-full text-xs uppercase tracking-wider font-bold text-foreground">
          {t("for_sale") || "Đang Bán"}
        </div>
      </div>

      <div className="p-5 flex flex-col gap-3">
        <div className="flex justify-between items-start gap-4">
          <h3 className="text-lg font-medium tracking-tight text-foreground line-clamp-1 group-hover:text-primary transition-colors">
            {apartment.title}
          </h3>
        </div>

        <span className="text-xl font-bold text-primary tabular-nums">
          {formatVND(price)}
        </span>

        <div className="text-foreground-muted flex items-center gap-2 text-sm font-light mt-1 mb-2 line-clamp-1">
          <MapPinIcon weight="fill" className="w-4 h-4 shrink-0 text-primary/70" />
          <span>{apartment.address || t("contact_for_address")}</span>
        </div>

        {/* Small Key Facts Footer */}
        <div className="flex items-center gap-4 pt-4 border-t border-border/50 text-foreground-muted text-xs font-medium">
          {apartment.keyFacts?.area && (
            <div className="flex items-center gap-1.5">
              <ArrowsOutIcon weight="duotone" className="w-4 h-4" />
              {apartment.keyFacts.area} m²
            </div>
          )}
          {apartment.keyFacts?.bedrooms && (
            <div className="flex items-center gap-1.5">
              <BedIcon weight="duotone" className="w-4 h-4" />
              {apartment.keyFacts.bedrooms} PN
            </div>
          )}
          {apartment.keyFacts?.bathrooms && (
            <div className="flex items-center gap-1.5">
              <BathtubIcon weight="duotone" className="w-4 h-4" />
              {apartment.keyFacts.bathrooms} WC
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};
