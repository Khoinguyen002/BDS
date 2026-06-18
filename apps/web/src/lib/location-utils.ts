/**
 * location-utils.ts
 *
 * Utilities for resolving location slugs → ward IDs for Payload queries.
 * Apartments store location.region at WARD level.
 * When user selects a district → expand to all child ward IDs.
 * When user selects a ward → use its ID directly.
 */

import type { Location } from "@bds/shared/payload-types";

function getParentId(loc: Location): number | null {
  if (!loc.parent) return null;
  if (typeof loc.parent === "number") return loc.parent;
  if (typeof loc.parent === "object" && loc.parent !== null) {
    return (loc.parent as Location).id;
  }
  return null;
}

/**
 * Given a list of location slugs (from URL param `location=slug1,slug2`),
 * resolve them into an array of ward-level IDs suitable for `where[location.region][in]`.
 *
 * - Ward slug → 1 ward ID
 * - District slug → all child ward IDs under that district
 * - City slug → all ward IDs in the city (expand fully; use with caution)
 */
export function resolveLocationSlugsToWardIds(
  slugs: string[],
  allLocations: Location[],
): number[] {
  if (!slugs.length) return [];

  const wardIds = new Set<number>();

  for (const slug of slugs) {
    const loc = allLocations.find((l) => l.slug === slug);
    if (!loc) continue;

    if (loc.level === "ward") {
      wardIds.add(loc.id);
    } else if (loc.level === "district") {
      // Expand to all wards whose parent = this district
      allLocations
        .filter((l) => l.level === "ward" && getParentId(l) === loc.id)
        .forEach((w) => wardIds.add(w.id));
    } else if (loc.level === "city") {
      // First get all districts of this city
      const districts = allLocations.filter(
        (l) => l.level === "district" && getParentId(l) === loc.id,
      );
      // Then all wards of those districts
      for (const d of districts) {
        allLocations
          .filter((l) => l.level === "ward" && getParentId(l) === d.id)
          .forEach((w) => wardIds.add(w.id));
      }
    }
  }

  return [...wardIds];
}

/**
 * For UI: given selected location IDs, determine which location IDs should be
 * disabled in the combobox (wards whose parent district is already selected).
 */
export function getDisabledLocationIds(
  selectedLocations: Pick<Location, "id" | "level" | "parent">[],
  allLocations: Location[],
): Set<number> {
  const disabled = new Set<number>();

  for (const sel of selectedLocations) {
    if (sel.level === "district") {
      // Disable all wards that belong to this district
      allLocations
        .filter((l) => l.level === "ward" && getParentId(l) === sel.id)
        .forEach((w) => disabled.add(w.id));
    }
    if (sel.level === "city") {
      // Disable all districts + wards under this city
      const districts = allLocations.filter(
        (l) => l.level === "district" && getParentId(l) === sel.id,
      );
      districts.forEach((d) => {
        disabled.add(d.id);
        allLocations
          .filter((l) => l.level === "ward" && getParentId(l) === d.id)
          .forEach((w) => disabled.add(w.id));
      });
    }
  }

  return disabled;
}
