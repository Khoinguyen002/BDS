import { notFound } from "next/navigation";
import Link from "next/link";
import { ThemeInjector } from "@/components/ThemeInjector";
import { getUserBySlug, getApartments, getLocations } from "@/lib/payload-fetcher";
import { ListApartmentsClient } from "@/components/blocks/ListApartmentsClient";
import { ArrowLeftIcon } from "@phosphor-icons/react/dist/ssr";
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
  const tCommon = await getTranslations("common");
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
  const propertyType = toStr(sp.propertyType);
  const listingType = toStr(sp.type);
  const locationParam = toStr(sp.location);
  const priceMin = toNum(sp.priceMin);
  const priceMax = toNum(sp.priceMax);
  const bedrooms = toNum(sp.bedrooms);

  const locationSlugs = locationParam
    ? locationParam.split(",").map((s) => s.trim()).filter(Boolean)
    : [];

  const allLocations = await getLocations(locale);
  let wardIds: number[] = [];
  if (locationSlugs.length > 0) {
    wardIds = resolveLocationSlugsToWardIds(locationSlugs, allLocations);
  }

  // Fetch all apartments for this agent with filters
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
      ownerSlug: agentSlug,
    },
    100,
  );

  return (
    <>
      <ThemeInjector theme={owner.theme} />
      <main className="min-h-screen bg-background">
        
        {/* Navigation */}
        <nav className="w-full bg-background/90 backdrop-blur-sm border-b border-border py-4 px-6 sticky top-0 z-50">
          <div className="container flex items-center justify-between">
            <Link
              href={`/${locale}/${agentSlug}`}
              className="group text-xs font-semibold uppercase tracking-widest text-foreground-muted hover:text-foreground flex items-center gap-2 transition-colors"
            >
              <ArrowLeftIcon weight="bold" className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
              {tCommon("back")}
            </Link>
            <div className="text-xs uppercase tracking-widest text-foreground-muted font-mono">
              {t('properties_found', { count: apartments.length })}
            </div>
          </div>
        </nav>

        <div className="py-16">
          <div className="container mb-12">
            <h1 className="text-4xl md:text-5xl font-medium tracking-tight text-foreground mb-4">
              {t('featured_collection')}
            </h1>
            <p className="text-lg text-foreground-muted">
              {t('managed_by', { brandName: owner.brandName })}
            </p>
          </div>

          <div className="container mb-12">
            <SearchFunnel locations={allLocations} agentSlug={agentSlug} />
          </div>

          {apartments.length > 0 ? (
            <ListApartmentsClient apartments={apartments} agentSlug={agentSlug} hideHeader={true} />
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
