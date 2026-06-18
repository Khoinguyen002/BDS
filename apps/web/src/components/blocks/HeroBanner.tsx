"use client";

import type { LandingPage, Media, Location } from "@bds/shared/payload-types";
import Image from "next/image";
import { env } from "@/env";
import { motion } from "motion/react";
import { SearchFunnel } from "@/components/home/SearchFunnel";

export default function HeroBanner(
  props: Extract<
    NonNullable<LandingPage["blocks"]>[number],
    { blockType: "heroBanner" }
  > & { agentSlug?: string; locations?: Location[] }
) {
  const { title, subtitle, backgroundImage, agentSlug, locations = [] } = props;

  const bgImage = typeof backgroundImage === "object" ? (backgroundImage as Media) : null;
  const bgUrl = bgImage?.url 
    ? (bgImage.url.startsWith("http") ? bgImage.url : `${env.PAYLOAD_PUBLIC_SERVER_URL}${bgImage.url}`)
    : "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=2000&q=80";

  return (
    <section className="relative w-full min-h-[100dvh] flex items-center justify-center overflow-hidden">
      {/* Full Screen Background Image */}
      <div className="absolute inset-0 w-full h-full">
        {bgUrl && (
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
        )}
      </div>

      {/* Floating Text Content */}
      <div className="relative z-10 w-full container flex flex-col items-center text-center mt-20">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          className="max-w-3xl flex flex-col items-center"
        >
          {title && (
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-semibold tracking-tighter text-white leading-[1.1] mb-6">
              {title}
            </h1>
          )}
          {subtitle && (
            <p className="text-lg md:text-xl text-zinc-300 max-w-[42ch] font-light leading-relaxed mb-10 text-center">
              {subtitle}
            </p>
          )}

          <div className="w-full max-w-4xl text-left">
            <SearchFunnel agentSlug={agentSlug} locations={locations} />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
