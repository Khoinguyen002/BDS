import { ThemeInjector } from "@/components/ThemeInjector";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { getUserBySlug } from "@/lib/payload-fetcher";

export default async function AgentLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string; agentSlug: string }>;
}) {
  const { locale, agentSlug } = await params;

  let theme = null;
  let brandName = agentSlug;
  try {
    const user = await getUserBySlug(agentSlug);
    if (user) {
      theme = user.theme;
      brandName = user.brandName || agentSlug;
    }
  } catch (error) {
    console.error("Error fetching agent theme:", error);
  }

  return (
    <>
      <ThemeInjector theme={theme} />
      <SiteHeader brandName={brandName} homeHref={`/${locale}/${agentSlug}`} />
      {children}
    </>
  );
}
