/**
 * payload-fetcher.ts
 *
 * Centralized service for data fetching from Payload CMS API.
 *
 * Quy tắc:
 * 1. autoCacheFetch CHỈ gọi Payload built-in REST API (/api/{collection-slug})
 * 2. Collection tag tự derive từ endpoint — KHÔNG truyền tag thủ công
 * 3. Custom endpoint → dùng fetch() thường, KHÔNG cache
 * 4. Cache: infinite (revalidate: false) + tag tường minh; làm tươi hoàn toàn
 *    dựa vào revalidateTag từ CMS hook (xem @bds/shared/cache-tags)
 */

import type { User, LandingPage, Apartment, Location, Tag, AppSetting } from "@bds/shared/payload-types";
import { COLLECTION_TAGS } from "@bds/shared/cache-tags";
import { getLocale } from 'next-intl/server';
import { env } from "../env";

const SERVER_URL = env.NEXT_PUBLIC_SERVER_URL;
const REVALIDATE_TIME = false; // Infinite cache — chỉ dựa vào tag purge từ CMS.

/**
 * autoCacheFetch — fetch Payload built-in REST API với auto-tagging.
 *
 * Auto-derive collection tag từ endpoint path:
 *   "/apartments?where..." → "apartments" → COLLECTION_TAGS.apartments
 *   "/users?where..."      → "users"      → COLLECTION_TAGS.users
 *
 * Throws nếu collection không tồn tại trong COLLECTION_TAGS (→ dùng fetch()
 * thường cho custom endpoint).
 */
async function autoCacheFetch(
  endpoint: string,
  options?: RequestInit,
) {
  // Auto-derive collection slug từ endpoint
  const collectionSlug = endpoint
    .replace(/^\//, "")        // bỏ leading /
    .split("?")[0]             // bỏ query string
    .split("/")[0];            // lấy segment đầu tiên

  // Validate: slug phải tồn tại trong COLLECTION_TAGS values
  // (keys là camelCase, values là slug gốc — match endpoint)
  const collectionTag = Object.values(COLLECTION_TAGS).find(
    (tag) => tag === collectionSlug,
  );
  if (!collectionTag) {
    throw new Error(
      `autoCacheFetch: "${collectionSlug}" không có trong COLLECTION_TAGS. ` +
      `Dùng fetch() thường cho custom endpoint.`,
    );
  }

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
    next: {
      revalidate: REVALIDATE_TIME,
      tags: [collectionTag],
      ...options?.next,
    },
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch API: ${url.toString()} - Status: ${res.status}`);
  }
  return res.json();
}

// ─────────────────────────────────────────────────────────────
// User fetchers
// ─────────────────────────────────────────────────────────────

export async function getUserBySlug(agentSlug: string): Promise<User | null> {
  try {
    const data = await autoCacheFetch(
      `/users?where[agentSlug][equals]=${agentSlug}`,
    );
    if (data.docs && data.docs.length > 0) {
      return data.docs[0];
    }
    return null;
  } catch (error) {
    console.error("Error in getUserBySlug:", error);
    return null;
  }
}

export async function getFeaturedAgents(limit: number = 4): Promise<User[]> {
  try {
    const data = await autoCacheFetch(
      `/users?where[verified][equals]=true&sort=-successfulTransactions&limit=${limit}`,
    );
    return data.docs || [];
  } catch (error) {
    console.error("Error in getFeaturedAgents:", error);
    return [];
  }
}

// ─────────────────────────────────────────────────────────────
// Landing Page fetchers
// ─────────────────────────────────────────────────────────────

export async function getLandingPageByOwner(
  userId: string | number,
): Promise<LandingPage | null> {
  try {
    const data = await autoCacheFetch(
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

// ─────────────────────────────────────────────────────────────
// Translations
// ─────────────────────────────────────────────────────────────

type DictionaryNode = string | { [key: string]: DictionaryNode };

export const getDictionary = async (locale: string): Promise<Record<string, DictionaryNode>> => {
  try {
    const data = await autoCacheFetch(
      `/translations?locale=${locale}&limit=1000`,
      { cache: "force-cache" },
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

// ─────────────────────────────────────────────────────────────
// Apartment fetchers
// ─────────────────────────────────────────────────────────────

export const getApartmentBySlugOrId = async (
  slugOrId: string,
): Promise<Apartment | null> => {
  try {
    // Attempt fetch by slug first
    const data = await autoCacheFetch(
      `/apartments?where[slug][equals]=${slugOrId}&depth=2`,
    );
    if (data.docs && data.docs.length > 0) {
      return data.docs[0];
    }

    // Fallback: Attempt fetch by ID if slug not found (and it's a valid ID)
    const fallbackData = await autoCacheFetch(`/apartments/${slugOrId}?depth=2`);
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
    tagIds?: number[];
    listingType?: string;
    priceMin?: number;
    priceMax?: number;
    excludeId?: string | number;
    limit?: number;
  }
): Promise<Apartment[]> {
  const limit = options?.limit || 6;
  let where = `where[owner][equals]=${ownerId}`;

  if (options?.tagIds && options.tagIds.length > 0) {
    options.tagIds.forEach((id, i) => {
      where += `&where[tags][in][${i}]=${id}`;
    });
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
    const data = await autoCacheFetch(
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
  tagIds?: number[];           // filter theo tag
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

  if (filters.tagIds && filters.tagIds.length > 0) {
    filters.tagIds.forEach((id, i) => {
      where += `&where[tags][in][${i}]=${id}`;
    });
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
    const data = await autoCacheFetch(
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
    const data = await autoCacheFetch(
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

export async function getCuratedApartments(
  listingType: "sale" | "rent",
  locale: string,
  extraWhere: string = "",
  limit: number = 6
): Promise<Apartment[]> {
  try {
    const data = await autoCacheFetch(
      `/apartments?where[listingType][equals]=${listingType}${extraWhere}&depth=1&limit=${limit}&locale=${locale}`,
    );
    return data.docs || [];
  } catch (error) {
    console.error("Error in getCuratedApartments:", error);
    return [];
  }
}

// ─────────────────────────────────────────────────────────────
// Locations & Tags
// ─────────────────────────────────────────────────────────────

export async function getLocations(locale: string): Promise<Location[]> {
  try {
    const data = await autoCacheFetch(
      `/locations?limit=500&depth=1&locale=${locale}`,
    );
    return data.docs || [];
  } catch (error) {
    console.error("Error in getLocations:", error);
    return [];
  }
}

export async function getTags(locale: string): Promise<Tag[]> {
  try {
    const data = await autoCacheFetch(`/tags?limit=200&locale=${locale}`);
    return data.docs || [];
  } catch (error) {
    console.error("Error in getTags:", error);
    return [];
  }
}

// ─────────────────────────────────────────────────────────────
// App Settings
// ─────────────────────────────────────────────────────────────

export async function getAppSettings(): Promise<AppSetting | null> {
  try {
    const url = new URL(`${SERVER_URL}/api/globals/app-settings`);
    const res = await fetch(url.toString(), {
      next: {
        revalidate: REVALIDATE_TIME,
        tags: [COLLECTION_TAGS.appSettings],
      },
    });
    if (!res.ok) {
      return null;
    }
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Error in getAppSettings:", error);
    return null;
  }
}
