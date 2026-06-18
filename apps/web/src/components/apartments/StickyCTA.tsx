"use client";

import React, { useEffect, useState } from "react";
import { PhoneIcon } from "@phosphor-icons/react/dist/ssr";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

type StickyCTAProps = {
  phoneNumber?: string | null;
  zaloNumber?: string | null;
  listingType?: "sale" | "rent" | null;
};

export const StickyCTA = ({ phoneNumber, zaloNumber, listingType }: StickyCTAProps) => {
  const t = useTranslations("apartments");
  const tLead = useTranslations("lead");
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
      <div className="flex gap-3 container max-w-md">
        {listingType === "rent" ? (
          <>
            <Button asChild size="lg" className="flex-1 font-bold">
              <a href={`tel:${phoneNumber || ""}`}>
                <PhoneIcon weight="fill" className="w-5 h-5 mr-2" />
                {t("call_now") || "Gọi điện"}
              </a>
            </Button>
            <Button asChild size="lg" className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-bold">
              <a href={`https://zalo.me/${zaloNumber || phoneNumber || ""}`} target="_blank" rel="noreferrer">
                Chat Zalo
              </a>
            </Button>
          </>
        ) : (
          <>
            <Button
              size="lg"
              className="flex-1 font-bold"
              onClick={() => alert("Mở form Nhận báo giá (Sẽ kết nối API Leads ở phase sau)")}
            >
              {tLead("form_title_sale") || "Nhận báo giá"}
            </Button>
            <Button asChild variant="outline" size="icon" className="w-14 h-14 bg-background-subtle border-border/50 shrink-0">
              <a href={`tel:${phoneNumber || ""}`}>
                <PhoneIcon weight="duotone" className="w-5 h-5" />
              </a>
            </Button>
          </>
        )}
      </div>
    </div>
  );
};
