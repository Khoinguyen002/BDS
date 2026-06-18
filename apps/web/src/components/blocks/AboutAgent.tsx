import type { LandingPage, Media } from "@bds/shared/payload-types";
import Image from "next/image";
import RichTextRenderer from "./RichTextRenderer";
import { env } from "@/env";

export default function AboutAgent(
  props: Extract<
    NonNullable<LandingPage["blocks"]>[number],
    { blockType: "aboutAgent" }
  >,
) {
  const { content, avatar } = props;
  const avatarImage = typeof avatar === "object" ? (avatar as Media) : null;
  const avatarUrl = avatarImage?.url 
    ? (avatarImage.url.startsWith("http") ? avatarImage.url : `${env.PAYLOAD_PUBLIC_SERVER_URL}${avatarImage.url}`)
    : "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=800&q=80";

  return (
    <section className="py-24 px-4 md:px-8 bg-zinc-50 dark:bg-zinc-950 relative">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-16 lg:gap-24">
        
        {/* Avatar Section */}
        <div className="w-full md:w-1/2 relative group">
          <div className="relative w-full aspect-4/5 max-w-md mx-auto md:mr-auto rounded-(--theme-radius) overflow-hidden shadow-2xl transition-transform duration-700 hover:scale-[1.02]">
            <div className="absolute inset-0 bg-black/5 z-10 group-hover:bg-transparent transition-colors duration-500" />
            {avatarUrl && (
              <Image
                src={avatarUrl}
                alt={avatarImage?.filename || "Agent Avatar"}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            )}
            
            {/* Elegant glass overlay badge */}
            <div className="absolute bottom-6 left-6 right-6 z-20 bg-white/70 dark:bg-black/50 backdrop-blur-md p-5 rounded-(--theme-radius) border border-white/20 shadow-lg translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white" style={{ backgroundColor: 'var(--theme-primary)' }}>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-zinc-600 dark:text-zinc-300 font-semibold mb-1">Chuyên Gia</p>
                  <p className="text-zinc-900 dark:text-white font-bold leading-none">Bất Động Sản</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="w-full md:w-1/2 space-y-8">
          <div className="inline-flex items-center gap-3">
            <span className="w-8 h-[2px]" style={{ backgroundColor: 'var(--theme-primary)' }} />
            <span className="uppercase tracking-widest text-sm font-semibold text-zinc-500 dark:text-zinc-400">
              Về Chúng Tôi
            </span>
          </div>
          
          <div className="text-lg md:text-xl text-zinc-600 dark:text-zinc-300 leading-relaxed font-light">
            {content ? (
              <RichTextRenderer content={content} />
            ) : (
              <p>Chưa có thông tin giới thiệu.</p>
            )}
          </div>
        </div>

      </div>
    </section>
  );
}
