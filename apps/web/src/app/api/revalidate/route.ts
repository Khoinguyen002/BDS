import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { env } from "@/env";

// Cache CHỈ invalidate qua tag — không còn revalidatePath. Mỗi fetch tự khai
// tag tường minh (xem @bds/shared/cache-tags), nên CMS chỉ cần gửi đúng tag.
export async function POST(req: NextRequest) {
  const token = req.headers.get("authorization");
  if (token !== `Bearer ${env.REVALIDATE_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();

    // Chấp nhận cả dạng đơn (tag) lẫn dạng batch (tags) trong 1 request.
    const tags: string[] = [
      ...(body.tag ? [body.tag] : []),
      ...(Array.isArray(body.tags) ? body.tags : []),
    ];

    if (tags.length === 0)
      return NextResponse.json({ error: "Tag required" }, { status: 400 });

    // Next 16: revalidateTag yêu cầu profile thứ 2. Dạng 1 tham số đã deprecated.
    // Dùng "max" (stale-while-revalidate): user đầu tiên sau purge VẪN nhận data
    // cũ ngay (không chờ origin fetch), data mới được refetch ở background và
    // phục vụ từ request kế tiếp. Trễ 1 nhịp nhưng không ai phải block.
    for (const t of tags) revalidateTag(t, "max");

    return NextResponse.json({ revalidated: true, tags: tags.length });
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON payload" },
      { status: 400 },
    );
  }
}
