"use client";

import React, { useEffect, useState } from "react";
import { PhoneIcon } from "@phosphor-icons/react/dist/ssr";

type StickyCTAProps = {
  phoneNumber?: string | null;
  zaloNumber?: string | null;
  listingType?: "sale" | "rent" | null;
  t: (key: string) => string;
};

export const StickyCTA = ({ phoneNumber, zaloNumber, listingType, t }: StickyCTAProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show when scrolled past the first 300px
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-50 p-4 bg-background/80 backdrop-blur-xl border-t border-border/50 md:hidden transition-transform duration-300 ease-in-out ${
        isVisible ? "translate-y-0" : "translate-y-full"
      }`}
    >
      <div className="flex gap-3 max-w-md mx-auto">
        {listingType === "rent" ? (
          <>
            <a
              href={`tel:${phoneNumber || ""}`}
              className="flex-1 bg-primary text-primary-foreground py-3.5 rounded-xl font-bold flex items-center justify-center gap-2"
            >
              <PhoneIcon weight="fill" className="w-5 h-5" />
              {t("call_now") || "Gọi điện"}
            </a>
            <a
              href={`https://zalo.me/${zaloNumber || phoneNumber || ""}`}
              target="_blank"
              rel="noreferrer"
              className="flex-1 bg-blue-500 text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2"
            >
              Chat Zalo
            </a>
          </>
        ) : (
          <>
            <button
              onClick={() => alert("Mở form Nhận báo giá (Sẽ kết nối API Leads ở phase sau)")}
              className="flex-1 bg-primary text-primary-foreground py-3.5 rounded-xl font-bold flex items-center justify-center gap-2"
            >
              {t("form_title_sale") || "Nhận báo giá"}
            </button>
            <a
              href={`tel:${phoneNumber || ""}`}
              className="w-14 bg-background-subtle border border-border/50 text-foreground py-3.5 rounded-xl font-bold flex items-center justify-center shrink-0"
            >
              <PhoneIcon weight="duotone" className="w-5 h-5" />
            </a>
          </>
        )}
      </div>
    </div>
  );
};
