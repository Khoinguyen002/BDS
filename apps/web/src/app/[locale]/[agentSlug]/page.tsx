import { notFound } from 'next/navigation';
import { getTranslations } from "next-intl/server";
import { resolveLandingPage } from '@/lib/resolver';
import { getLocations, getTags } from '@/lib/payload-fetcher';
import HeroBanner from '@/components/blocks/HeroBanner';
import AboutAgent from '@/components/blocks/AboutAgent';
import ListApartments from '@/components/blocks/ListApartments';
import ContactForm from '@/components/blocks/ContactForm';
import type { LandingPage } from '@bds/shared/payload-types';

type Props = {
  params: Promise<{ agentSlug: string, locale: string }>
}

export async function generateMetadata({ params }: Props) {
  const { agentSlug } = await params;
  const landingPage = await resolveLandingPage(agentSlug);
  if (!landingPage) return { title: 'Not Found' };
  
  const heroBlock = landingPage.blocks?.find((b: NonNullable<LandingPage['blocks']>[number]) => b.blockType === 'heroBanner');
  const t = await getTranslations("agent");
  
  return {
    title: heroBlock?.title || `Landing Page`,
    description: heroBlock?.subtitle || t("real_estate_by", { brandName: agentSlug }),
  }
}

export default async function AgentPage({
  params,
}: {
  params: Promise<{ locale: string; agentSlug: string }>;
}) {
  const { agentSlug, locale } = await params;
  
  const landingPage = await resolveLandingPage(agentSlug);
  if (!landingPage) {
    notFound();
  }

  const [locations, allTags] = await Promise.all([getLocations(locale), getTags(locale)]);
  const tagOptions = allTags.map((tg) => ({ slug: tg.slug as string, title: tg.title as string }));

  return (
    <main className="bg-background">
      {landingPage.blocks?.map((block: NonNullable<LandingPage['blocks']>[number], idx: number) => {
        switch (block.blockType) {
          case 'heroBanner':
            return <HeroBanner key={idx} {...block} agentSlug={agentSlug} locations={locations} tags={tagOptions} />;
          case 'aboutAgent':
            return <AboutAgent key={idx} {...block} />;
          case 'listApartments':
            return <ListApartments key={idx} {...block} ownerId={landingPage.owner} agentSlug={agentSlug} />;
          case 'contactForm':
            return <ContactForm key={idx} {...block} ownerId={landingPage.owner} />;
          default:
            return null;
        }
      })}
    </main>
  );
}
