"use client";

import React from "react";
import { User as UserType } from "@bds/shared/payload-types";
import { SealCheckIcon, HandshakeIcon, StarIcon, PhoneIcon } from "@phosphor-icons/react/dist/ssr";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

type AgentCardProps = {
  owner: UserType;
  listingType?: "sale" | "rent" | null;
};

export const AgentCard = ({ owner, listingType }: AgentCardProps) => {
  const t = useTranslations("agent");
  const tLead = useTranslations("lead");
  const tApartments = useTranslations("apartments");
  return (
    <div className="bg-background-subtle rounded-none p-6 border border-border/50 flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-secondary/10 text-secondary flex items-center justify-center shrink-0 text-2xl font-bold uppercase">
          {owner.brandName.substring(0, 2)}
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <h3 className="font-bold text-lg text-foreground">{owner.brandName}</h3>
            {owner.verified && (
              <span title={t("verified")}>
                <SealCheckIcon weight="fill" className="w-5 h-5 text-primary" />
              </span>
            )}
          </div>
          <span className="text-sm text-foreground-muted">{t("consultant")}</span>
        </div>
      </div>

      {(owner.profile?.experienceYears || owner.profile?.successfulTransactions) && (
        <div className="grid grid-cols-2 gap-4 py-4 border-y border-border/50">
          {owner.profile?.experienceYears && (
            <div className="flex flex-col items-center justify-center gap-1">
              <span className="flex items-center gap-1.5 text-secondary font-bold text-lg">
                <StarIcon weight="fill" className="w-4 h-4" />
                {owner.profile.experienceYears}+
              </span>
              <span className="text-xs text-foreground-muted">{t("experience_years")}</span>
            </div>
          )}
          {owner.profile?.successfulTransactions && (
            <div className="flex flex-col items-center justify-center gap-1">
              <span className="flex items-center gap-1.5 text-success font-bold text-lg">
                <HandshakeIcon weight="fill" className="w-4 h-4" />
                {owner.profile.successfulTransactions}
              </span>
              <span className="text-xs text-foreground-muted">{t("transactions")}</span>
            </div>
          )}
        </div>
      )}

      <div className="flex flex-col gap-3 mt-4">
        {listingType === "rent" ? (
          <>
            <Button asChild className="w-full">
              <a href={`tel:${owner.profile?.phoneNumber || ""}`}>
                <PhoneIcon weight="fill" className="w-5 h-5 mr-2" />
                {tApartments("call_now") || "Gọi điện"}
              </a>
            </Button>
            <Button asChild className="w-full">
              <a href={owner.profile?.zaloUrl || `https://zalo.me/${owner.profile?.phoneNumber || ""}`} target="_blank" rel="noreferrer">
                Chat Zalo
              </a>
            </Button>
          </>
        ) : (
          <>
            <Button
              className="w-full"
              onClick={() => alert("Mở form Nhận báo giá (Sẽ kết nối API Leads ở phase sau)")}
            >
              {tLead("form_title_sale") || "Nhận báo giá"}
            </Button>
            <Button asChild variant="outline" className="w-full bg-background-subtle border-border/50 hover:border-primary/50">
              <a href={`tel:${owner.profile?.phoneNumber || ""}`}>
                <PhoneIcon weight="duotone" className="w-5 h-5 mr-2" />
                {tApartments("call_now") || "Gọi điện"}
              </a>
            </Button>
          </>
        )}
      </div>
    </div>
  );
};
