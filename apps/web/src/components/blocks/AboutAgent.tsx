import type { LandingPage, Media } from "@bds/shared/payload-types";
import Image from "next/image";
import RichTextRenderer from "./RichTextRenderer";
import { AnimatedSection } from "@/components/AnimatedSection";
import { env } from "@/env";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";

export default async function AboutAgent(
  props: Extract<
    NonNullable<LandingPage["blocks"]>[number],
    { blockType: "aboutAgent" }
  >,
) {
  const { 
    content, 
    avatar,
    agentName,
    agentTitle,
    phoneNumber,
    zaloLink,
    experienceYears,
    successfulDeals
  } = props as any; // eslint-disable-line @typescript-eslint/no-explicit-any
  const t = await getTranslations("agent");
  const tApt = await getTranslations("apartments");
  const avatarImage = typeof avatar === "object" ? (avatar as Media) : null;
  const avatarUrl = avatarImage?.url 
    ? (avatarImage.url.startsWith("http") ? avatarImage.url : `${env.NEXT_PUBLIC_SERVER_URL}${avatarImage.url}`)
    : "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=800&q=80";

  return (
    <section className="py-24 bg-zinc-50 dark:bg-zinc-900 border-y border-border">
      <div className="container flex flex-col md:flex-row gap-16 md:gap-24 relative items-start">
        
        {/* Sticky Avatar Section */}
        <AnimatedSection direction="up" className="w-full md:w-[40%] md:sticky md:top-32 flex flex-col">
          <div className="inline-flex items-center gap-4 mb-8">
            <span className="w-12 h-px bg-border-strong" />
            <span className="text-xs font-semibold uppercase tracking-widest text-foreground-secondary">
              {agentTitle || t('consultant')}
            </span>
          </div>

          <div className="relative w-full aspect-3/4 bg-background-subtle border border-border/50 p-2">
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
        <AnimatedSection delay={0.2} direction="up" className="w-full md:w-[60%] flex flex-col pt-8 md:pt-0">
          
          {agentName && (
            <h2 className="mb-8">
              {agentName}
            </h2>
          )}

          <div className="prose prose-lg dark:prose-invert max-w-[55ch] prose-zinc prose-p:font-light prose-p:leading-relaxed prose-headings:font-medium prose-headings:tracking-tight prose-a:text-(--theme-primary) prose-a:no-underline hover:prose-a:underline">
            {content ? (
              <RichTextRenderer content={content} />
            ) : (
              <p className="text-base font-light text-foreground-muted">{t('updating_info')}</p>
            )}
          </div>

          {/* Stats Section */}
          {(experienceYears || successfulDeals) && (
            <div className="flex gap-12 mt-12 pt-8 border-t border-border/50">
              {experienceYears && (
                <div className="flex flex-col gap-1">
                  <span className="text-3xl font-bold tabular-nums text-foreground">{experienceYears}+</span>
                  <span className="text-sm font-medium uppercase tracking-wider text-foreground-muted">{t('experience_years')}</span>
                </div>
              )}
              {successfulDeals && (
                <div className="flex flex-col gap-1">
                  <span className="text-3xl font-bold tabular-nums text-foreground">{successfulDeals}</span>
                  <span className="text-sm font-medium uppercase tracking-wider text-foreground-muted">{t('transactions')}</span>
                </div>
              )}
            </div>
          )}

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mt-12">
            <Button asChild className="w-full sm:w-auto min-w-[160px]">
              <a href={`tel:${phoneNumber || ""}`}>
                {tApt("call_now") || "Gọi điện"}
              </a>
            </Button>
            <Button asChild variant="secondary" className="w-full sm:w-auto min-w-[160px]">
              <a href={zaloLink || `https://zalo.me/${phoneNumber || ""}`} target="_blank" rel="noreferrer">
                Chat Zalo
              </a>
            </Button>
          </div>
        </AnimatedSection>

      </div>
    </section>
  );
}
