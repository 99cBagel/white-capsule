// Builds the D1 import SQL for the white-capsule database.
//
// SOURCE OF TRUTH = the 4 Core MD documents in space/snail32/capsules/
// (datasheet, pinout, SDK quickstart, reference designs) plus the document
// manifest, capsules/docs-manifest.json. There are no JSON data files any more:
// the former spec.json / comparison.json / sourcing.json / compliance.md /
// capsule.json were folded into the Core MDs and retired on 2026-11-27.
// D1 is a derived read copy of the documents, nothing more.
//
// The manifest names the production files (snail32-datasheet.pdf,
// snail32-pinout.png, snail32-sdk-quickstart.md,
// snail32-reference-designs.pdf); the content file for each is the same
// basename with a .md extension, in the same capsules/ folder.
//
// Tables emitted:
//   meta         — capsule name, version, baseline naming.
//   docs         — one row per manifest entry (file, kind, status, note).
//   doc_sections — each Core MD split by its ## sections (doc, idx, title, body).
//   fact_rows    — rows parsed generically from the MD tables, by header
//                  name (doc, section, item, reference, snail32, status, note).
//
// Usage: node src/import-to-d1.mjs > import.sql
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const docsDir = join(root, "space", "snail32", "capsules");
const readText = (name) => readFileSync(join(docsDir, name), "utf8");

// Carried over from the retired capsule.json (read at migration time,
// 2026-11-27) and stated in the datasheet's "How to read this capsule" note.
const META = {
  capsule: "white-capsule",
  version: "0.5.0",
  product: "Snail32",
  status: "mockup-concept",
  baseline_product: "ESP32-S3-WROOM-1 (ESP32-S3)",
  baseline_source: "Espressif ESP32-S3 Series Datasheet v1.9",
};

// Doc ids, keyed by a keyword in the manifest file's basename.
const DOC_IDS = [
  ["datasheet", "datasheet"],
  ["pinout", "pinout"],
  ["sdk", "sdk"],
  ["reference-designs", "reference-designs"],
];
function docIdFor(manifestFile) {
  const base = manifestFile.replace(/\.[^.]+$/, "");
  for (const [keyword, id] of DOC_IDS) if (base.includes(keyword)) return { id, contentFile: `${base}.md` };
  throw new Error(`No doc id mapping for manifest file: ${manifestFile}`);
}

// Single quotes doubled; newlines flattened so one statement stays on one line.
const esc = (v) => (v === null || v === undefined ? "NULL" : `'${String(v).replace(/\n/g, " ").replace(/'/g, "''")}'`);
const out = [];
const line = (s) => out.push(s);

line(`CREATE TABLE IF NOT EXISTS meta (key TEXT PRIMARY KEY, value TEXT);`);
line(`CREATE TABLE IF NOT EXISTS docs (file TEXT PRIMARY KEY, kind TEXT, status TEXT NOT NULL, note TEXT);`);
line(`CREATE TABLE IF NOT EXISTS doc_sections (doc TEXT NOT NULL, idx INTEGER NOT NULL, title TEXT, body TEXT, PRIMARY KEY (doc, idx));`);
line(`CREATE TABLE IF NOT EXISTS doc_texts (doc TEXT PRIMARY KEY, markdown TEXT);`);
line(`CREATE TABLE IF NOT EXISTS fact_rows (doc TEXT NOT NULL, section TEXT, item TEXT, "reference" TEXT, snail32 TEXT, status TEXT, note TEXT);`);
// Retired by the Core-MD migration (2026-11-27): the old JSON-fed tables.
for (const t of ["spec_fields", "comparison_rows", "sourcing", "compliance_rows"]) line(`DROP TABLE IF EXISTS ${t};`);
for (const t of ["meta", "docs", "doc_sections", "fact_rows", "doc_texts"]) line(`DELETE FROM ${t};`);

for (const [k, v] of Object.entries(META)) {
  line(`INSERT INTO meta (key, value) VALUES (${esc(k)}, ${esc(v)});`);
}

// Example questions: the initialize preload, stored whole (newlines kept)
// from the space's example-questions.md — that file is the only copy; the
// Worker reads it back from meta at initialize time.
const exampleQuestions = readFileSync(join(root, "space", "snail32", "example-questions.md"), "utf8");
line(`INSERT INTO meta (key, value) VALUES ('example_questions', '${exampleQuestions.replace(/'/g, "''")}');`);

const manifest = JSON.parse(readText("docs-manifest.json"));
for (const d of manifest.expected_docs) {
  line(`INSERT INTO docs (file, kind, status, note) VALUES (${esc(d.file)}, ${esc(d.kind)}, ${esc(d.status)}, ${esc(d.note)});`);
}

// --- Markdown section splitting -------------------------------------------
// Split by "## " headings. The chunk before the first heading (title,
// banner, intro) becomes section idx 0, titled by the document's H1.
function splitSections(md) {
  const sections = [];
  let cur = { title: null, lines: [] };
  for (const l of md.split("\n")) {
    const m = l.match(/^##\s+(.*)$/);
    if (m) {
      sections.push(cur);
      cur = { title: m[1].trim(), lines: [l] };
    } else {
      cur.lines.push(l);
    }
  }
  sections.push(cur);
  return sections.map((s, i) => {
    let title = s.title;
    if (title === null) {
      const h1 = s.lines.find((l) => /^#\s+/.test(l));
      title = h1 ? h1.replace(/^#\s+/, "").trim() : "Preamble";
    }
    return { idx: i, title, body: s.lines.join("\n").trim() };
  });
}

// --- Markdown table parsing ------------------------------------------------
function splitRow(l) {
  return l.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map((c) => c.trim());
}
function parseTables(body) {
  const lines = body.split("\n");
  const tables = [];
  let i = 0;
  while (i < lines.length) {
    const isRow = (l) => /^\s*\|/.test(l);
    const isSep = (l) => /^\s*\|[\s:|-]+\|\s*$/.test(l) && l.includes("-");
    if (isRow(lines[i]) && i + 1 < lines.length && isSep(lines[i + 1])) {
      const header = splitRow(lines[i]);
      const rows = [];
      i += 2;
      while (i < lines.length && isRow(lines[i]) && !isSep(lines[i])) {
        rows.push(splitRow(lines[i]));
        i++;
      }
      tables.push({ header, rows });
    } else {
      i++;
    }
  }
  return tables;
}

// Map one table row to a fact, generically by header name. Unmapped columns
// are folded into the note as "Header: value" (Notes columns stay raw).
function mapFact(docId, sectionTitle, header, cells) {
  const H = header.map((h) => h.toLowerCase());
  const used = new Set();
  const at = (idx) => (idx >= 0 && idx < cells.length ? cells[idx] : null);
  const find = (pred) => {
    for (let i = 0; i < H.length; i++) if (!used.has(i) && pred(H[i], i)) { used.add(i); return i; }
    return -1;
  };

  let item = null, reference = null, snail32 = null, status = null;
  const notes = [];

  const pinIdx = find((h) => h === "no.");
  if (pinIdx >= 0) {
    // Pin table: item = "Pin N — NAME", reference = function, snail32 = position.
    const nameIdx = find((h) => h === "name");
    const fnIdx = find((h) => h.includes("function") || h.includes("esp32-s3"));
    const posIdx = find((h) => h.includes("snail32"));
    item = `Pin ${at(pinIdx)} — ${at(nameIdx)}`;
    reference = at(fnIdx);
    snail32 = at(posIdx);
    const pos = snail32 ?? "";
    status = /TBD/.test(pos) && /^Same as reference/.test(pos) ? "Target / TBD"
      : /\(target\)/.test(pos) ? "Target"
      : /TBD/.test(pos) ? "TBD" : null;
  } else {
    const itemIdx = find((h) => ["item", "dimension", "field", "question", "design", "reference pin", "qty", "quantity"].includes(h));
    const refIdx = find((h) => h === "reference" || h.includes("esp32-s3") || h.includes("function") || h.includes("role on the reference"));
    const snailIdx = find((h) => h === "snail32" || h.includes("snail32 position") || h.includes("snail32 (target)") || h === "value" || h.includes("unit price"));
    const statusIdx = find((h) => h === "status" || h === "snail32 status");
    item = at(itemIdx);
    if (itemIdx >= 0 && (H[itemIdx] === "qty" || H[itemIdx] === "quantity") && item !== null) item = `Qty ${item}`;
    reference = at(refIdx);
    snail32 = at(snailIdx);
    status = at(statusIdx);
    if (status === null && /head-to-head/i.test(sectionTitle)) status = "Target";
  }

  for (let i = 0; i < header.length; i++) {
    if (used.has(i)) continue;
    const v = at(i);
    if (v === null || v === "") continue;
    notes.push(H[i] === "note" || H[i] === "notes" ? v : `${header[i]}: ${v}`);
  }
  if (item === null || item === "") return null;
  return { doc: docId, section: sectionTitle, item, reference, snail32, status, note: notes.length ? notes.join(" ") : null };
}

// --- Import the Core MDs ----------------------------------------------------
for (const d of manifest.expected_docs) {
  const { id, contentFile } = docIdFor(d.file);
  const raw = readText(contentFile);
  // The full original markdown, newlines kept (esc() flattens them) —
  // the browsing routes (/capsules) render from this; the MCP reads
  // the parsed sections and facts.
  line(`INSERT INTO doc_texts (doc, markdown) VALUES (${esc(id)}, '${raw.replace(/'/g, "''")}');`);
  const sections = splitSections(raw);
  for (const s of sections) {
    line(`INSERT INTO doc_sections (doc, idx, title, body) VALUES (${esc(id)}, ${s.idx}, ${esc(s.title)}, ${esc(s.body)});`);
    for (const t of parseTables(s.body)) {
      for (const cells of t.rows) {
        const f = mapFact(id, s.title, t.header, cells);
        if (f) line(`INSERT INTO fact_rows (doc, section, item, "reference", snail32, status, note) VALUES (${esc(f.doc)}, ${esc(f.section)}, ${esc(f.item)}, ${esc(f.reference)}, ${esc(f.snail32)}, ${esc(f.status)}, ${esc(f.note)});`);
      }
    }
  }
}

console.log(out.join("\n"));
