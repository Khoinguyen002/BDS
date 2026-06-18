"use client";

import React, { useState } from "react";
import RichTextRenderer from "@/components/blocks/RichTextRenderer";
import { CaretDownIcon, CaretUpIcon } from "@phosphor-icons/react/dist/ssr";

import { Apartment } from "@bds/shared/payload-types";

type PropertyDescriptionProps = {
  details?: Apartment["details"];
  t: (key: string) => string;
};

export const PropertyDescription = ({ details, t }: PropertyDescriptionProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!details?.overview && !details?.highlights && !details?.landscape) {
    return null;
  }

  return (
    <div className="relative">
      <div
        className={`relative overflow-hidden transition-all duration-500 ease-in-out ${
          isExpanded ? "max-h-[5000px]" : "max-h-[400px]"
        }`}
      >
        <div className="flex flex-col gap-8 pb-12">
          {!!details.overview && (
            <div>
              <h3 className="text-xl font-bold mb-4">{t("overview")}</h3>
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              <RichTextRenderer content={details.overview as any} />
            </div>
          )}
          {!!details.highlights && (
            <div>
              <h3 className="text-xl font-bold mb-4">{t("highlights")}</h3>
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              <RichTextRenderer content={details.highlights as any} />
            </div>
          )}
          {!!details.landscape && (
            <div>
              <h3 className="text-xl font-bold mb-4">{t("landscape")}</h3>
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              <RichTextRenderer content={details.landscape as any} />
            </div>
          )}
        </div>
        
        {/* Gradient Overlay for collapsed state */}
        {!isExpanded && (
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent pointer-events-none" />
        )}
      </div>

      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-center gap-2 w-full py-3 mt-2 text-primary font-medium hover:bg-primary/5 rounded-xl transition-colors"
      >
        {isExpanded ? (
          <>
            {t("show_less") || "Thu gọn"} <CaretUpIcon weight="bold" />
          </>
        ) : (
          <>
            {t("show_more") || "Xem thêm"} <CaretDownIcon weight="bold" />
          </>
        )}
      </button>
    </div>
  );
};
