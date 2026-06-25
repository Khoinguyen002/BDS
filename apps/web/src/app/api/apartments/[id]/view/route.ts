import { getPayload } from "payload";
import configPromise from "@bds/cms/payload.config";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const payload = await getPayload({ config: configPromise });
    
    // Attempt to parse ID
    const id = parseInt(params.id, 10);
    if (isNaN(id)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

    const apt = await payload.findByID({ collection: "apartments", id, depth: 0 });
    
    await payload.update({
      collection: "apartments",
      id,
      data: { viewCount: (apt.viewCount || 0) + 1 },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to increment view count" }, { status: 500 });
  }
}
