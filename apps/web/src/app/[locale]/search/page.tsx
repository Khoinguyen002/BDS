import React from "react";
import { ThemeInjector } from "@/components/ThemeInjector";
import { getApartments, getLocations } from "@/lib/payload-fetcher";
import { resolveLocationSlugsToWardIds } from "@/lib/location-utils";
import { SearchFunnel } from "@/components/home/SearchFunnel";
import { ListApartmentsClient } from "@/components/blocks/ListApartmentsClient";
import { getTranslations } from "next-intl/server";

export async function generateMetadata() {
  const t = await getTranslations("home");
  return {
    title: t("search_btn") || `Tìm kiếm bất động sản`,
  };
}

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

function toNum(val: string | string[] | undefined): number | undefined {
  if (!val || Array.isArray(val)) return undefined;
  const n = Number(val);
  return isNaN(n) ? undefined : n;
}

function toStr(val: string | string[] | undefined): string {
  if (!val || Array.isArray(val)) return "";
  return val;
}

export default async function SearchPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const sp = await searchParams;

  // ─── Parse URL params ──────────────────────────────────────
  const q = toStr(sp.q);
  const propertyType = toStr(sp.propertyType); // apartment | boarding_room | land_house
  const listingType = toStr(sp.type);           // sale | rent
  const locationParam = toStr(sp.location);     // "slug1,slug2,slug3"
  const priceMin = toNum(sp.priceMin);
  const priceMax = toNum(sp.priceMax);
  const bedrooms = toNum(sp.bedrooms);

  // ─── Resolve location slugs → ward IDs ────────────────────
  const locationSlugs = locationParam
    ? locationParam.split(",").map((s) => s.trim()).filter(Boolean)
    : [];

  const allLocations = await getLocations(locale);
  let wardIds: number[] = [];
  if (locationSlugs.length > 0) {
    wardIds = resolveLocationSlugsToWardIds(locationSlugs, allLocations);
  }

  // ─── Fetch apartments ──────────────────────────────────────
  const apartments = await getApartments(
    locale,
    {
      q: q || undefined,
      propertyType: propertyType || undefined,
      listingType: listingType || undefined,
      wardIds: wardIds.length > 0 ? wardIds : undefined,
      priceMin,
      priceMax,
      bedrooms,
    },
    100,
  );

  return (
    <>
      <ThemeInjector />
      <main className="min-h-screen bg-background pt-24 pb-16">
        <div className="container">
          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl font-medium tracking-tight text-foreground mb-4">
              Tìm kiếm bất động sản
            </h1>
            <p className="text-lg text-foreground-muted max-w-2xl mt-4">
              Khám phá danh sách các bất động sản đa dạng trên nền tảng.
            </p>
          </div>

          <div className="mb-12">
            <SearchFunnel locations={allLocations} />
          </div>

          <ListApartmentsClient
            apartments={apartments}
            initialFilterListing={listingType || "all"}
            initialFilterType={propertyType || "all"}
            hideHeader={true}
          />
        </div>
      </main>
    </>
  );
}
