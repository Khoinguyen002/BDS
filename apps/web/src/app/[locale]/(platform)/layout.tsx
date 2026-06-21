import React from "react";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { DynamicSvg } from "@/components/ui/DynamicSvg";
import { getAppSettings } from "@/lib/payload-fetcher";

import { ThemeInjector } from "@/components/ThemeInjector";

import { getTranslations } from "next-intl/server";

export default async function PlatformLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const appSettings = await getAppSettings();
  const t = await getTranslations("common");

  const fullLogoUrl =
    typeof appSettings?.fullLogo === "object"
      ? appSettings.fullLogo?.url
      : undefined;
  const logoNode = fullLogoUrl ? (
    <DynamicSvg url={fullLogoUrl} className="h-10 w-auto text-primary" />
  ) : undefined;

  const platformTheme = {
    primaryColor: appSettings?.themePrimary,
    primaryForegroundColor: appSettings?.themePrimaryForeground,
    secondaryColor: appSettings?.themeSecondary,
    secondaryForegroundColor: appSettings?.themeSecondaryForeground,
    borderRadius: null, // use default or appSettings radius if you have one
    fontFamily: null,
  };

  return (
    <>
      <ThemeInjector theme={platformTheme} />
      <SiteHeader
        brandName={appSettings?.brandName || t("real_estate")}
        homeHref={`/${locale}`}
        showPlatformLogo
        logoNode={logoNode}
      />
      {children}
    </>
  );
}
