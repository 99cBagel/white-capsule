// Builds the D1 import SQL for the white-capsule database from the capsule
// files under space/<capsule>/ (this capsule: space/snail32/). One statement
// per line, so the deploy script can send them one by one (or as one batch).
// Usage: node scripts/import-to-d1.mjs > import.sql
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dataDir = join(root, "space", "snail32");
const readJson = (name) => JSON.parse(readFileSync(join(dataDir, name), "utf8"));

// Single quotes doubled; newlines flattened so one statement stays on one line.
const esc = (v) => (v === null || v === undefined ? "NULL" : `'${String(v).replace(/\n/g, " ").replace(/'/g, "''")}'`);
const out = [];
const line = (s) => out.push(s);

line(`CREATE TABLE IF NOT EXISTS meta (key TEXT PRIMARY KEY, value TEXT);`);
line(`CREATE TABLE IF NOT EXISTS spec_fields (field TEXT PRIMARY KEY, section TEXT NOT NULL, value TEXT, status TEXT NOT NULL, source TEXT);`);
line(`CREATE TABLE IF NOT EXISTS comparison_rows (dimension TEXT PRIMARY KEY, snail32_value TEXT, snail32_status TEXT, snail32_source TEXT, baseline_value TEXT, baseline_status TEXT, baseline_source TEXT, verdict TEXT, migration_note TEXT);`);
line(`CREATE TABLE IF NOT EXISTS sourcing (key TEXT PRIMARY KEY, value TEXT, status TEXT NOT NULL, source TEXT);`);
line(`CREATE TABLE IF NOT EXISTS compliance_rows (item TEXT PRIMARY KEY, status TEXT NOT NULL, cert_no TEXT, evidence TEXT, date TEXT, notes TEXT);`);
line(`CREATE TABLE IF NOT EXISTS docs (file TEXT PRIMARY KEY, kind TEXT, status TEXT NOT NULL, note TEXT);`);
for (const t of ["meta", "spec_fields", "comparison_rows", "sourcing", "compliance_rows", "docs"]) line(`DELETE FROM ${t};`);

const capsule = readJson("capsule.json");
const spec = readJson("spec.json");
const comparison = readJson("comparison.json");
const sourcing = readJson("sourcing.json");
const manifest = readJson("docs/docs-manifest.json");

const meta = {
  capsule: capsule.capsule,
  version: capsule.version,
  product: spec.product ?? "Snail32",
  status: capsule.status,
  updated: capsule.updated,
  baseline_product: comparison.baseline.product,
  baseline_source: comparison.baseline.source,
};
for (const [k, v] of Object.entries(meta)) {
  line(`INSERT INTO meta (key, value) VALUES (${esc(k)}, ${esc(v)});`);
}

for (const [section, fields] of Object.entries(spec)) {
  if (section === "note" || section === "product" || section === "status" || section === "version") continue;
  for (const [key, leaf] of Object.entries(fields)) {
    line(`INSERT INTO spec_fields (field, section, value, status, source) VALUES (${esc(`${section}.${key}`)}, ${esc(section)}, ${esc(leaf.value)}, ${esc(leaf.status)}, ${esc(leaf.source)});`);
  }
}

for (const row of comparison.rows) {
  line(`INSERT INTO comparison_rows (dimension, snail32_value, snail32_status, snail32_source, baseline_value, baseline_status, baseline_source, verdict, migration_note) VALUES (${esc(row.dimension)}, ${esc(row.snail32.value)}, ${esc(row.snail32.status)}, ${esc(row.snail32.source)}, ${esc(row.esp32.value)}, ${esc(row.esp32.status)}, ${esc(row.esp32.source)}, ${esc(row.verdict)}, ${esc(row.migration_note)});`);
}

// Generic flatten: {value,status,source} is a leaf; anything else recurses;
// arrays are indexed. Plain leaves get status "unknown".
function flattenSourcing(obj, prefix, rows) {
  if (Array.isArray(obj)) {
    obj.forEach((item, i) => flattenSourcing(item, `${prefix}.${i}`, rows));
    return;
  }
  if (obj !== null && typeof obj === "object") {
    if ("value" in obj && "status" in obj) {
      rows.push({ key: prefix, value: obj.value, status: obj.status, source: obj.source ?? null });
      return;
    }
    for (const [k, v] of Object.entries(obj)) flattenSourcing(v, prefix ? `${prefix}.${k}` : k, rows);
    return;
  }
  rows.push({ key: prefix, value: obj, status: "unknown", source: null });
}
const srows = [];
flattenSourcing(sourcing, "", srows);
for (const r of srows) {
  if (r.key === "note" || r.key === "product" || r.key === "status" || r.key === "version") continue;
  line(`INSERT INTO sourcing (key, value, status, source) VALUES (${esc(r.key)}, ${esc(r.value)}, ${esc(r.status)}, ${esc(r.source)});`);
}

const complianceMd = readFileSync(join(dataDir, "compliance.md"), "utf8");
for (const raw of complianceMd.split("\n")) {
  const l = raw.trim();
  if (!l.startsWith("|") || l.includes("---")) continue;
  const cells = l.split("|").slice(1, -1).map((c) => c.trim());
  if (cells.length !== 6 || cells[0] === "Item") continue;
  const [item, status, certNo, evidence, date, notes] = cells.map((c) => (c === "—" || c === "" ? null : c));
  line(`INSERT INTO compliance_rows (item, status, cert_no, evidence, date, notes) VALUES (${esc(item)}, ${esc(status)}, ${esc(certNo)}, ${esc(evidence)}, ${esc(date)}, ${esc(notes)});`);
}

for (const d of manifest.expected_docs) {
  line(`INSERT INTO docs (file, kind, status, note) VALUES (${esc(d.file)}, ${esc(d.kind)}, ${esc(d.status)}, ${esc(d.note)});`);
}

console.log(out.join("\n"));
