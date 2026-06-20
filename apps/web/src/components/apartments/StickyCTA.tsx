"use client";

import {
  ChatCircleDotsIcon as ChatIcon,
  FileDocIcon,
  PhoneIcon,
} from "@phosphor-icons/react/dist/ssr";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { User as UserType, Media } from "@bds/shared/payload-types";
import Image from "next/image";

type StickyCTAProps = {
  owner?: UserType | null;
  phoneNumber?: string | null;
  zaloUrl?: string | null;
  listingType?: "sale" | "rent" | null;
  isDesktop?: boolean;
};

export const StickyCTA = ({
  owner,
  phoneNumber,
  zaloUrl,
  listingType,
  isDesktop = false,
}: StickyCTAProps) => {
  const t = useTranslations("apartments");
  const tLead = useTranslations("lead");
  const tAgent = useTranslations("agent");

  const containerClass = isDesktop
    ? "w-full bg-background-subtle border border-border/50 p-4 md:p-6"
    : "fixed bottom-0 left-0 right-0 z-50 py-3 bg-background/80 backdrop-blur-xl border-t border-border/50";

  const innerClass = isDesktop
    ? "flex flex-col gap-4"
    : "container flex flex-row flex-wrap items-center justify-between gap-3";

  return (
    <div className={containerClass}>
      <div className={innerClass}>
        {owner && (
          <div className="flex items-center gap-2 flex-1">
            <div className="relative w-10 h-10 rounded-full bg-secondary/10 text-secondary flex items-center justify-center shrink-0 text-sm font-bold uppercase overflow-hidden">
              {owner.logo &&
              typeof owner.logo === "object" &&
              owner.logo.url ? (
                <Image
                  src={(owner.logo as Media).url as string}
                  alt={owner.brandName || "Agent"}
                  fill
                  className="object-cover"
                  sizes="40px"
                />
              ) : (
                owner.brandName?.substring(0, 2)
              )}
            </div>
            <div className="flex flex-col">
              <h6 className="font-bold line-clamp-1">{owner.brandName}</h6>
              <span className="text-xs text-foreground-muted">
                {tAgent("consultant")}
              </span>
            </div>
          </div>
        )}

        <div className={`flex gap-2 ${isDesktop ? "w-full" : "shrink-0"}`}>
          {listingType !== "rent" ? (
            <>
              {phoneNumber && (
                <Button
                  asChild
                  className={`${isDesktop ? "flex-1" : "w-11 md:w-auto px-0 md:px-6 shrink-0"} font-bold`}
                >
                  <a
                    href={`tel:${phoneNumber}`}
                    className="flex items-center justify-center"
                  >
                    <PhoneIcon weight="fill" className="w-5 h-5 md:mr-2" />
                    <span className="hidden md:inline">
                      {t("call_now") || "Gọi điện"}
                    </span>
                  </a>
                </Button>
              )}
              {(zaloUrl || phoneNumber) && (
                <Button
                  asChild
                  className={`${isDesktop ? "flex-1" : "w-11 md:w-auto px-0 md:px-6 shrink-0"} bg-secondary hover:bg-secondary/90 text-secondary-foreground font-bold`}
                >
                  <a
                    href={zaloUrl || `https://zalo.me/${phoneNumber}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center"
                  >
                    <ChatIcon className="w-5 h-5 md:mr-2" />
                    <span className="hidden md:inline">Chat Zalo</span>
                  </a>
                </Button>
              )}
            </>
          ) : (
            <>
              <Button
                className={`${isDesktop ? "flex-1" : "w-11 md:w-auto px-0 md:px-6 shrink-0"} font-bold`}
                onClick={() =>
                  alert(
                    "Mở form Nhận báo giá (Sẽ kết nối API Leads ở phase sau)",
                  )
                }
              >
                <FileDocIcon weight="fill" className="w-5 h-5 md:mr-2" />
                <span className="hidden md:inline">
                  {tLead("form_title_sale") || "Nhận báo giá"}
                </span>
              </Button>
              {phoneNumber && (
                <Button
                  variant={"secondary"}
                  asChild
                  className="w-11 px-0 shrink-0 flex items-center justify-center"
                >
                  <a
                    href={`tel:${phoneNumber}`}
                    className="flex items-center justify-center"
                  >
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
