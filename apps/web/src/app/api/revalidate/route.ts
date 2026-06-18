import { NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { env } from "@/env";

export async function POST(req: NextRequest) {
  const token = req.headers.get("authorization");
  if (token !== `Bearer ${env.REVALIDATE_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { path, tag } = await req.json();
    if (!path && !tag)
      return NextResponse.json({ error: "Path or tag required" }, { status: 400 });
    
    if (path) revalidatePath(path);
    if (tag) {
      // @ts-expect-error Next.js 16 types incorrectly require a second argument 'profile'
      revalidateTag(tag);
    }

    return NextResponse.json({ revalidated: true });
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON payload" },
      { status: 400 },
    );
  }
}
