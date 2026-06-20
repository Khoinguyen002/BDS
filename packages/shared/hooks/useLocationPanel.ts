// @ts-nocheck
import { useState, useMemo, useCallback } from "react";
import type { Location } from "../payload-types";

export interface SelectedLocation {
  id: number;
  slug: string;
  title: string;
  level: "city" | "district" | "ward";
}

export interface UseLocationPanelProps {
  allLocations: Location[];
  value: SelectedLocation[];
  onChange: (selected: SelectedLocation[]) => void;
}

export function getParentId(loc: Location): number | null {
  if (!loc.parent) return null;
  if (typeof loc.parent === "number") return loc.parent;
  if (typeof loc.parent === "object" && loc.parent !== null)
    return (loc.parent as Location).id;
  return null;
}

export function toSelected(loc: Location): SelectedLocation {
  return {
    id: loc.id,
    slug: loc.slug as string,
    title: loc.title as string,
    level: loc.level as "city" | "district" | "ward",
  };
}

// Logic copied from frontend lib
export function getDisabledLocationIds(
  selected: SelectedLocation[],
  allLocations: Location[]
): Set<number> {
  const disabled = new Set<number>();
  const selectedDistrictIds = selected.filter((v) => v.level === "district").map((v) => v.id);

  // If a district is selected, all its wards are disabled (implied selection)
  for (const loc of allLocations) {
    if (loc.level === "ward") {
      const parentId = getParentId(loc);
      if (parentId !== null && selectedDistrictIds.includes(parentId)) {
        disabled.add(loc.id);
      }
    }
  }
  return disabled;
}

export function useLocationPanel({ allLocations, value, onChange }: UseLocationPanelProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const searchLower = searchQuery.toLowerCase().trim();
  const [focusedDistrictId, setFocusedDistrictId] = useState<number | null>(null);

  const selectedIds = useMemo(() => new Set(value.map((v) => v.id)), [value]);
  const disabledIds = useMemo(
    () => getDisabledLocationIds(value, allLocations),
    [value, allLocations],
  );

  const partialDistrictIds = useMemo(() => {
    const partial = new Set<number>();
    for (const sel of value) {
      const loc = allLocations.find((l) => l.id === sel.id);
      if (loc?.level === "ward") {
        const parentId = getParentId(loc);
        if (parentId !== null && !selectedIds.has(parentId)) {
          partial.add(parentId);
        }
      }
    }
    return partial;
  }, [value, allLocations, selectedIds]);

  const cities = useMemo(() => allLocations.filter((l) => l.level === "city"), [allLocations]);
  const districts = useMemo(() => allLocations.filter((l) => l.level === "district"), [allLocations]);
  const wards = useMemo(() => allLocations.filter((l) => l.level === "ward"), [allLocations]);

  const activeWards = useMemo(() => {
    if (!focusedDistrictId) return [];
    return wards.filter((w: Location) => getParentId(w) === focusedDistrictId);
  }, [wards, focusedDistrictId]);

  const districtIds = useMemo(() => new Set(districts.map((d: Location) => d.id)), [districts]);
  const hasWardChildren = useCallback(
    (districtId: number) => wards.some((w: Location) => getParentId(w) === districtId),
    [wards],
  );

  const toggle = useCallback(
    (loc: Location) => {
      if (disabledIds.has(loc.id)) return;

      const locSelected = toSelected(loc);
      if (selectedIds.has(loc.id)) {
        onChange(value.filter((v) => v.id !== loc.id));
      } else {
        let newValue = [...value];
        if (loc.level === "district") {
          newValue = newValue.filter((v) => {
            const ward = allLocations.find((l) => l.id === v.id);
            return !(ward && ward.level === "ward" && getParentId(ward) === loc.id);
          });
        }
        onChange([...newValue, locSelected]);
      }
    },
    [value, onChange, selectedIds, disabledIds, allLocations],
  );

  const selectedDistricts = value.filter((v) => districtIds.has(v.id));
  const selectedWards = value.filter((v) => {
    const loc = allLocations.find((l) => l.id === v.id);
    return loc?.level === "ward";
  });

  const searchResults = useMemo(() => {
    if (!searchLower) return [];
    return allLocations.filter(
      (loc) => (loc.title as string).toLowerCase().includes(searchLower) && loc.level !== "city"
    );
  }, [searchLower, allLocations]);

  const cityForDistricts = cities[0];

  return {
    searchQuery,
    setSearchQuery,
    searchLower,
    focusedDistrictId,
    setFocusedDistrictId,
    selectedIds,
    disabledIds,
    partialDistrictIds,
    cities,
    districts,
    wards,
    activeWards,
    districtIds,
    hasWardChildren,
    toggle,
    selectedDistricts,
    selectedWards,
    searchResults,
    cityForDistricts,
    getParentId
  };
}
