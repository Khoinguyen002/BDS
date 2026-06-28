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
import { writeFileSync, readdirSync } from "fs";
import { resolve, dirname, join } from "path";
import { fileURLToPath, pathToFileURL } from "url";

// ── Tự động Import tất cả collection và global configs ─────────────
const __dirname = dirname(fileURLToPath(import.meta.url));

async function getConfigsFromDir(dirPath: string) {
  const files = readdirSync(dirPath).filter(
    (f) => f.endsWith(".ts") && !f.endsWith(".d.ts") && f !== "index.ts" && !f.includes("Blocks.ts")
  );
  const configs: Record<string, unknown>[] = [];
  for (const file of files) {
    const importedModule = await import(pathToFileURL(join(dirPath, file)).href);
    for (const key of Object.keys(importedModule)) {
      if (typeof importedModule[key] === "object" && importedModule[key] !== null && "slug" in importedModule[key]) {
        configs.push(importedModule[key] as Record<string, unknown>);
      }
    }
  }
  return configs;
}

const ALL_COLLECTIONS = await getConfigsFromDir(resolve(__dirname, "../src/collections")) as CollectionConfig[];
const ALL_GLOBALS = await getConfigsFromDir(resolve(__dirname, "../src/globals")) as GlobalConfig[];

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

// ── Guardrail Check: Quên Invalidate Cache ─────────────────────────
const missingHooks: string[] = [];
for (const col of cacheable) {
  const hasAfterChange = col.hooks?.afterChange && col.hooks.afterChange.length > 0;
  if (!hasAfterChange) {
    missingHooks.push(col.slug);
  }
}

if (missingHooks.length > 0) {
  throw new Error(
    `🚨 BÁO ĐỘNG ĐỎ: Các Collection/Global sau có bật Cache nhưng QUÊN khai báo hook 'afterChange' để triggerRevalidate: ${missingHooks.join(", ")}`
  );
}

// 1. Tags separation
const collectionTags: Record<string, string> = {};
const globalTags: Record<string, string> = {};

const collectionSlugs = new Set(ALL_COLLECTIONS.map(c => c.slug));
const globalSlugs = new Set(ALL_GLOBALS.map(c => c.slug));

for (const col of cacheable) {
  if (collectionSlugs.has(col.slug)) {
    collectionTags[slugToKey(col.slug)] = col.slug;
  } else if (globalSlugs.has(col.slug)) {
    globalTags[slugToKey(col.slug)] = col.slug;
  }
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

lines.push("// ── Global-level tags ────────────────────────────────────────────────");
lines.push("export const GLOBAL_TAGS = {");
for (const [key, slug] of Object.entries(globalTags)) {
  lines.push(`  ${key}: "${slug}",`);
}
lines.push("} as const;");
lines.push("");
lines.push(
  "export type GlobalTag = (typeof GLOBAL_TAGS)[keyof typeof GLOBAL_TAGS];",
);
lines.push("");


// REVERSE_DEPS (transitive)
lines.push(
  "// ── Reverse dependency map (transitive closure via BFS) ──────────",
);
lines.push(
  "// Khi collection/global X thay đổi → cascade purge TẤT CẢ entities phụ thuộc",
);
lines.push("// (trực tiếp + gián tiếp). Auto-derived từ Payload relationship fields.");
lines.push(
  "export const REVERSE_DEPS: Readonly<Record<string, readonly (CollectionTag | GlobalTag)[]>> = {",
);

function getTagRef(slug: string) {
  const key = slugToKey(slug);
  if (key in collectionTags) return `COLLECTION_TAGS.${key}`;
  if (key in globalTags) return `GLOBAL_TAGS.${key}`;
  return null;
}

for (const [slug, deps] of Object.entries(transitiveDeps)) {
  if (deps.length === 0) continue;
  
  const sourceRef = getTagRef(slug);
  if (!sourceRef) continue;

  const depsList = deps
    .map((s) => getTagRef(s))
    .filter(Boolean)
    .join(", ");
    
  if (depsList) {
    lines.push(`  [${sourceRef}]: [${depsList}],`);
  }
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
const outPath = resolve(__dirname, "../../../packages/shared/cache-tags.ts");

writeFileSync(outPath, lines.join("\n") + "\n", "utf-8");

console.log(`✅ Generated ${outPath}`);
console.log(`   Collections: ${Object.keys(collectionTags).join(", ")}`);
console.log(`   Globals:     ${Object.keys(globalTags).join(", ")}`);
console.log(`   Excluded:    ${[...excluded].join(", ")}`);
console.log(
  `   Reverse deps: ${Object.entries(transitiveDeps)
    .filter(([, v]) => v.length > 0)
    .map(([k, v]) => `${k} → [${v.join(", ")}]`)
    .join("; ")}`,
);
