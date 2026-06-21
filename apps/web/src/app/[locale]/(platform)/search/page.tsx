import React from "react";
import { ThemeInjector } from "@/components/ThemeInjector";
import { getApartments, getLocations, getTags } from "@/lib/payload-fetcher";
import { resolveLocationSlugsToWardIds } from "@/lib/location-utils";
import { SearchFunnel } from "@/components/home/SearchFunnel";
import { ListApartmentsClient } from "@/components/blocks/ListApartmentsClient";
import { getTranslations } from "next-intl/server";

export async function generateMetadata() {
  const t = await getTranslations("common");
  return {
    title: t("search.title") || `Tìm kiếm bất động sản`,
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
  const t = await getTranslations("common");

  // ─── Parse URL params ──────────────────────────────────────
  const q = toStr(sp.q);
  const tagSlug = toStr(sp.tag);
  const listingType = toStr(sp.type);           // sale | rent
  const locationParam = toStr(sp.location);     // "slug1,slug2,slug3"
  const priceMin = toNum(sp.priceMin);
  const priceMax = toNum(sp.priceMax);
  const bedrooms = toNum(sp.bedrooms);

  // ─── Resolve location slugs → ward IDs ────────────────────
  const locationSlugs = locationParam
    ? locationParam.split(",").map((s) => s.trim()).filter(Boolean)
    : [];

  const [allLocations, allTags] = await Promise.all([getLocations(locale), getTags(locale)]);
  let wardIds: number[] = [];
  if (locationSlugs.length > 0) {
    wardIds = resolveLocationSlugsToWardIds(locationSlugs, allLocations);
  }

  const tagId = tagSlug ? allTags.find((tg) => tg.slug === tagSlug)?.id : undefined;
  const tagOptions = allTags.map((tg) => ({ slug: tg.slug as string, title: tg.title as string }));

  // ─── Fetch apartments ──────────────────────────────────────
  const apartments = await getApartments(
    locale,
    {
      q: q || undefined,
      tagIds: tagId ? [tagId] : undefined,
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
            <h1 className="mb-4">
              {t("search.title")}
            </h1>
            <p className="text-lg text-foreground-muted max-w-2xl mt-4">
              {t("search.explore_desc")}
            </p>
          </div>

          <div className="mb-12">
            <SearchFunnel locations={allLocations} tags={tagOptions} compactMobile />
          </div>

          <ListApartmentsClient
            apartments={apartments}
            hideHeader
            layout="grid"
          />
        </div>
      </main>
    </>
  );
}
