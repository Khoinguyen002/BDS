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
  const [dragOffset, setDragOffset] = useState(0);
  const dragStartX = useRef(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Thumbnails dragging and focus
  const thumbsRef = useRef<HTMLDivElement>(null);
  const [isThumbDragging, setIsThumbDragging] = useState(false);
  const thumbDragStartX = useRef(0);
  const thumbDragScrollLeft = useRef(0);
  const thumbDragDelta = useRef(0);

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

  // Touch/mouse swipe - image follows cursor in realtime
  const onPointerDown = (e: React.PointerEvent) => {
    dragStartX.current = e.clientX;
    setDragOffset(0);
    setIsDragging(true);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const delta = e.clientX - dragStartX.current;
    // Resist dragging past first/last slide (rubber-band effect)
    if ((activeIndex === 0 && delta > 0) || (activeIndex === total - 1 && delta < 0)) {
      setDragOffset(delta * 0.3);
    } else {
      setDragOffset(delta);
    }
  };

  const onPointerUp = () => {
    if (!isDragging) return;
    setIsDragging(false);
    const containerWidth = containerRef.current?.offsetWidth || 1;
    const threshold = containerWidth * 0.15; // 15% of container width
    if (dragOffset < -threshold) next();
    else if (dragOffset > threshold) prev();
    setDragOffset(0);
  };

  const onThumbPointerDown = (e: React.PointerEvent) => {
    thumbDragStartX.current = e.clientX;
    thumbDragScrollLeft.current = thumbsRef.current?.scrollLeft || 0;
    thumbDragDelta.current = 0;
    setIsThumbDragging(true);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onThumbPointerMove = (e: React.PointerEvent) => {
    if (!isThumbDragging || !thumbsRef.current) return;
    const delta = e.clientX - thumbDragStartX.current;
    thumbDragDelta.current = Math.abs(delta);
    // disable snap while dragging for smoother feel
    thumbsRef.current.style.scrollSnapType = 'none';
    thumbsRef.current.scrollLeft = thumbDragScrollLeft.current - delta;
  };

  const onThumbPointerUp = () => {
    setIsThumbDragging(false);
    if (thumbsRef.current) {
      thumbsRef.current.style.scrollSnapType = '';
    }
  };

  // Scroll active thumbnail into view
  useEffect(() => {
    if (!thumbsRef.current) return;
    const container = thumbsRef.current;
    const activeThumb = container.children[activeIndex] as HTMLElement;
    if (activeThumb) {
      const containerWidth = container.clientWidth;
      const thumbOffsetLeft = activeThumb.offsetLeft;
      const thumbWidth = activeThumb.clientWidth;
      container.scrollTo({
        left: thumbOffsetLeft - containerWidth / 2 + thumbWidth / 2,
        behavior: "smooth",
      });
    }
  }, [activeIndex]);

  if (images.length === 0 && !tourUrl) {
    return (
      <div className="w-full aspect-video bg-background-subtle flex items-center justify-center">
        <span className="text-foreground-muted text-sm">No media available</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div ref={containerRef} className="relative w-full aspect-[4/3] md:aspect-video overflow-hidden bg-black group select-none">
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
                transform: `translateX(calc(-${activeIndex * 100}% + ${dragOffset}px))`,
                transition: isDragging ? "none" : "transform 350ms cubic-bezier(0.25, 0.46, 0.45, 0.94)",
                willChange: "transform",
                cursor: isDragging ? "grabbing" : "grab",
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
                <div className="flex gap-1.5 bg-black/40 px-3 py-1.5 hidden md:flex">
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

      {/* Thumbnail Gallery */}
      {!showTour && total > 1 && (
        <div 
          ref={thumbsRef}
          className={`flex gap-2 overflow-x-auto snap-x snap-mandatory pb-2 hide-scrollbar ${isThumbDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
          onPointerDown={onThumbPointerDown}
          onPointerMove={onThumbPointerMove}
          onPointerUp={onThumbPointerUp}
          onPointerCancel={onThumbPointerUp}
        >
          {images.map((img, idx) => (
            <button
              key={img.id ?? idx}
              onClick={() => {
                if (thumbDragDelta.current > 5) return;
                goTo(idx);
              }}
              className={`relative h-16 md:h-20 aspect-video flex-shrink-0 snap-center overflow-hidden transition-all ${
                idx === activeIndex
                  ? "ring-2 ring-primary opacity-100"
                  : "opacity-60 hover:opacity-100"
              }`}
              aria-label={`Thumbnail ${idx + 1}`}
            >
              <Image
                src={`${img.url}`}
                alt={img.filename || `Thumbnail ${idx + 1}`}
                fill
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
