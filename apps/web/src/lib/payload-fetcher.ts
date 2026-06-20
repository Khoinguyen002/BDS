/**
 * payload-fetcher.ts
 *
 * Centralized service for data fetching from Payload CMS API.
 * Cache: infinite (revalidate: false) + tag tường minh; làm tươi hoàn toàn dựa
 * vào revalidateTag từ CMS hook (xem @bds/shared/cache-tags).
 */

import type { User, LandingPage, Apartment, Location, Tag } from "@bds/shared/payload-types";
import {
  COLLECTION_TAGS,
  apartmentTag,
  userTag,
  landingPageByOwnerTag,
} from "@bds/shared/cache-tags";
import { getLocale } from 'next-intl/server';
import { env } from "../env";

const SERVER_URL = env.NEXT_PUBLIC_SERVER_URL;
const REVALIDATE_TIME = false; // Infinite cache — chỉ dựa vào tag purge từ CMS.

/**
 * Mọi fetch muốn được cache PHẢI khai báo `tags` tường minh. Không còn suy tag
 * bằng regex từ endpoint nữa: caller tự chọn đúng tag (xem @bds/shared/cache-tags)
 * sao cho khớp với tag mà CMS hook purge.
 */
async function fetchAPI(
  endpoint: string,
  tags: string[],
  options?: RequestInit,
) {
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
      tags,
      ...options?.next,
    },
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch API: ${url.toString()} - Status: ${res.status}`);
  }
  return res.json();
}

export async function getUserBySlug(agentSlug: string): Promise<User | null> {
  try {
    const data = await fetchAPI(`/users?where[agentSlug][equals]=${agentSlug}`, [
      userTag(agentSlug),
    ]);
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
      // Per-doc theo owner + collection tag để khớp purge từ CMS LandingPages.
      [landingPageByOwnerTag(userId), COLLECTION_TAGS.landingPages],
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
      [COLLECTION_TAGS.translations],
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

export const getApartmentBySlugOrId = async (
  slugOrId: string,
): Promise<Apartment | null> => {
  try {
    // Detail (depth=2) nhúng owner → kèm COLLECTION_TAGS.users để đổi profile
    // agent cũng làm tươi trang. CMS purge cả apartment:<slug> lẫn apartment:<id>.
    const docTags = [apartmentTag(slugOrId), COLLECTION_TAGS.users];

    // Attempt fetch by slug first
    const data = await fetchAPI(
      `/apartments?where[slug][equals]=${slugOrId}&depth=2`,
      docTags,
    );
    if (data.docs && data.docs.length > 0) {
      return data.docs[0];
    }

    // Fallback: Attempt fetch by ID if slug not found (and it's a valid ID)
    const fallbackData = await fetchAPI(`/apartments/${slugOrId}?depth=2`, docTags);
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
    const data = await fetchAPI(
      `/apartments?${where}&depth=1&limit=${limit}&locale=${locale}`,
      [COLLECTION_TAGS.apartments],
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
    const data = await fetchAPI(
      `/apartments?depth=1&limit=${limit}&locale=${locale}${extraWhere}`,
      [COLLECTION_TAGS.apartments],
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
      // Per-doc + users (depth=2 nhúng owner).
      [apartmentTag(slug), COLLECTION_TAGS.users],
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
      `/users?where[verified][equals]=true&sort=-successfulTransactions&limit=${limit}`,
      [COLLECTION_TAGS.users],
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
      `/apartments?where[listingType][equals]=${listingType}${extraWhere}&depth=1&limit=${limit}&locale=${locale}`,
      [COLLECTION_TAGS.apartments],
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
      `/locations?limit=500&depth=1&locale=${locale}`,
      [COLLECTION_TAGS.locations],
    );
    return data.docs || [];
  } catch (error) {
    console.error("Error in getLocations:", error);
    return [];
  }
}

export async function getTags(locale: string): Promise<Tag[]> {
  try {
    const data = await fetchAPI(`/tags?limit=200&locale=${locale}`, [
      COLLECTION_TAGS.tags,
    ]);
    return data.docs || [];
  } catch (error) {
    console.error("Error in getTags:", error);
    return [];
  }
}
