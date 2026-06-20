"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Image from "next/image";
import type { Media, Tag } from "@bds/shared/payload-types";
import {
  VirtualRealityIcon,
  CaretLeftIcon,
  CaretRightIcon,
} from "@phosphor-icons/react/dist/ssr";
import { useTranslations } from "next-intl";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperClass } from "swiper";
import "swiper/css";

type MediaGalleryProps = {
  gallery: (number | Media)[];
  tourUrl?: string | null;
  serverUrl: string;
  tags?: (number | Tag)[] | null;
  listingType?: "rent" | "sale" | null;
};

export const MediaGallery = ({
  gallery,
  tourUrl,
  tags,
  listingType,
}: MediaGalleryProps) => {
  const t = useTranslations("apartments");
  const [showTour, setShowTour] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [swiper, setSwiper] = useState<SwiperClass | null>(null);

  const images = gallery.filter(
    (item): item is Media =>
      typeof item === "object" &&
      item !== null &&
      typeof item.url === "string" &&
      item.url.length > 0,
  );
  const total = images.length;

  const thumbRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const goTo = useCallback(
    (idx: number) => {
      swiper?.slideTo(idx);
    },
    [swiper],
  );

  // Cuộn thumbnail active vào giữa khi đổi ảnh.
  useEffect(() => {
    thumbRefs.current[activeIndex]?.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });
  }, [activeIndex]);

  // Keyboard navigation toàn cục (giữ hành vi cũ).
  useEffect(() => {
    if (!swiper) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") swiper.slideNext();
      if (e.key === "ArrowLeft") swiper.slidePrev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [swiper]);

  if (images.length === 0 && !tourUrl) {
    return (
      <div className="w-full aspect-video bg-background-subtle flex items-center justify-center">
        <span className="text-foreground-muted text-sm">
          No media available
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="relative w-full aspect-4/3 md:aspect-video overflow-hidden bg-black group select-none">
        {showTour && tourUrl ? (
          <iframe
            src={tourUrl}
            className="w-full h-full border-none"
            allowFullScreen
            loading="lazy"
          />
        ) : (
          <>
            {/* Main carousel — Swiper */}
            <Swiper
              onSwiper={setSwiper}
              onSlideChange={(s) => setActiveIndex(s.activeIndex)}
              slidesPerView={1}
              spaceBetween={0}
              grabCursor
              className="w-full h-full"
            >
              {images.map((img, idx) => (
                <SwiperSlide key={img.id ?? idx} className="relative">
                  <Image
                    src={`${img.url}`}
                    alt={img.filename || `Apartment image ${idx + 1}`}
                    fill
                    draggable={false}
                    className="object-cover pointer-events-none"
                    priority={idx === 0}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
                  />
                </SwiperSlide>
              ))}
            </Swiper>

            {/* Tags and Listing Type Badges */}
            <div className="absolute top-4 left-4 flex gap-2 z-10 pointer-events-none">
              {tags &&
                tags.map((tag, idx) => {
                  if (typeof tag === "object" && tag !== null && tag.title) {
                    return (
                      <div
                        key={idx}
                        className="bg-background/90 backdrop-blur-md px-3 py-1.5 rounded-none text-xs uppercase tracking-widest font-light text-foreground"
                      >
                        {tag.title}
                      </div>
                    );
                  }
                  return null;
                })}
              {listingType === "sale" ? (
                <div className="bg-emerald-600 text-white px-3 py-1.5 rounded-none text-xs uppercase tracking-widest shadow-lg">
                  {t("for_sale")}
                </div>
              ) : listingType === "rent" ? (
                <div className="bg-amber-500 text-black px-3 py-1.5 rounded-none text-xs uppercase tracking-widest shadow-lg">
                  {t("for_rent")}
                </div>
              ) : null}
            </div>

            {/* Prev Arrow */}
            {total > 1 && activeIndex > 0 && (
              <button
                onClick={() => swiper?.slidePrev()}
                className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/75 text-white p-2.5 transition-colors z-10 hidden md:flex items-center justify-center"
                aria-label="Previous image"
              >
                <CaretLeftIcon className="w-5 h-5" />
              </button>
            )}

            {/* Next Arrow */}
            {total > 1 && activeIndex < total - 1 && (
              <button
                onClick={() => swiper?.slideNext()}
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/75 text-white p-2.5 transition-colors z-10 hidden md:flex items-center justify-center"
                aria-label="Next image"
              >
                <CaretRightIcon className="w-5 h-5" />
              </button>
            )}

            {/* Counter + Dots */}
            {total > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3 z-10">
                <div className="hidden md:flex gap-1.5 bg-black/40 px-3 py-1.5">
                  {images.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => goTo(idx)}
                      className={`h-1.5 transition-all duration-300 ${
                        idx === activeIndex
                          ? "w-5 bg-white"
                          : "w-1.5 bg-white/40 hover:bg-white/70"
                      }`}
                      aria-label={`Go to slide ${idx + 1}`}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Image counter top-right */}
            {total > 1 && (
              <div className="absolute top-3 right-3 bg-black/50 text-white text-xs font-mono px-2 py-1 z-10 tabular-nums">
                {activeIndex + 1} / {total}
              </div>
            )}

            {/* 360 Tour Button */}
            {tourUrl && (
              <button
                onClick={() => setShowTour(true)}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-4 md:p-6 transition-all flex flex-col items-center gap-2 z-10 group-hover:scale-105"
              >
                <VirtualRealityIcon
                  weight="duotone"
                  className="w-8 h-8 md:w-12 md:h-12"
                />
                <span className="text-xs md:text-sm font-medium tracking-wide uppercase">
                  360 Tour
                </span>
              </button>
            )}
          </>
        )}
      </div>

      {/* Thumbnail strip — scroll native, click để chuyển ảnh */}
      {!showTour && total > 1 && (
        <div className="flex gap-2 py-1 overflow-x-auto hide-scrollbar">
          {images.map((img, idx) => (
            <button
              key={img.id ?? idx}
              ref={(el) => {
                thumbRefs.current[idx] = el;
              }}
              onClick={() => goTo(idx)}
              className={`relative h-16 md:h-20 aspect-video shrink-0 overflow-hidden transition-all border-2 ${
                idx === activeIndex
                  ? "border-primary opacity-100"
                  : "border-transparent opacity-60 hover:opacity-100"
              }`}
              aria-label={`Thumbnail ${idx + 1}`}
            >
              <Image
                src={`${img.url}`}
                alt={img.filename || `Thumbnail ${idx + 1}`}
                fill
                draggable={false}
                className="object-cover pointer-events-none"
                sizes="(max-width: 768px) 64px, 80px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
