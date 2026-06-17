import { User } from "./payload-types";

export const TIERS = {
  free: {
    maxApt: 5,
    maxImg: 10,
    video: false,
    maxStorageMB: 500,
    maxBlocks: 20,
  },
  pro: {
    maxApt: 100,
    maxImg: 50,
    video: true,
    maxStorageMB: 10000,
    maxBlocks: 50,
  },
};

export function getEffectiveTier(
  user: User | null | undefined,
): "free" | "pro" {
  if (
    user?.subscription?.tier === "pro" &&
    user.subscription?.expiresAt &&
    new Date(user.subscription.expiresAt) > new Date()
  ) {
    return "pro";
  }
  return "free";
}
