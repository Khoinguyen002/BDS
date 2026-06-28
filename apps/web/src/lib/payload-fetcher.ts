/**
 * payload-fetcher.ts
 *
 * Centralized service for data fetching from Payload CMS API.
 *
 * Quy tắc:
 * 1. fetchPayloadData CHỈ gọi Payload built-in REST API (/api/{collection-slug} hoặc /api/globals/{global-slug})
 * 2. Tag tự derive từ endpoint — KHÔNG truyền tag thủ công, phân biệt Collection/Global bằng cache-tags.ts
 * 3. Custom endpoint → dùng fetch() thường, KHÔNG cache
 * 4. Cache: infinite (revalidate: false) + tag tường minh; làm tươi hoàn toàn
 *    dựa vào revalidateTag từ CMS hook (xem @bds/shared/cache-tags)
 */

import type { User, LandingPage, Apartment, Location, Tag, AppSetting, Plan } from "@bds/shared/payload-types";
import { COLLECTION_TAGS, type CollectionTag, GLOBAL_TAGS, type GlobalTag } from "@bds/shared/cache-tags";
import { getLocale } from 'next-intl/server';
import { stringify } from 'qs-esm';
import { env } from "../env";

/** Payload `where` clause — nested operators (equals, in, like, …). */
type WhereField = Record<string, unknown>;
export type Where = {
  [key: string]: WhereField | Where[] | undefined;
  and?: Where[];
  or?: Where[];
};

export const SERVER_URL = env.NEXT_PUBLIC_SERVER_URL;
const REVALIDATE_TIME = env.NODE_ENV === "development" ? 1 : false; // Infinite cache — chỉ dựa vào tag purge từ CMS.
const DEFAULT_LOCALE = "vi";

/**
 * resolveLocale — lấy locale hiện tại từ next-intl (request context).
 * Fallback về DEFAULT_LOCALE khi gọi ngoài request context.
 */
async function resolveLocale(): Promise<string> {
  try {
    return await getLocale();
  } catch {
    return DEFAULT_LOCALE;
  }
}

/**
 * PayloadQuery — query params chuẩn của Payload REST API.
 * `where` là object lồng nhau, được qs-esm serialize thành
 * `where[owner][equals]=...` thay vì nối chuỗi thủ công.
 */
export interface PayloadQuery {
  where?: Where;
  sort?: string;
  limit?: number;
  page?: number;
  depth?: number;
  locale?: string;
  /** Fetch 1 document theo id: /api/{collection}/{id} */
  id?: string | number;
}

/**
 * fetchPayloadData — fetch Payload built-in collection/global REST API với auto-tagging.
 *
 * - Nhận diện tự động CollectionTag (truy xuất /api/{slug}) hoặc GlobalTag (/api/globals/{slug}).
 * - Cache tag = chính entity đó (tường minh, không derive từ chuỗi).
 * - Query params được chuẩn hóa qua qs-esm (where lồng nhau, array, v.v.).
 * - locale tự lấy từ next-intl nếu không truyền.
 */
async function fetchPayloadData(
  tag: CollectionTag | GlobalTag,
  query: PayloadQuery = {},
  options?: RequestInit,
) {
  const isGlobal = Object.values(GLOBAL_TAGS).includes(tag as GlobalTag);
  const isCollection = Object.values(COLLECTION_TAGS).includes(tag as CollectionTag);

  if (!isGlobal && !isCollection) {
    throw new Error(`fetchPayloadData: "${tag}" không có trong COLLECTION_TAGS hoặc GLOBAL_TAGS.`);
  }

  const { id, locale, ...rest } = query;
  const search = stringify(
    { ...rest, locale: locale ?? (await resolveLocale()) },
    { addQueryPrefix: true },
  );

  let path = "";
  if (isGlobal) {
    path = `globals/${tag}`;
  } else {
    path = id != null ? `${tag}/${id}` : tag;
  }

  const url = `${SERVER_URL}/api/${path}${search}`;

  const res = await fetch(url, {
    ...options,
    next: {
      revalidate: REVALIDATE_TIME,
      tags: [tag],
      ...options?.next,
    },
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch API: ${url} - Status: ${res.status}`);
  }
  return res.json();
}

// ─────────────────────────────────────────────────────────────
// User fetchers
// ─────────────────────────────────────────────────────────────

export async function getUserBySlug(agentSlug: string): Promise<User | null> {
  try {
    const data = await fetchPayloadData(COLLECTION_TAGS.users, {
      where: { agentSlug: { equals: agentSlug } },
    });
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
    const data = await fetchPayloadData(COLLECTION_TAGS.users, {
      where: { verified: { equals: true } },
      sort: "-successfulTransactions",
      limit,
    });
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
    const data = await fetchPayloadData(COLLECTION_TAGS.landingPages, {
      where: { owner: { equals: userId } },
      depth: 1,
    });
    if (data.docs && data.docs.length > 0) {
      return data.docs[0];
    }
    return null;
  } catch (error) {
    console.error("Error in getLandingPageByOwner:", error);
    return null;
  }
}

export async function getHomepage(): Promise<{ blocks?: Record<string, unknown>[] } | null> {
  try {
    const data = await fetchPayloadData(GLOBAL_TAGS.homepage);
    return data;
  } catch (error) {
    console.error("Error in getHomepage:", error);
    return null;
  }
}

// ─────────────────────────────────────────────────────────────
// Translations
// ─────────────────────────────────────────────────────────────

type DictionaryNode = string | { [key: string]: DictionaryNode };

export const getDictionary = async (locale: string): Promise<Record<string, DictionaryNode>> => {
  try {
    const data = await fetchPayloadData(
      COLLECTION_TAGS.translations,
      { locale, limit: 1000 },
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
    const data = await fetchPayloadData(COLLECTION_TAGS.apartments, {
      where: { slug: { equals: slugOrId } },
      depth: 2,
    });
    if (data.docs && data.docs.length > 0) {
      return data.docs[0];
    }

    // Fallback: Attempt fetch by ID if slug not found (and it's a valid ID)
    const fallbackData = await fetchPayloadData(COLLECTION_TAGS.apartments, {
      id: slugOrId,
      depth: 2,
    });
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
  const where: Where = { owner: { equals: ownerId } };

  if (options?.tagIds && options.tagIds.length > 0) {
    where.tags = { in: options.tagIds };
  }
  if (options?.listingType) {
    where.listingType = { equals: options.listingType };
  }
  if (options?.priceMin !== undefined || options?.priceMax !== undefined) {
    where.price = {
      ...(options.priceMin !== undefined && { greater_than_equal: options.priceMin }),
      ...(options.priceMax !== undefined && { less_than_equal: options.priceMax }),
    };
  }
  if (options?.excludeId) {
    where.id = { not_equals: options.excludeId };
  }

  try {
    const data = await fetchPayloadData(COLLECTION_TAGS.apartments, {
      where,
      depth: 1,
      limit,
      locale,
    });
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

export function buildApartmentWhere(filters: ApartmentFilters): Where {
  const where: Where = {};

  if (filters.q) {
    // OR across title + address for free-text
    where.or = [
      { title: { like: filters.q } },
      { address: { like: filters.q } },
    ];
  }

  if (filters.tagIds && filters.tagIds.length > 0) {
    where.tags = { in: filters.tagIds };
  }

  if (filters.listingType) {
    where.listingType = { equals: filters.listingType };
  }

  if (filters.ownerSlug) {
    where["owner.agentSlug"] = { equals: filters.ownerSlug };
  }

  if (filters.bedrooms !== undefined) {
    where["keyFacts.bedrooms"] = { equals: filters.bedrooms };
  }

  // Location: ward IDs resolved before this call
  if (filters.wardIds && filters.wardIds.length > 0) {
    where["location.region"] = { in: filters.wardIds };
  }

  // Price: ONLY apply when listingType is also provided
  if (
    filters.listingType &&
    (filters.priceMin !== undefined || filters.priceMax !== undefined)
  ) {
    where.priceUnit = { equals: filters.listingType === "sale" ? "total" : "per_month" };
    where.price = {
      ...(filters.priceMin !== undefined && { greater_than_equal: filters.priceMin }),
      ...(filters.priceMax !== undefined && { less_than_equal: filters.priceMax }),
    };
  }

  return where;
}

export async function getApartments(
  locale: string,
  filters: ApartmentFilters = {},
  limit: number = 20,
): Promise<Apartment[]> {
  try {
    const data = await fetchPayloadData(COLLECTION_TAGS.apartments, {
      where: buildApartmentWhere(filters),
      depth: 1,
      limit,
      locale,
    });
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
    const data = await fetchPayloadData(COLLECTION_TAGS.apartments, {
      where: { slug: { equals: slug } },
      depth: 2,
      locale,
    });
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
  extraWhere: Where = {},
  limit: number = 6
): Promise<Apartment[]> {
  try {
    const data = await fetchPayloadData(COLLECTION_TAGS.apartments, {
      where: { listingType: { equals: listingType }, ...extraWhere },
      depth: 1,
      limit,
      locale,
    });
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
    const data = await fetchPayloadData(COLLECTION_TAGS.locations, {
      limit: 500,
      depth: 1,
      locale,
    });
    return data.docs || [];
  } catch (error) {
    console.error("Error in getLocations:", error);
    return [];
  }
}

export async function getTags(locale: string): Promise<Tag[]> {
  try {
    const data = await fetchPayloadData(COLLECTION_TAGS.tags, { limit: 200, locale });
    return data.docs || [];
  } catch (error) {
    console.error("Error in getTags:", error);
    return [];
  }
}

// ─────────────────────────────────────────────────────────────
// App Settings
// ─────────────────────────────────────────────────────────────

export async function getPlans(locale: string): Promise<Plan[]> {
  try {
    const data = await fetchPayloadData(COLLECTION_TAGS.plans, {
      limit: 100,
      locale,
      sort: "price",
    });
    return data.docs || [];
  } catch (error) {
    console.error("Error in getPlans:", error);
    return [];
  }
}

export async function getAppSettings(): Promise<AppSetting | null> {
  try {
    const data = await fetchPayloadData(GLOBAL_TAGS.appSettings);
    return data;
  } catch (error) {
    console.error("Error in getAppSettings:", error);
    return null;
  }
}
