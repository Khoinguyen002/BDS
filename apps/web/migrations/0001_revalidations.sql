-- Tag cache table cho @opennextjs/cloudflare D1 tag cache (NEXT_TAG_CACHE_D1).
-- Lưu timestamp revalidation theo tag, phục vụ revalidateTag / revalidatePath.
CREATE TABLE IF NOT EXISTS revalidations (
  tag           TEXT    NOT NULL,
  revalidatedAt INTEGER NOT NULL,
  stale         INTEGER,
  expire        INTEGER
);

CREATE INDEX IF NOT EXISTS idx_revalidations_tag ON revalidations (tag);
