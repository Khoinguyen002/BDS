import { NextResponse } from "next/server";
import { SERVER_URL } from "@/lib/payload-fetcher";

export async function POST(
  req: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    
    // Attempt to parse ID
    const id = parseInt(params.id, 10);
    if (isNaN(id)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

    const internalApiKey = process.env.INTERNAL_API_KEY;
    
    const fetchRes = await fetch(`${SERVER_URL}/api/apartments/${id}`, {
      headers: {
        "x-internal-api-key": internalApiKey || "",
      }
    });
    
    if (!fetchRes.ok) {
       return NextResponse.json({ error: "Apartment not found" }, { status: 404 });
    }
    const apt = await fetchRes.json();
    
    await fetch(`${SERVER_URL}/api/apartments/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "x-internal-api-key": internalApiKey || "",
      },
      body: JSON.stringify({ viewCount: (apt.viewCount || 0) + 1 }),
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to increment view count" }, { status: 500 });
  }
}
