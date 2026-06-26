"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import type { Media, Tag } from "@bds/shared/payload-types";
import {
  VirtualRealityIcon,
  CaretLeftIcon,
  CaretRightIcon,
  XIcon,
} from "@phosphor-icons/react/dist/ssr";
import { useTranslations } from "next-intl";
import useEmblaCarousel from "embla-carousel-react";
import type { EmblaCarouselType } from "embla-carousel";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Custom Lightbox State for animation
  const [lightboxState, setLightboxState] = useState<"closed" | "open">(
    "closed",
  );
  const [lightboxOpacity, setLightboxOpacity] = useState(false);

  const images = gallery.filter(
    (item): item is Media =>
      typeof item === "object" &&
      item !== null &&
      typeof item.url === "string" &&
      item.url.length > 0,
  );
  const total = images.length;

  const [mainRef, mainApi] = useEmblaCarousel({ loop: false });
  const [thumbRef, thumbApi] = useEmblaCarousel({
    containScroll: "keepSnaps",
    dragFree: true,
  });

  const onSelect = useCallback(
    (api: EmblaCarouselType) => {
      const index = api.selectedScrollSnap();
      setSelectedIndex(index);
      thumbApi?.scrollTo(index);
    },
    [thumbApi],
  );

  useEffect(() => {
    if (!mainApi) return;
    mainApi.on("select", onSelect);
    mainApi.on("reInit", onSelect);
    return () => {
      mainApi.off("select", onSelect);
      mainApi.off("reInit", onSelect);
    };
  }, [mainApi, onSelect]);

  const scrollTo = useCallback(
    (index: number) => mainApi?.scrollTo(index),
    [mainApi],
  );

  const openLightbox = () => {
    setLightboxState("open");
    // Allow React to mount the component, then trigger opacity transition
    setTimeout(() => setLightboxOpacity(true), 10);
  };

  const closeLightbox = useCallback(() => {
    setLightboxOpacity(false);
    // Wait for transition duration before unmounting
    setTimeout(() => setLightboxState("closed"), 250);
  }, []);

  // Keyboard navigation for the main gallery (lightbox handles its own keys)
  useEffect(() => {
    if (lightboxState === "open") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") mainApi?.scrollNext();
      if (e.key === "ArrowLeft") mainApi?.scrollPrev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightboxState, mainApi]);

  // Lock body scroll when lightbox is open
  useEffect(() => {
    if (lightboxState === "open") {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [lightboxState]);

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
            <div className="embla h-full" ref={mainRef}>
              <div className="flex h-full">
                {images.map((img, idx) => (
                  <div
                    key={img.id ?? idx}
                    className="relative flex-[0_0_100%] h-full cursor-pointer"
                    onClick={openLightbox}
                  >
                    <Image
                      src={`${img.url}`}
                      alt={img.filename || `Apartment image ${idx + 1}`}
                      fill
                      className="object-cover pointer-events-none"
                      priority={idx === 0}
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
                    />
                  </div>
                ))}
              </div>
            </div>

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
            {total > 1 && selectedIndex > 0 && (
              <button
                onClick={() => mainApi?.scrollPrev()}
                className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/75 text-white p-2.5 transition-colors z-10 hidden md:flex items-center justify-center"
                aria-label="Previous image"
              >
                <CaretLeftIcon className="w-5 h-5" />
              </button>
            )}

            {/* Next Arrow */}
            {total > 1 && selectedIndex < total - 1 && (
              <button
                onClick={() => mainApi?.scrollNext()}
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/75 text-white p-2.5 transition-colors z-10 hidden md:flex items-center justify-center"
                aria-label="Next image"
              >
                <CaretRightIcon className="w-5 h-5" />
              </button>
            )}

            {/* Dots */}
            {total > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3 z-10">
                <div className="hidden md:flex gap-1.5 bg-black/40 px-3 py-1.5">
                  {images.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => scrollTo(idx)}
                      className={cn(
                        "h-1.5 transition-all duration-300",
                        idx === selectedIndex
                          ? "w-5 bg-white"
                          : "w-1.5 bg-white/40 hover:bg-white/70",
                      )}
                      aria-label={`Go to slide ${idx + 1}`}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Image counter top-right */}
            {total > 1 && (
              <div className="absolute top-3 right-3 bg-black/50 text-white text-xs font-mono px-2 py-1 z-10 tabular-nums">
                {selectedIndex + 1} / {total}
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

      {/* Thumbnail strip — Embla */}
      {!showTour && total > 1 && (
        <div className="embla-thumbs overflow-hidden py-1" ref={thumbRef}>
          <div className="flex gap-2">
            {images.map((img, idx) => (
              <button
                key={img.id ?? idx}
                onClick={() => scrollTo(idx)}
                className={cn(
                  "relative flex-[0_0_64px] md:flex-[0_0_80px] h-12 md:h-[60px] overflow-hidden border-2 transition-all",
                  selectedIndex === idx
                    ? "border-primary opacity-100"
                    : "border-transparent opacity-60 hover:opacity-100",
                )}
                aria-label={`Go to image ${idx + 1}`}
              >
                <Image
                  src={`${img.url}`}
                  alt={img.filename || `Thumbnail ${idx + 1}`}
                  fill
                  draggable={false}
                  className="object-cover"
                  sizes="(max-width: 768px) 64px, 80px"
                />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Lightbox Modal */}
      {lightboxState === "open" && (
        <div
          className={cn(
            "fixed inset-0 z-100 bg-black/70 backdrop-blur-xl flex flex-col justify-center items-center transition-opacity duration-250 ease-out",
            lightboxOpacity ? "opacity-100" : "opacity-0",
          )}
          onClick={closeLightbox}
        >
          {/* Close Button */}
          <Button
            type="button"
            size="icon"
            variant="ghost"
            onClick={closeLightbox}
            className="absolute top-4 right-4 z-50 h-9 w-9 text-white bg-white/10 hover:bg-white/20 hover:text-white backdrop-blur-md border border-white/20"
            aria-label="Close lightbox"
          >
            <XIcon className="w-4 h-4" />
          </Button>

          <Lightbox
            images={images}
            total={total}
            startIndex={selectedIndex}
            onClose={closeLightbox}
          />
        </div>
      )}
    </div>
  );
};

type LightboxProps = {
  images: Media[];
  total: number;
  startIndex: number;
  onClose: () => void;
};

const Lightbox = ({ images, total, startIndex, onClose }: LightboxProps) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ startIndex, loop: false });
  const [index, setIndex] = useState(startIndex);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => {
      setIndex(emblaApi.selectedScrollSnap());
      setCanPrev(emblaApi.canScrollPrev());
      setCanNext(emblaApi.canScrollNext());
    };
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi]);

  // Keyboard navigation scoped to the lightbox
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") emblaApi?.scrollNext();
      if (e.key === "ArrowLeft") emblaApi?.scrollPrev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [emblaApi, onClose]);

  return (
    <>
      <div
        className="relative w-full max-w-7xl mx-auto px-4 md:px-12 h-[80vh] flex flex-col justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="embla overflow-hidden h-full" ref={emblaRef}>
          <div className="flex h-full">
            {images.map((img, idx) => (
              <div
                key={img.id ?? idx}
                className="relative flex-[0_0_100%] h-full"
              >
                <Image
                  src={`${img.url}`}
                  alt={img.filename || `Lightbox image ${idx + 1}`}
                  fill
                  className="object-contain pointer-events-none"
                  sizes="100vw"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Prev */}
        <button
          onClick={() => emblaApi?.scrollPrev()}
          disabled={!canPrev}
          aria-label="Previous image"
          className="absolute left-2 md:-left-6 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center w-9 h-9 md:w-10 md:h-10 rounded-full backdrop-blur-md border border-white/10 bg-black/40 transition-all opacity-30 hover:opacity-100 disabled:opacity-0"
        >
          <CaretLeftIcon className="w-4 h-4 md:w-5 md:h-5 text-white" />
        </button>

        {/* Next */}
        <button
          onClick={() => emblaApi?.scrollNext()}
          disabled={!canNext}
          aria-label="Next image"
          className="absolute right-2 md:-right-6 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center w-9 h-9 md:w-10 md:h-10 rounded-full backdrop-blur-md border border-white/10 bg-black/40 transition-all opacity-30 hover:opacity-100 disabled:opacity-0"
        >
          <CaretRightIcon className="w-4 h-4 md:w-5 md:h-5 text-white" />
        </button>
      </div>

      {/* Lightbox Counter */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white font-mono text-sm tracking-widest bg-black/50 backdrop-blur-md px-6 py-2 tabular-nums border border-white/10">
        {index + 1} / {total}
      </div>
    </>
  );
};
