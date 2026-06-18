"use client";

import React, { useState, useRef, useEffect } from "react";
import RichTextRenderer from "@/components/blocks/RichTextRenderer";
import { CaretDown as CaretDownIcon, CaretUp as CaretUpIcon } from "@phosphor-icons/react/dist/ssr";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

import { Apartment } from "@bds/shared/payload-types";

type PropertyDescriptionProps = {
  details?: Apartment["details"];
};

export const PropertyDescription = ({ details }: PropertyDescriptionProps) => {
  const t = useTranslations("apartments");
  const [isExpanded, setIsExpanded] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (contentRef.current) {
      setIsOverflowing(contentRef.current.scrollHeight > 400);
    }
  }, [details]);

  if (!details) return null;

  if (!details.overview && !details.highlights && !details.landscape) {
    return null;
  }

  const hasMultipleSections = 
    (details.overview ? 1 : 0) + 
    (details.highlights ? 1 : 0) + 
    (details.landscape ? 1 : 0) > 1;

  return (
    <div className="relative">
      <div
        className={`relative overflow-hidden transition-all duration-500 ease-in-out ${
          !isOverflowing ? "max-h-none" : isExpanded ? "max-h-[5000px]" : "max-h-[400px]"
        }`}
      >
        <div ref={contentRef} className="flex flex-col gap-8 pb-12">
          {!!details.overview && (
            <div>
              {hasMultipleSections && <h3 className="text-xl font-bold mb-4">{t("overview")}</h3>}
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
        {isOverflowing && !isExpanded && (
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent pointer-events-none" />
        )}
      </div>

      {isOverflowing && (
        <Button
          variant="ghost"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center justify-center gap-2 w-full py-3 mt-2 text-primary font-medium"
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
        </Button>
      )}
    </div>
  );
};
