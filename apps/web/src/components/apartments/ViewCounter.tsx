"use client";

import { useEffect } from "react";

export function ViewCounter({ apartmentId }: { apartmentId: number }) {
  useEffect(() => {
    // Only increment once per session to avoid spam
    const key = `viewed_apt_${apartmentId}`;
    if (!sessionStorage.getItem(key)) {
      sessionStorage.setItem(key, "true");
      fetch(`/api/apartments/${apartmentId}/view`, { method: "POST" }).catch(() => {});
    }
  }, [apartmentId]);

  return null;
}
