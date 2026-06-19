import { NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { env } from "@/env";

export async function POST(req: NextRequest) {
  const token = req.headers.get("authorization");
  if (token !== `Bearer ${env.REVALIDATE_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();

    // Chấp nhận cả dạng đơn (path/tag) lẫn dạng batch (paths/tags) trong 1 request.
    const paths: string[] = [
      ...(body.path ? [body.path] : []),
      ...(Array.isArray(body.paths) ? body.paths : []),
    ];
    const tags: string[] = [
      ...(body.tag ? [body.tag] : []),
      ...(Array.isArray(body.tags) ? body.tags : []),
    ];

    if (paths.length === 0 && tags.length === 0)
      return NextResponse.json({ error: "Path or tag required" }, { status: 400 });

    for (const p of paths) revalidatePath(p);
    // { expire: 0 } = hết hạn NGAY: request kế tiếp là cache miss, fetch tươi
    // (blocking). Đây là pattern Next khuyến nghị cho webhook/3rd-party gọi
    // Route Handler cần thấy data mới ngay. ("max" là SWR → còn thấy bản cũ 1 lượt.)
    for (const t of tags) revalidateTag(t, { expire: 0 });

    return NextResponse.json({ revalidated: true, paths: paths.length, tags: tags.length });
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON payload" },
      { status: 400 },
    );
  }
}
