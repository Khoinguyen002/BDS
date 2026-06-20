import { notFound } from "next/navigation";
import { ThemeInjector } from "@/components/ThemeInjector";
import { getUserBySlug, getApartments, getLocations, getTags } from "@/lib/payload-fetcher";
import { ListApartmentsClient } from "@/components/blocks/ListApartmentsClient";
import { getTranslations } from "next-intl/server";
import { SearchFunnel } from "@/components/home/SearchFunnel";
import { resolveLocationSlugsToWardIds } from "@/lib/location-utils";

type Props = {
  params: Promise<{ locale: string; agentSlug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata({ params }: Props) {
  const { agentSlug } = await params;
  const owner = await getUserBySlug(agentSlug);
  if (!owner) return { title: 'Not Found' };
  
  return {
    title: `Tất cả bất động sản - ${owner.brandName || agentSlug}`,
  }
}

export default async function ViewAllApartmentsPage({ params, searchParams }: Props) {
  const { locale, agentSlug } = await params;
  const sp = await searchParams;
  const t = await getTranslations("apartments");

  const owner = await getUserBySlug(agentSlug);
  if (!owner) {
    notFound();
  }

  // ─── Parse URL params ──────────────────────────────────────
  const toStr = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) || "";
  const toNum = (v: string | string[] | undefined) => {
    const s = toStr(v);
    const n = parseInt(s, 10);
    return isNaN(n) ? undefined : n;
  };

  const q = toStr(sp.q);
  const tagSlug = toStr(sp.tag);
  const listingType = toStr(sp.type);
  const locationParam = toStr(sp.location);
  const priceMin = toNum(sp.priceMin);
  const priceMax = toNum(sp.priceMax);
  const bedrooms = toNum(sp.bedrooms);

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

  // Fetch all apartments for this agent with filters
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
      ownerSlug: agentSlug,
    },
    100,
  );

  return (
    <>
      <ThemeInjector theme={owner.theme} />
      <main className="min-h-screen bg-background">
        <div className="pt-24 pb-16 md:pt-28">
          <div className="container mb-12">
            <h1 className="text-2xl md:text-5xl font-medium tracking-tight text-foreground mb-2 md:mb-4">
              {t('featured_collection')}
            </h1>
            <p className="text-sm md:text-lg text-foreground-muted">
              {t('managed_by', { brandName: owner.brandName })}
              <span className="text-foreground-muted/70"> · {t('properties_found', { count: apartments.length })}</span>
            </p>
          </div>

          <div className="container mb-12">
            <SearchFunnel locations={allLocations} tags={tagOptions} agentSlug={agentSlug} compactMobile />
          </div>

          {apartments.length > 0 ? (
            <ListApartmentsClient apartments={apartments} agentSlug={agentSlug} hideHeader layout="grid" />
          ) : (
            <div className="py-24 text-center border border-dashed border-border text-foreground-muted">
              {t('no_properties')}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
