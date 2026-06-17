/**
 * payload-fetcher.ts
 *
 * Centralized service for data fetching from Payload CMS API.
 * This ensures deduplication, proper ISR caching (revalidate: 60),
 * and cleaner code across Next.js components.
 */

import type { User, LandingPage, Apartment } from "@bds/shared/payload-types";

const SERVER_URL =
  process.env.PAYLOAD_PUBLIC_SERVER_URL || "http://localhost:3001";
const REVALIDATE_TIME = 60; // 60 seconds

async function fetchAPI(endpoint: string) {
  console.error(`${SERVER_URL}/api${endpoint}`);
  const res = await fetch(`${SERVER_URL}/api${endpoint}`, {
    next: { revalidate: REVALIDATE_TIME },
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch API: ${endpoint} - Status: ${res.status}`);
  }
  return res.json();
}

export async function getUserBySlug(agentSlug: string): Promise<User | null> {
  try {
    const data = await fetchAPI(`/users?where[agentSlug][equals]=${agentSlug}`);
    if (data.docs && data.docs.length > 0) {
      return data.docs[0];
    }
    return null;
  } catch (error) {
    console.error("Error in getUserBySlug:", error);
    return null;
  }
}

export async function getLandingPageByOwner(
  userId: string | number,
): Promise<LandingPage | null> {
  try {
    const data = await fetchAPI(
      `/landing-pages?where[owner][equals]=${userId}&depth=1`,
    );
    if (data.docs && data.docs.length > 0) {
      return data.docs[0];
    }
    return null;
  } catch (error) {
    console.error("Error in getLandingPageByOwner:", error);
    return null;
  }
}

export async function getApartmentBySlugOrId(
  slugOrId: string,
): Promise<Apartment | null> {
  try {
    // Attempt fetch by slug first
    const data = await fetchAPI(
      `/apartments?where[slug][equals]=${slugOrId}&depth=2`,
    );
    if (data.docs && data.docs.length > 0) {
      return data.docs[0];
    }

    // Fallback: Attempt fetch by ID if slug not found (and it's a valid ID)
    const fallbackData = await fetchAPI(`/apartments/${slugOrId}?depth=2`);
    if (fallbackData && !fallbackData.errors) {
      return fallbackData;
    }
    return null;
  } catch (error) {
    console.error("Error in getApartmentBySlugOrId:", error);
    return null;
  }
}

export async function getApartmentsByOwner(
  ownerId: string | number,
  limit: number = 6,
): Promise<Apartment[]> {
  try {
    const data = await fetchAPI(
      `/apartments?where[owner][equals]=${ownerId}&depth=1&limit=${limit}`,
    );
    return data.docs || [];
  } catch (error) {
    console.error("Error in getApartmentsByOwner:", error);
    return [];
  }
}
