"use client";

import React, { useState } from "react";
import Image from "next/image";
import type { Media } from "@bds/shared/payload-types";
import { VirtualRealityIcon } from "@phosphor-icons/react/dist/ssr";

type MediaGalleryProps = {
  gallery: (number | Media)[];
  tourUrl?: string | null;
  serverUrl: string;
};

export const MediaGallery = ({ gallery, tourUrl, serverUrl }: MediaGalleryProps) => {
  const [showTour, setShowTour] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const images = gallery.filter((item): item is Media => typeof item === 'object' && item !== null);

  if (images.length === 0 && !tourUrl) {
    return (
      <div className="w-full aspect-video bg-background-subtle rounded-3xl flex items-center justify-center">
        <span className="text-foreground-muted">No media available</span>
      </div>
    );
  }

  return (
    <div className="relative w-full aspect-[4/3] md:aspect-video rounded-3xl overflow-hidden bg-black group">
      {showTour && tourUrl ? (
        <iframe
          src={tourUrl}
          className="w-full h-full border-none"
          allowFullScreen
          loading="lazy"
        />
      ) : (
        <>
          <div className="flex w-full h-full snap-x snap-mandatory overflow-x-auto hide-scrollbar" onScroll={(e) => {
            const target = e.target as HTMLElement;
            const index = Math.round(target.scrollLeft / target.clientWidth);
            setActiveIndex(index);
          }}>
            {images.map((img, idx) => (
              <div key={img.id} className="w-full h-full shrink-0 snap-center relative">
                <Image
                  src={`${serverUrl}${img.url}`}
                  alt={img.filename || "Apartment image"}
                  fill
                  className="object-cover"
                  priority={idx === 0}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
                />
              </div>
            ))}
          </div>

          {/* Dots Indicator */}
          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10 bg-black/30 backdrop-blur-md px-3 py-1.5 rounded-full">
              {images.map((_, idx) => (
                <div
                  key={idx}
                  className={`h-1.5 rounded-full transition-all ${idx === activeIndex ? "w-4 bg-white" : "w-1.5 bg-white/50"}`}
                />
              ))}
            </div>
          )}

          {/* Tour/Video Overlay Button */}
          {tourUrl && (
            <button
              onClick={() => setShowTour(true)}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 backdrop-blur-sm text-white rounded-full p-4 md:p-6 transition-all flex flex-col items-center gap-2 group-hover:scale-105"
            >
              <VirtualRealityIcon weight="duotone" className="w-8 h-8 md:w-12 md:h-12" />
              <span className="text-xs md:text-sm font-medium tracking-wide uppercase">360 Tour</span>
            </button>
          )}
        </>
      )}

      {/* Hide Scrollbar Style */}
      <style dangerouslySetInnerHTML={{ __html: `
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  );
};
