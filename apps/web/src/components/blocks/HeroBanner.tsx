"use client";

import type { LandingPage, Media, Location } from "@bds/shared/payload-types";
import Image from "next/image";
import { env } from "@/env";
import { motion } from "motion/react";
import { SearchFunnel } from "@/components/home/SearchFunnel";
import { useTranslations } from "next-intl";

type CmsHeroProps = Extract<
  NonNullable<LandingPage["blocks"]>[number],
  { blockType: "heroBanner" }
>;

type HeroBannerProps = Partial<CmsHeroProps> & {
  agentSlug?: string;
  locations?: Location[];
  tags?: { slug: string; title: string }[];
};

const FALLBACK_BG =
  "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=2000&q=80";

export default function HeroBanner(props: HeroBannerProps) {
  const { title, subtitle, backgroundImage, agentSlug, locations = [], tags = [] } = props;
  const t = useTranslations();

  const bgImage =
    typeof backgroundImage === "object" ? (backgroundImage as Media) : null;
  const bgUrl = bgImage?.url
    ? bgImage.url.startsWith("http")
      ? bgImage.url
      : `${env.NEXT_PUBLIC_SERVER_URL}${bgImage.url}`
    : FALLBACK_BG;

  const displayTitle = title || t("hero.explore_now");

  return (
    <>
      {/* Hero Image + Title */}
      <section className="relative w-full min-h-[320px] md:min-h-[640px] lg:min-h-[760px] flex items-center justify-center overflow-hidden">
        {/* Full Screen Background Image */}
        <div className="absolute inset-0 w-full h-full">
          <motion.div
            initial={{ scale: 1.05, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true, amount: 0 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full h-full"
          >
            <Image
              src={bgUrl}
              alt={bgImage?.filename || "Bất động sản cao cấp"}
              fill
              className="object-cover"
              priority
              sizes="100vw"
            />
            {/* Gradient Overlay for Text Readability */}
            <div className="absolute inset-0 bg-linear-to-t from-zinc-950/90 via-zinc-950/40 to-zinc-950/20" />
          </motion.div>
        </div>

        {/* Floating Text Content */}
        <div className="relative z-10 w-full container flex flex-col items-center text-center mt-20">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{
              duration: 0.8,
              ease: [0.16, 1, 0.3, 1],
              delay: 0.2,
            }}
            className="max-w-4xl w-full flex flex-col items-center"
          >
            <h1 className="text-3xl md:text-6xl lg:text-7xl font-semibold tracking-tighter text-white leading-[1.1] mb-4 md:mb-6">
              {displayTitle}
            </h1>
            {subtitle && (
              <p className="text-base md:text-xl text-zinc-300 max-w-[42ch] font-light leading-relaxed mb-6 md:mb-10 text-center">
                {subtitle}
              </p>
            )}

            {/* Desktop: SearchFunnel inside hero */}
            <div className="w-full text-left hidden md:block">
              <SearchFunnel agentSlug={agentSlug} locations={locations} tags={tags} />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Mobile: SearchFunnel below hero as separate block */}
      <div className="md:hidden container -mt-6 relative z-20 pb-4">
        <SearchFunnel agentSlug={agentSlug} locations={locations} tags={tags} />
      </div>
    </>
  );
}

