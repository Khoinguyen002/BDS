/**
 * gen-cache-tags.ts
 *
 * Introspect Payload collection configs → auto-generate cache-tags.ts
 *
 * Output:
 *   1. COLLECTION_TAGS — mỗi cacheable collection → tag string
 *   2. REVERSE_DEPS — transitive closure: khi X đổi → cascade purge TẤT CẢ
 *      collections phụ thuộc (trực tiếp + gián tiếp qua BFS)
 *
 * Chạy: pnpm --filter cms run gen:cache-tags
 * Khi nào: mỗi khi thêm/sửa collection hoặc relationship field
 *
 * Cách đánh dấu collection KHÔNG cache:
 *   custom: { cacheable: false }  trong collection config
 */

import type { CollectionConfig, GlobalConfig, Field, Block } from "payload";
import { writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

// ── Import tất cả collection configs ────────────────────────────────
import { Users } from "../src/collections/Users.js";
import { Apartments } from "../src/collections/Apartments.js";
import { LandingPages } from "../src/collections/LandingPages.js";
import { Locations } from "../src/collections/Locations.js";
import { Tags } from "../src/collections/Tags.js";
import { Translations } from "../src/collections/Translations.js";
import { Amenities } from "../src/collections/Amenities.js";
import { Media } from "../src/collections/Media.js";
import { Leads } from "../src/collections/Leads.js";
import { Templates } from "../src/collections/Templates.js";

// ── Import tất cả global configs ────────────────────────────────────
import { AppSettings } from "../src/globals/AppSettings.js";

const ALL_COLLECTIONS: CollectionConfig[] = [
  Users,
  Apartments,
  LandingPages,
  Locations,
  Tags,
  Translations,
  Amenities,
  Media,
  Leads,
  Templates,
];

const ALL_GLOBALS: GlobalConfig[] = [
  AppSettings,
];

// ── Helpers ─────────────────────────────────────────────────────────

/**
 * Đệ quy scan fields để tìm tất cả relationTo targets.
 * Cover: relationship, upload, group, array, collapsible, row, tabs, blocks.
 * Polymorphic relationTo (mảng) cũng được handle.
 */
function extractRelationships(fields: Field[]): string[] {
  const rels: string[] = [];
  for (const field of fields) {
    // Relationship + Upload đều có thể reference collection khác
    if (
      (field.type === "relationship" || field.type === "upload") &&
      "relationTo" in field
    ) {
      const targets = Array.isArray(field.relationTo)
        ? field.relationTo   // polymorphic: ["users", "apartments"]
        : [field.relationTo]; // single: "users"
      rels.push(...targets);
    }

    // Recurse vào container fields: group, array, collapsible, row
    if ("fields" in field && Array.isArray((field as { fields?: Field[] }).fields)) {
      rels.push(...extractRelationships((field as { fields: Field[] }).fields));
    }

    // Recurse vào tabs
    if (field.type === "tabs" && "tabs" in field) {
      for (const tab of field.tabs) {
        if ("fields" in tab) rels.push(...extractRelationships(tab.fields));
      }
    }

    // Recurse vào blocks (có thể lồng sâu nhiều tầng)
    if (field.type === "blocks" && "blocks" in field) {
      for (const block of field.blocks as Block[]) {
        rels.push(...extractRelationships(block.fields));
      }
    }
  }
  return rels;
}

/** Slug → camelCase key cho COLLECTION_TAGS */
function slugToKey(slug: string): string {
  return slug.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
}

/**
 * BFS transitive closure: từ direct deps → resolve TẤT CẢ downstream collections.
 *
 * VD: directDeps = { users: {apartments}, apartments: {landing-pages} }
 *     → transitive: users → [apartments, landing-pages]
 */
function computeTransitiveClosure(
  directDeps: Record<string, Set<string>>,
): Record<string, string[]> {
  const result: Record<string, string[]> = {};

  for (const source of Object.keys(directDeps)) {
    const visited = new Set<string>();
    const queue = [...(directDeps[source] ?? [])];

    while (queue.length > 0) {
      const current = queue.shift()!;
      if (visited.has(current)) continue;
      visited.add(current);

      // Nếu current cũng có deps → tiếp tục BFS
      const nextDeps = directDeps[current];
      if (nextDeps) {
        for (const dep of nextDeps) {
          if (!visited.has(dep)) queue.push(dep);
        }
      }
    }

    if (visited.size > 0) {
      result[source] = [...visited];
    }
  }

  return result;
}

// ── Build ───────────────────────────────────────────────────────────

type EntityConfig = CollectionConfig | GlobalConfig;
const ALL_ENTITIES: EntityConfig[] = [...ALL_COLLECTIONS, ...ALL_GLOBALS];

// Exclude entities marked with custom.cacheable === false
const excluded = new Set(
  ALL_ENTITIES.filter(
    (c) => (c.custom as Record<string, unknown>)?.cacheable === false,
  ).map((c) => c.slug),
);

const cacheable = ALL_ENTITIES.filter((c) => !excluded.has(c.slug));

// 1. COLLECTION_TAGS
const collectionTags: Record<string, string> = {};
for (const col of cacheable) {
  collectionTags[slugToKey(col.slug)] = col.slug;
}

// 2. Build direct reverse deps
const directReverseDeps: Record<string, Set<string>> = {};

for (const col of cacheable) {
  const targets = extractRelationships(col.fields).filter(
    (t) => !excluded.has(t) && t !== col.slug, // Skip excluded + self-reference
  );

  for (const target of targets) {
    if (!directReverseDeps[target]) directReverseDeps[target] = new Set();
    directReverseDeps[target].add(col.slug);
  }
}

// 3. Compute transitive closure via BFS
const transitiveDeps = computeTransitiveClosure(directReverseDeps);

// ── Generate output ─────────────────────────────────────────────────

const lines: string[] = [
  "// ⚠️ AUTO-GENERATED by apps/cms/scripts/gen-cache-tags.ts — DO NOT EDIT MANUALLY",
  "// Chạy: pnpm --filter cms run gen:cache-tags",
  "//",
  "// Source of truth: Payload collection configs (relationship fields)",
  `// Excluded (custom.cacheable: false): ${[...excluded].join(", ")}`,
  "",
  "// ── Collection-level tags ────────────────────────────────────────────",
  "export const COLLECTION_TAGS = {",
];

for (const [key, slug] of Object.entries(collectionTags)) {
  lines.push(`  ${key}: "${slug}",`);
}
lines.push("} as const;");
lines.push("");
lines.push(
  "export type CollectionTag = (typeof COLLECTION_TAGS)[keyof typeof COLLECTION_TAGS];",
);
lines.push("");

// REVERSE_DEPS (transitive)
lines.push(
  "// ── Reverse dependency map (transitive closure via BFS) ──────────",
);
lines.push(
  "// Khi collection X thay đổi → cascade purge TẤT CẢ collections phụ thuộc",
);
lines.push("// (trực tiếp + gián tiếp). Auto-derived từ Payload relationship fields.");
lines.push(
  "export const REVERSE_DEPS: Readonly<Record<string, readonly CollectionTag[]>> = {",
);

for (const [slug, deps] of Object.entries(transitiveDeps)) {
  if (deps.length === 0) continue;
  const key = slugToKey(slug);
  // Chỉ output nếu key tồn tại trong COLLECTION_TAGS (slug cacheable)
  if (!(key in collectionTags)) continue;
  const tagRef = `COLLECTION_TAGS.${key}`;
  const depsList = deps
    .map((s) => `COLLECTION_TAGS.${slugToKey(s)}`)
    .join(", ");
  lines.push(`  [${tagRef}]: [${depsList}],`);
}

lines.push("};");
lines.push("");

// External tags
lines.push(
  "// ── External source tags (không phải Payload collection) ───────────",
);
lines.push('export const EXCHANGE_RATE_TAG = "exchange-rate";');
lines.push("");

// Write to packages/shared/cache-tags.ts
const __dirname = dirname(fileURLToPath(import.meta.url));
const outPath = resolve(__dirname, "../../../packages/shared/cache-tags.ts");

writeFileSync(outPath, lines.join("\n") + "\n", "utf-8");

console.log(`✅ Generated ${outPath}`);
console.log(`   Cacheable: ${Object.keys(collectionTags).join(", ")}`);
console.log(`   Excluded:  ${[...excluded].join(", ")}`);
console.log(
  `   Reverse deps (transitive): ${Object.entries(transitiveDeps)
    .filter(([, v]) => v.length > 0)
    .map(([k, v]) => `${k} → [${v.join(", ")}]`)
    .join("; ")}`,
);
