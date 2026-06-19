import type { PayloadRequest } from 'payload';
import { env } from '../env';

// ── Debounce / coalescing ────────────────────────────────────────────
// Gom mọi paths/tags phát sinh trong cửa sổ FLUSH_MS rồi gửi 1 request duy
// nhất. Khử trùng lặp qua Set. Dùng fixed-window (không reset timer mỗi lần
// gọi) để tránh starvation khi update liên tục.
//
// Lưu ý: state nằm in-memory của process CMS (long-running node). Nếu process
// thoát trong cửa sổ flush thì các revalidation đang chờ sẽ mất — chấp nhận được.
const FLUSH_MS = 500;

let pendingPaths = new Set<string>();
let pendingTags = new Set<string>();
let flushTimer: ReturnType<typeof setTimeout> | null = null;

const postRevalidate = async (body: Record<string, unknown>) => {
  return fetch(`${env.NEXT_PUBLIC_APP_URL}/api/revalidate`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${env.REVALIDATE_SECRET}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
};

const flush = async () => {
  flushTimer = null;
  const paths = [...pendingPaths];
  const tags = [...pendingTags];
  pendingPaths = new Set();
  pendingTags = new Set();
  if (!paths.length && !tags.length) return;
  try {
    await postRevalidate({ paths, tags });
  } catch (err) {
    console.error('Revalidation flush error', err);
  }
};

const scheduleFlush = () => {
  if (flushTimer) return; // đã có flush đang chờ trong cửa sổ hiện tại
  flushTimer = setTimeout(() => {
    void flush();
  }, FLUSH_MS);
};

export const triggerRevalidatePaths = (paths: string[]) => {
  for (const p of paths) pendingPaths.add(p);
  scheduleFlush();
};

export const triggerRevalidateTag = ({
  tag,
  req,
}: {
  tag: string | string[];
  req?: PayloadRequest;
}) => {
  void req; // giữ chữ ký cũ; lỗi được log trong flush
  const tags = Array.isArray(tag) ? tag : [tag];
  for (const t of tags) pendingTags.add(t);
  scheduleFlush();
};
