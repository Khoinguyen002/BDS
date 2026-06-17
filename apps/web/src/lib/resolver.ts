import { getUserBySlug, getLandingPageByOwner } from "./payload-fetcher";

export async function resolveLandingPage(agentSlug: string) {
  try {
    const user = await getUserBySlug(agentSlug);
    if (!user) return null;

    return await getLandingPageByOwner(user.id);
  } catch (error) {
    console.error("Error resolving landing page:", error);
    return null;
  }
}
