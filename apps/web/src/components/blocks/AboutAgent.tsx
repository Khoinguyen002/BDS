import type { LandingPage, Media } from "@bds/shared/payload-types";
import Image from "next/image";
import RichTextRenderer from "./RichTextRenderer";
import { AnimatedSection } from "@/components/AnimatedSection";
import { env } from "@/env";
import { getTranslations } from "next-intl/server";

export default async function AboutAgent(
  props: Extract<
    NonNullable<LandingPage["blocks"]>[number],
    { blockType: "aboutAgent" }
  >,
) {
  const { content, avatar } = props;
  const t = await getTranslations("agent");
  const avatarImage = typeof avatar === "object" ? (avatar as Media) : null;
  const avatarUrl = avatarImage?.url 
    ? (avatarImage.url.startsWith("http") ? avatarImage.url : `${env.PAYLOAD_PUBLIC_SERVER_URL}${avatarImage.url}`)
    : "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=800&q=80";

  return (
    <section className="py-32 px-6 md:px-12 bg-background-subtle border-t border-border">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-16 md:gap-24 relative items-start">
        
        {/* Sticky Avatar Section */}
        <AnimatedSection direction="up" className="w-full md:w-[40%] md:sticky md:top-32 flex flex-col">
          <div className="inline-flex items-center gap-4 mb-8">
            <span className="w-12 h-[1px] bg-border-strong" />
            <span className="text-xs font-semibold uppercase tracking-widest text-foreground-secondary">
              {t('consultant')}
            </span>
          </div>

          <div className="relative w-full aspect-[3/4] bg-background-subtle">
            {avatarUrl && (
              <Image
                src={avatarUrl}
                alt={avatarImage?.filename || t('consultant')}
                fill
                className="object-cover grayscale hover:grayscale-0 transition-all duration-700"
                sizes="(max-width: 768px) 100vw, 40vw"
              />
            )}
          </div>
        </AnimatedSection>

        {/* Content Section */}
        <AnimatedSection delay={0.2} direction="up" className="w-full md:w-[60%] flex flex-col pt-12 md:pt-0">
          <div className="prose prose-lg dark:prose-invert max-w-[55ch] prose-zinc prose-p:font-light prose-p:leading-relaxed prose-headings:font-medium prose-headings:tracking-tight prose-a:text-[var(--theme-primary)] prose-a:no-underline hover:prose-a:underline">
            {content ? (
              <RichTextRenderer content={content} />
            ) : (
              <p className="text-2xl font-light text-foreground-muted">{t('updating_info')}</p>
            )}
          </div>
        </AnimatedSection>

      </div>
    </section>
  );
}
