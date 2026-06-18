import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { env } from "@/env";

export async function POST(req: NextRequest) {
  const token = req.headers.get("authorization");
  if (token !== `Bearer ${env.REVALIDATE_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { path } = await req.json();
    if (!path)
      return NextResponse.json({ error: "Path required" }, { status: 400 });
    revalidatePath(path);
    return NextResponse.json({ revalidated: true });
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON payload" },
      { status: 400 },
    );
  }
}
