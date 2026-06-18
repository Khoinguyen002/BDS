"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import Image from "next/image";
import type { Media } from "@bds/shared/payload-types";
import { VirtualRealityIcon, CaretLeftIcon, CaretRightIcon } from "@phosphor-icons/react/dist/ssr";

type MediaGalleryProps = {
  gallery: (number | Media)[];
  tourUrl?: string | null;
  serverUrl: string;
};

export const MediaGallery = ({ gallery, tourUrl }: MediaGalleryProps) => {
  const [showTour, setShowTour] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartX = useRef(0);
  const dragDeltaX = useRef(0);
  const trackRef = useRef<HTMLDivElement>(null);

  const images = gallery.filter((item): item is Media => typeof item === "object" && item !== null);
  const total = images.length;

  const goTo = useCallback(
    (index: number) => {
      const clamped = Math.max(0, Math.min(index, total - 1));
      setActiveIndex(clamped);
    },
    [total],
  );

  const next = useCallback(() => goTo(activeIndex + 1), [activeIndex, goTo]);
  const prev = useCallback(() => goTo(activeIndex - 1), [activeIndex, goTo]);

  // Keyboard navigation
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev]);

  // Touch/mouse swipe
  const onPointerDown = (e: React.PointerEvent) => {
    dragStartX.current = e.clientX;
    dragDeltaX.current = 0;
    setIsDragging(true);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    dragDeltaX.current = e.clientX - dragStartX.current;
  };

  const onPointerUp = () => {
    if (!isDragging) return;
    setIsDragging(false);
    const threshold = 50;
    if (dragDeltaX.current < -threshold) next();
    else if (dragDeltaX.current > threshold) prev();
    dragDeltaX.current = 0;
  };

  if (images.length === 0 && !tourUrl) {
    return (
      <div className="w-full aspect-video bg-background-subtle flex items-center justify-center">
        <span className="text-foreground-muted text-sm">No media available</span>
      </div>
    );
  }

  return (
    <div className="relative w-full aspect-[4/3] md:aspect-video overflow-hidden bg-black group select-none">
      {showTour && tourUrl ? (
        <iframe
          src={tourUrl}
          className="w-full h-full border-none"
          allowFullScreen
          loading="lazy"
        />
      ) : (
        <>
          {/* Slide track */}
          <div
            ref={trackRef}
            className="flex w-full h-full"
            style={{
              transform: `translateX(-${activeIndex * 100}%)`,
              transition: isDragging ? "none" : "transform 350ms cubic-bezier(0.25, 0.46, 0.45, 0.94)",
              willChange: "transform",
            }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
          >
            {images.map((img, idx) => (
              <div key={img.id ?? idx} className="w-full h-full shrink-0 relative">
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

          {/* Prev Arrow */}
          {total > 1 && activeIndex > 0 && (
            <button
              onClick={prev}
              className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/75 text-white p-2.5 transition-colors z-10 hidden md:flex items-center justify-center"
              aria-label="Previous image"
            >
              <CaretLeftIcon className="w-5 h-5" />
            </button>
          )}

          {/* Next Arrow */}
          {total > 1 && activeIndex < total - 1 && (
            <button
              onClick={next}
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/75 text-white p-2.5 transition-colors z-10 hidden md:flex items-center justify-center"
              aria-label="Next image"
            >
              <CaretRightIcon className="w-5 h-5" />
            </button>
          )}

          {/* Counter + Dots */}
          {total > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3 z-10">
              {/* Dot indicators */}
              <div className="flex gap-1.5 bg-black/40 px-3 py-1.5">
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
              <VirtualRealityIcon weight="duotone" className="w-8 h-8 md:w-12 md:h-12" />
              <span className="text-xs md:text-sm font-medium tracking-wide uppercase">360 Tour</span>
            </button>
          )}
        </>
      )}
    </div>
  );
};
