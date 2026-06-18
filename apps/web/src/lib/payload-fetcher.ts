/**
 * payload-fetcher.ts
 *
 * Centralized service for data fetching from Payload CMS API.
 * This ensures deduplication, proper ISR caching (revalidate: 60),
 * and cleaner code across Next.js components.
 */

import type { User, LandingPage, Apartment, Location } from "@bds/shared/payload-types";
import { getLocale } from 'next-intl/server';
import { env } from "../env";

const SERVER_URL = env.PAYLOAD_PUBLIC_SERVER_URL;
const REVALIDATE_TIME = false; // Infinite cache

async function fetchAPI(endpoint: string, options?: RequestInit) {
  const url = new URL(`${SERVER_URL}/api${endpoint}`);

  if (!url.searchParams.has('locale')) {
    let locale = 'vi';
    try {
      locale = await getLocale();
    } catch {
      // getLocale might throw if called outside of a Next.js Request context
    }
    url.searchParams.set('locale', locale);
  }

  const res = await fetch(url.toString(), {
    ...options,
    next: { revalidate: REVALIDATE_TIME, ...options?.next },
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch API: ${url.toString()} - Status: ${res.status}`);
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

type DictionaryNode = string | { [key: string]: DictionaryNode };

export const getDictionary = async (locale: string): Promise<Record<string, DictionaryNode>> => {
  try {
    const data = await fetchAPI(
      `/translations?locale=${locale}&limit=1000`,
      {
        next: { tags: ["translations"] },
        cache: "force-cache",
      }
    );

    const dictionary: Record<string, DictionaryNode> = {};

    if (data.docs && Array.isArray(data.docs)) {
      data.docs.forEach((doc: { key?: string; value?: string }) => {
        if (doc.key && doc.value) {
          const parts = doc.key.split('.');
          let current: Record<string, DictionaryNode> = dictionary;
          for (let i = 0; i < parts.length - 1; i++) {
            if (!current[parts[i]] || typeof current[parts[i]] === 'string') {
              current[parts[i]] = {};
            }
            current = current[parts[i]] as Record<string, DictionaryNode>;
          }
          current[parts[parts.length - 1]] = doc.value;
        }
      });
    }

    return dictionary;
  } catch (error) {
    console.error(`Error fetching dictionary for locale ${locale}:`, error);
    return {};
  }
};

export const getApartmentBySlugOrId = async (
  slugOrId: string,
): Promise<Apartment | null> => {
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
  locale: string,
  options?: {
    propertyType?: string;
    listingType?: string;
    priceMin?: number;
    priceMax?: number;
    excludeId?: string | number;
    limit?: number;
  }
): Promise<Apartment[]> {
  const limit = options?.limit || 6;
  let where = `where[owner][equals]=${ownerId}`;
  
  if (options?.propertyType) {
    where += `&where[propertyType][equals]=${options.propertyType}`;
  }
  if (options?.listingType) {
    where += `&where[listingType][equals]=${options.listingType}`;
  }
  if (options?.priceMin !== undefined) {
    where += `&where[price][greater_than_equal]=${options.priceMin}`;
  }
  if (options?.priceMax !== undefined) {
    where += `&where[price][less_than_equal]=${options.priceMax}`;
  }
  if (options?.excludeId) {
    where += `&where[id][not_equals]=${options.excludeId}`;
  }

  try {
    const data = await fetchAPI(
      `/apartments?${where}&depth=1&limit=${limit}&locale=${locale}`,
    );
    return data.docs || [];
  } catch (error) {
    console.error("Error in getApartmentsByOwner:", error);
    return [];
  }
}

// ─────────────────────────────────────────────────────────────
// Apartment Filters
// ─────────────────────────────────────────────────────────────
export interface ApartmentFilters {
  q?: string;                  // free-text: title OR address
  propertyType?: string;       // apartment | boarding_room | land_house
  listingType?: string;        // sale | rent
  wardIds?: number[];          // resolved ward-level location IDs
  priceMin?: number;           // only applied when listingType is also set
  priceMax?: number;
  ownerSlug?: string;          // filter by agent
  bedrooms?: number;
}

export function buildApartmentWhere(filters: ApartmentFilters): string {
  let where = "";

  if (filters.q) {
    // OR across title + address for free-text
    where += `&where[or][0][title][like]=${encodeURIComponent(filters.q)}`;
    where += `&where[or][1][address][like]=${encodeURIComponent(filters.q)}`;
  }

  if (filters.propertyType) {
    where += `&where[propertyType][equals]=${filters.propertyType}`;
  }

  if (filters.listingType) {
    where += `&where[listingType][equals]=${filters.listingType}`;
  }

  if (filters.ownerSlug) {
    where += `&where[owner.agentSlug][equals]=${filters.ownerSlug}`;
  }

  if (filters.bedrooms !== undefined) {
    where += `&where[keyFacts.bedrooms][equals]=${filters.bedrooms}`;
  }

  // Location: ward IDs resolved before this call
  if (filters.wardIds && filters.wardIds.length > 0) {
    filters.wardIds.forEach((id, i) => {
      where += `&where[location.region][in][${i}]=${id}`;
    });
  }

  // Price: ONLY apply when listingType is also provided
  if (
    filters.listingType &&
    (filters.priceMin !== undefined || filters.priceMax !== undefined)
  ) {
    const priceUnit = filters.listingType === "sale" ? "total" : "per_month";
    where += `&where[priceUnit][equals]=${priceUnit}`;
    if (filters.priceMin !== undefined) {
      where += `&where[price][greater_than_equal]=${filters.priceMin}`;
    }
    if (filters.priceMax !== undefined) {
      where += `&where[price][less_than_equal]=${filters.priceMax}`;
    }
  }

  return where;
}

export async function getApartments(
  locale: string,
  filtersOrExtraWhere: ApartmentFilters | string = {},
  limit: number = 20,
): Promise<Apartment[]> {
  try {
    const extraWhere =
      typeof filtersOrExtraWhere === "string"
        ? filtersOrExtraWhere
        : buildApartmentWhere(filtersOrExtraWhere);
    const data = await fetchAPI(
      `/apartments?depth=1&limit=${limit}&locale=${locale}${extraWhere}`,
    );
    return data.docs || [];
  } catch (error) {
    console.error("Error in getApartments:", error);
    return [];
  }
}


export async function getApartmentBySlug(
  slug: string,
  locale: string,
): Promise<Apartment | null> {
  try {
    const data = await fetchAPI(
      `/apartments?where[slug][equals]=${slug}&depth=2&locale=${locale}`,
    );
    if (data.docs && data.docs.length > 0) {
      return data.docs[0];
    }
    return null;
  } catch (error) {
    console.error("Error in getApartmentBySlug:", error);
    return null;
  }
}

export async function getFeaturedAgents(limit: number = 4): Promise<User[]> {
  try {
    const data = await fetchAPI(
      `/users?where[verified][equals]=true&sort=-successfulTransactions&limit=${limit}`
    );
    return data.docs || [];
  } catch (error) {
    console.error("Error in getFeaturedAgents:", error);
    return [];
  }
}

export async function getCuratedApartments(
  listingType: "sale" | "rent",
  locale: string,
  extraWhere: string = "",
  limit: number = 6
): Promise<Apartment[]> {
  try {
    const data = await fetchAPI(
      `/apartments?where[listingType][equals]=${listingType}${extraWhere}&depth=1&limit=${limit}&locale=${locale}`
    );
    return data.docs || [];
  } catch (error) {
    console.error("Error in getCuratedApartments:", error);
    return [];
  }
}

export async function getLocations(locale: string): Promise<Location[]> {
  try {
    const data = await fetchAPI(
      `/locations?limit=500&depth=1&locale=${locale}`
    );
    return data.docs || [];
  } catch (error) {
    console.error("Error in getLocations:", error);
    return [];
  }
}
