import type { LandingPage, Media } from "@bds/shared/payload-types";
import Image from "next/image";
import { env } from "@/env";

export default function HeroBanner(
  props: Extract<
    NonNullable<LandingPage["blocks"]>[number],
    { blockType: "heroBanner" }
  >,
) {
  const { title, subtitle, backgroundImage } = props;

  // Type guard to check if backgroundImage is populated
  const bgImage =
    typeof backgroundImage === "object" ? (backgroundImage as Media) : null;
  const bgUrl = bgImage?.url 
    ? (bgImage.url.startsWith("http") ? bgImage.url : `${env.PAYLOAD_PUBLIC_SERVER_URL}${bgImage.url}`)
    : "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=2000&q=80";

  return (
    <section className="relative w-full h-[85vh] min-h-[600px] flex flex-col justify-end pb-24 md:pb-32 overflow-hidden">
      {/* Background Image with Parallax-like scale */}
      <div className="absolute inset-0 w-full h-full">
        {bgUrl && (
          <Image
            src={bgUrl}
            alt={bgImage?.filename || "Hero Background"}
            fill
            className="object-cover animate-image-scale"
            priority
            sizes="100vw"
          />
        )}
        {/* Subtle gradient overlay for text readability without darkening everything */}
        <div className="absolute inset-0 bg-linear-to-b from-black/10 via-transparent to-zinc-950/90 dark:to-zinc-950" />
      </div>

      {/* Content Container */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-12 flex flex-col items-start text-left">
        {title && (
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold text-white mb-6 tracking-tight drop-shadow-xl" style={{ fontFamily: "var(--font-sans)" }}>
            {title}
          </h1>
        )}
        {subtitle && (
          <p className="text-xl md:text-2xl text-zinc-200 max-w-2xl font-light drop-shadow-md animate-fade-in-up animation-delay-200">
            {subtitle}
          </p>
        )}

        {/* Call to action button */}
        <div className="mt-12 animate-fade-in-up animation-delay-400">
          <button 
            className="text-white font-semibold py-4 px-10 rounded-(--theme-radius) transition-all duration-300 shadow-lg hover:shadow-2xl hover:-translate-y-1 text-lg flex items-center gap-2 group"
            style={{ backgroundColor: 'var(--theme-primary)' }}
          >
            Khám Phá Ngay
            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}
