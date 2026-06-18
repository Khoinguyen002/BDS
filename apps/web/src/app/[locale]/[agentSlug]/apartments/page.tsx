import { notFound } from "next/navigation";
import Link from "next/link";
import { ThemeInjector } from "@/components/ThemeInjector";
import { getUserBySlug, getApartmentsByOwner } from "@/lib/payload-fetcher";
import { ListApartmentsClient } from "@/components/blocks/ListApartmentsClient";
import { ArrowLeftIcon } from "@phosphor-icons/react/dist/ssr";
import { getTranslations } from "next-intl/server";

type Props = {
  params: Promise<{ locale: string; agentSlug: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { agentSlug } = await params;
  const owner = await getUserBySlug(agentSlug);
  if (!owner) return { title: 'Not Found' };
  
  return {
    title: `Tất cả bất động sản - ${owner.brandName || agentSlug}`,
  }
}

export default async function ViewAllApartmentsPage({ params }: Props) {
  const { locale, agentSlug } = await params;
  const tCommon = await getTranslations({ locale, namespace: "common" });
  const t = await getTranslations({ locale, namespace: "apartments" });

  const owner = await getUserBySlug(agentSlug);
  if (!owner) {
    notFound();
  }

  // Fetch all apartments for this agent (limit 100 for now)
  const apartments = await getApartmentsByOwner(owner.id, locale, 100);

  return (
    <>
      <ThemeInjector theme={owner.theme} />
      <main className="min-h-screen bg-background">
        
        {/* Navigation */}
        <nav className="w-full bg-background/90 backdrop-blur-sm border-b border-border py-4 px-6 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <Link
              href={`/${locale}/${agentSlug}`}
              className="group text-xs font-semibold uppercase tracking-widest text-foreground-muted hover:text-foreground flex items-center gap-2 transition-colors"
            >
              <ArrowLeftIcon weight="bold" className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
              {tCommon("back")}
            </Link>
            <div className="text-xs uppercase tracking-widest text-foreground-muted font-mono">
              {owner.brandName}
            </div>
          </div>
        </nav>

        <div className="max-w-7xl mx-auto px-4 md:px-8 py-16">
          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-medium tracking-tight text-foreground mb-4">
              {t('featured_collection')}
            </h1>
            <p className="text-base text-foreground-secondary font-light">
              {t('managed_by', { brandName: owner.brandName })}
            </p>
          </div>

          {/* Simple Filter UI Placeholder */}
          <div className="w-full flex gap-4 mb-12 border-b border-border pb-6">
            <select className="bg-background-subtle border border-border text-sm px-4 py-2 outline-none text-foreground">
              <option value="">{t('status')}</option>
              <option value="sale">{t('for_sale')}</option>
              <option value="rent">{t('for_rent')}</option>
            </select>
            <select className="bg-background-subtle border border-border text-sm px-4 py-2 outline-none text-foreground">
              <option value="">{t('price_range')}</option>
              <option value="asc">{t('price_asc')}</option>
              <option value="desc">{t('price_desc')}</option>
            </select>
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
