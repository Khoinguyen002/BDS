import React from "react";
import { User as UserType } from "@bds/shared/payload-types";
import { SealCheckIcon, HandshakeIcon, StarIcon, PhoneIcon } from "@phosphor-icons/react/dist/ssr";

type AgentCardProps = {
  owner: UserType;
  listingType?: "sale" | "rent" | null;
  t: (key: string) => string;
};

export const AgentCard = ({ owner, listingType, t }: AgentCardProps) => {
  return (
    <div className="bg-background-subtle rounded-3xl p-6 border border-border/50 flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 text-2xl font-bold uppercase">
          {owner.brandName.substring(0, 2)}
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <h3 className="font-bold text-lg text-foreground">{owner.brandName}</h3>
            {owner.verified && (
              <span title={t("verified_agent")}>
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
              <span className="flex items-center gap-1.5 text-primary font-bold text-lg">
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

      <div className="flex flex-col gap-3 mt-6">
        {listingType === "rent" ? (
          <>
            <a
              href={`tel:${owner.profile?.phoneNumber || ""}`}
              className="w-full bg-primary text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-primary-dark transition-colors"
            >
              <PhoneIcon weight="fill" className="w-5 h-5" />
              {t("call_now") || "Gọi điện"}
            </a>
            <a
              href={owner.profile?.zaloUrl || `https://zalo.me/${owner.profile?.phoneNumber || ""}`}
              target="_blank"
              rel="noreferrer"
              className="w-full bg-blue-500 text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-600 transition-colors"
            >
              Chat Zalo
            </a>
          </>
        ) : (
          <>
            <button
              onClick={() => alert("Mở form Nhận báo giá (Sẽ kết nối API Leads ở phase sau)")}
              className="w-full bg-primary text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-primary-dark transition-colors"
            >
              {t("form_title_sale") || "Nhận báo giá"}
            </button>
            <a
              href={`tel:${owner.profile?.phoneNumber || ""}`}
              className="w-full bg-background-subtle border border-border/50 text-foreground py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:border-primary/50 transition-colors"
            >
              <PhoneIcon weight="duotone" className="w-5 h-5" />
              {t("call_now") || "Gọi điện"}
            </a>
          </>
        )}
      </div>
    </div>
  );
};
