import { notFound } from 'next/navigation';
import { resolveAgent } from '@/lib/resolver';
import HeroBanner from '@/components/blocks/HeroBanner';
import AboutAgent from '@/components/blocks/AboutAgent';
import ListApartments from '@/components/blocks/ListApartments';
import ContactForm from '@/components/blocks/ContactForm';

type Props = {
  params: Promise<{ agentSlug: string }>
}

export async function generateMetadata({ params }: Props) {
  const { agentSlug } = await params;
  const landingPage = await resolveAgent(agentSlug);
  
  if (!landingPage) return { title: 'Not Found' };
  
  const heroBlock = landingPage.blocks?.find((b: any) => b.blockType === 'heroBanner');
  
  return {
    title: heroBlock?.title || `Agent ${agentSlug}`,
    description: heroBlock?.subtitle || `Bất động sản by ${agentSlug}`,
  }
}

export default async function AgentPage({ params }: Props) {
  const { agentSlug } = await params;
  
  const landingPage = await resolveAgent(agentSlug);
  if (!landingPage) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {landingPage.blocks?.map((block: any, idx: number) => {
        switch (block.blockType) {
          case 'heroBanner':
            return <HeroBanner key={idx} {...block} />;
          case 'aboutAgent':
            return <AboutAgent key={idx} {...block} />;
          case 'listApartments':
            return <ListApartments key={idx} {...block} ownerId={landingPage.owner} />;
          case 'contactForm':
            return <ContactForm key={idx} {...block} ownerId={landingPage.owner} />;
          default:
            return null;
        }
      })}
    </main>
  );
}
