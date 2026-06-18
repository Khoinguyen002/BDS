import { Apartment } from "@bds/shared/payload-types";

export type DetailProfile = "tro" | "apartment_rent" | "apartment_sale" | "land_sale";

export function resolveProfile(apt: Apartment): DetailProfile {
  if (apt.propertyType === "boarding_room") return "tro";
  if (apt.propertyType === "land_house") return "land_sale";
  return apt.listingType === "rent" ? "apartment_rent" : "apartment_sale";
}

// NOTE: each string must match a `case` handled in DetailBody's switch.
// Unknown keys silently render nothing (default -> null).
export const DETAIL_LAYOUT: Record<DetailProfile, string[]> = {
  // Trọ: chi phí thật + nội quy lên đầu (trên màn hình đầu), mô tả xuống sau.
  tro: ["cost", "rules", "overview", "amenities", "specs", "location"],
  apartment_rent: ["furniture", "fees", "overview", "specs", "amenities", "location"],
  // Mua bán: pháp lý lên cao. Đầu tư (rental yield) đã hiển thị ở sidebar.
  apartment_sale: ["legal", "overview", "specs", "amenities", "location"],
  land_sale: ["legal", "overview", "specs", "amenities", "location"],
};
