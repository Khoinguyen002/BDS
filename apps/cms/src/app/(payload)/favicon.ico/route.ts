import { getPayload } from "payload";
import configPromise from "../../../payload.config";
import { generateFaviconResponse } from "@bds/shared/favicon";
import type { AppSetting } from "@bds/shared/payload-types";

export async function GET() {
  let settings: AppSetting | null = null;
  try {
    const payload = await getPayload({ config: configPromise });
    settings = (await payload.findGlobal({
      slug: "app-settings",
    })) as AppSetting;
  } catch (error) {
    console.error("Error fetching settings for favicon:", error);
  }

  return generateFaviconResponse(settings);
}
