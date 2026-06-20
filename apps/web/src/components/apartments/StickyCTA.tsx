"use client";

import React from "react";
import { PhoneIcon } from "@phosphor-icons/react/dist/ssr";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

import { User as UserType } from "@bds/shared/payload-types";

type StickyCTAProps = {
  owner?: UserType | null;
  phoneNumber?: string | null;
  zaloNumber?: string | null;
  listingType?: "sale" | "rent" | null;
};

export const StickyCTA = ({ owner, phoneNumber, zaloNumber, listingType }: StickyCTAProps) => {
  const t = useTranslations("apartments");
  const tLead = useTranslations("lead");
  const tAgent = useTranslations("agent");

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-background/80 backdrop-blur-xl border-t border-border/50"
    >
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 container">
        {owner && (
          <div className="flex items-center gap-3 w-full md:w-auto justify-start">
            <div className="w-10 h-10 rounded-full bg-secondary/10 text-secondary flex items-center justify-center shrink-0 text-sm font-bold uppercase">
              {owner.brandName?.substring(0, 2)}
            </div>
            <div className="flex flex-col">
              <h3 className="font-bold text-sm text-foreground line-clamp-1">{owner.brandName}</h3>
              <span className="text-xs text-foreground-muted">{tAgent("consultant")}</span>
            </div>
          </div>
        )}

        <div className="flex gap-3 w-full md:w-auto">
          {listingType === "rent" ? (
            <>
              {phoneNumber && (
                <Button asChild className="flex-1 md:flex-none font-bold">
                  <a href={`tel:${phoneNumber}`}>
                    <PhoneIcon weight="fill" className="w-5 h-5 mr-2" />
                    {t("call_now") || "Gọi điện"}
                  </a>
                </Button>
              )}
              {(zaloNumber || phoneNumber) && (
                <Button asChild className="flex-1 md:flex-none bg-secondary hover:bg-secondary/90 text-secondary-foreground font-bold">
                  <a href={`https://zalo.me/${zaloNumber || phoneNumber}`} target="_blank" rel="noreferrer">
                    Chat Zalo
                  </a>
                </Button>
              )}
            </>
          ) : (
            <>
              <Button
                className="flex-1 md:flex-none font-bold"
                onClick={() => alert("Mở form Nhận báo giá (Sẽ kết nối API Leads ở phase sau)")}
              >
                {tLead("form_title_sale") || "Nhận báo giá"}
              </Button>
              {phoneNumber && (
                <Button asChild variant="outline" className="w-10 h-10 bg-background-subtle border-border/50 shrink-0 flex items-center justify-center">
                  <a href={`tel:${phoneNumber}`} className="text-foreground dark:text-white">
                    <PhoneIcon weight="fill" className="w-5 h-5" />
                  </a>
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
