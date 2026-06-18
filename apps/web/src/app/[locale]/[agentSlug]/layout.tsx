import { ThemeInjector } from "@/components/ThemeInjector";
import { getUserBySlug } from "@/lib/payload-fetcher";

export default async function AgentLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ agentSlug: string }>;
}) {
  const { agentSlug } = await params;

  let theme = null;
  try {
    const user = await getUserBySlug(agentSlug);
    if (user) {
      theme = user.theme;
    }
  } catch (error) {
    console.error("Error fetching agent theme:", error);
  }

  return (
    <>
      <ThemeInjector theme={theme} />
      {children}
    </>
  );
}
