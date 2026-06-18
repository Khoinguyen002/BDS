import React from "react";
import type { LandingPage, User, Apartment } from "@bds/shared/payload-types";
import { getApartmentsByOwner } from "@/lib/payload-fetcher";
import { ListApartmentsClient } from "./ListApartmentsClient";
import { getLocale } from "next-intl/server";

export default async function ListApartments(
  props: Extract<
    NonNullable<LandingPage["blocks"]>[number],
    { blockType: "listApartments" }
  > & { ownerId?: number | User; agentSlug?: string },
) {
  const { apartmentsFilter, ownerId, agentSlug } = props;
  const owner = typeof ownerId === "object" ? ownerId?.id : ownerId;
  const locale = await getLocale();

  let apartments: Apartment[] = [];

  if (apartmentsFilter && apartmentsFilter.length > 0) {
    apartments = apartmentsFilter
      .map((ap) => (typeof ap === "object" ? ap : ({} as Apartment)))
      .filter((ap) => ap.id);
  } else if (owner) {
    apartments = await getApartmentsByOwner(owner, locale, { limit: 6 });
  }

  return <ListApartmentsClient apartments={apartments} agentSlug={agentSlug} />;
}
