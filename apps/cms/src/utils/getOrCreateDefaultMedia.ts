import type { PayloadRequest } from "payload";

export async function getOrCreateDefaultMedia(
  req: PayloadRequest,
  filename: string,
  url: string
): Promise<number | undefined> {
  try {
    const existing = await req.payload.find({
      collection: "media",
      where: { filename: { equals: filename } },
      limit: 1,
      req,
    });

    if (existing.docs.length > 0) {
      return existing.docs[0].id as number;
    }

    // If not exists, download and create
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const contentType = response.headers.get("content-type") || "image/jpeg";

    const media = await req.payload.create({
      collection: "media",
      data: {
        owner: req.user?.id as number,
      },
      file: {
        data: buffer,
        name: filename,
        mimetype: contentType,
        size: buffer.byteLength,
      },
      req,
    });

    return media.id as number;
  } catch (error) {
    console.error(`Failed to get/create default media for ${filename}:`, error);
    return undefined;
  }
}
