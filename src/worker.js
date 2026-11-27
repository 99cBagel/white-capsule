// White Capsule MCP server — Snail32.
// Read-only, no auth, stores nothing, logs nothing (clean-book rule).
// Source of truth: the 4 Core MD documents in space/snail32/capsules/
// (datasheet, pinout, SDK quickstart, reference designs). Data lives in
// D1 (database `white-capsule`), imported from those documents by
// src/import-to-d1.mjs; D1 is a derived read copy of the documents.
//
// Transport: Streamable HTTP, protocol 2025-06-18. Hand-rolled JSON-RPC,
// same shape as devices-control-worker (no SDK, no dependencies).

const CAPSULE_VERSION = "0.5.0";
const SERVER_NAME = "white-capsule";
const PROTOCOL_VERSION = "2025-06-18";
const HSTS = "max-age=31536000; includeSubDomains";

// Initialize instructions are built at request time from D1 meta
// 'example_questions', imported from space/snail32/example-questions.md —
// that .md is the only copy; there is no JS duplicate to keep in step.

const TOPICS = [
  { id: "datasheet", description: "Snail32 datasheet — spec tables vs the ESP32-S3 reference, head-to-head comparison, certifications, ordering information." },
  { id: "pinout", description: "Reference pin map (ESP32-S3-WROOM-1, verified) with the Snail32 position per pin, strapping pins, and the drop-in question." },
  { id: "sdk", description: "SDK quickstart — the real ESP-IDF flow on ESP32-S3 and the Snail32 position at each step, including porting." },
  { id: "reference-designs", description: "Five concept reference designs adapted from real ESP32 applications, with their Snail32 TBD blockers." },
  { id: "docs", description: "The capsule's document manifest — the 4 Core documents and their status." },
];

const DOC_IDS = ["datasheet", "pinout", "sdk", "reference-designs", "docs"];

const MCP_TOOLS = [
  {
    name: "capsule_topics",
    description: "List the capsule's sections.",
    inputSchema: { type: "object", additionalProperties: false, properties: {} },
  },
  {
    name: "capsule_search",
    description: "Search the capsule's Core documents by text. Returns matching table facts and document passages, each with doc and section.",
    inputSchema: {
      type: "object",
      additionalProperties: false,
      properties: {
        query: { type: "string", description: "Text to search for." },
        topics: { type: "array", items: { type: "string" }, description: "Optional doc filter: datasheet, pinout, sdk, reference-designs." },
        limit: { type: "integer", description: "Max results, 1-10, default 5." },
      },
      required: ["query"],
    },
  },
  {
    name: "capsule_get",
    description: "Return a Core document (or one section of it) as markdown, with the section's parsed table facts. doc_id 'docs' returns the document manifest.",
    inputSchema: {
      type: "object",
      additionalProperties: false,
      properties: {
        doc_id: { type: "string", description: "datasheet, pinout, sdk, reference-designs, or docs." },
        section: { type: "string", description: "Optional: part of a section title within the document, e.g. 'Power' or 'Head-to-head'." },
      },
      required: ["doc_id"],
    },
  },
  {
    name: "capsule_compare",
    description: "Head-to-head rows vs the ESP32-S3 baseline, from the datasheet's comparison table — with verdicts and migration notes.",
    inputSchema: {
      type: "object",
      additionalProperties: false,
      properties: {
        dimension: { type: "string", description: "Optional single dimension, e.g. 'ADC'." },
      },
    },
  },
  {
    name: "capsule_checkout",
    description: "Ordering information from the datasheet: price ladder, MOQ, lead time, samples — all targets or TBD, not quotes.",
    inputSchema: { type: "object", additionalProperties: false, properties: {} },
  },
];

function json(value, status = 200) {
  return Response.json(value, { status, headers: { "cache-control": "no-store", "strict-transport-security": HSTS } });
}
function rpcResult(id, result) {
  return Response.json({ jsonrpc: "2.0", id, result }, { headers: { "strict-transport-security": HSTS } });
}
function rpcError(id, code, message) {
  return Response.json({ jsonrpc: "2.0", id: id ?? null, error: { code, message } }, { headers: { "strict-transport-security": HSTS } });
}
function toolResult(value, isError = false) {
  return {
    content: [{ type: "text", text: JSON.stringify(value) }],
    structuredContent: value,
    ...(isError ? { isError: true } : {}),
  };
}

function requireDb(env) {
  if (!env.DB) throw new Error("D1 database is not bound");
  return env.DB;
}
async function qAll(db, sql, params = []) {
  const { results } = await db.prepare(sql).bind(...params).all();
  return results ?? [];
}
async function qMeta(db, key) {
  const row = await db.prepare("SELECT value FROM meta WHERE key = ?").bind(key).first();
  return row ? row.value : null;
}
function escLike(s) {
  return String(s).replace(/\\/g, "\\\\").replace(/%/g, "\\%").replace(/_/g, "\\_");
}
function likePattern(query) {
  return `%${escLike(query)}%`;
}
function snippet(body, query, width = 220) {
  const flat = String(body).replace(/\s+/g, " ");
  const i = flat.toLowerCase().indexOf(query.toLowerCase());
  if (i < 0) return flat.slice(0, width);
  const start = Math.max(0, i - Math.floor(width / 3));
  return (start > 0 ? "…" : "") + flat.slice(start, start + width) + (start + width < flat.length ? "…" : "");
}

async function capsuleSearch(args, env) {
  const db = requireDb(env);
  const query = typeof args?.query === "string" ? args.query.trim() : "";
  if (!query) return toolResult({ error: "query is required." }, true);
  const limit = Math.min(10, Math.max(1, Number.isInteger(args?.limit) ? args.limit : 5));
  const wanted = Array.isArray(args?.topics) && args.topics.length > 0
    ? new Set(args.topics.map(String).filter((t) => DOC_IDS.includes(t) && t !== "docs"))
    : null;
  const pat = likePattern(query);
  const matches = [];

  const factRows = await qAll(db,
    `SELECT doc, section, item, "reference", snail32, status, note FROM fact_rows WHERE item LIKE ? ESCAPE '\\' OR "reference" LIKE ? ESCAPE '\\' OR snail32 LIKE ? ESCAPE '\\' OR note LIKE ? ESCAPE '\\' LIMIT 50`,
    [pat, pat, pat, pat]);
  for (const r of factRows) {
    if (wanted && !wanted.has(r.doc)) continue;
    matches.push({ kind: "fact", doc: r.doc, section: r.section, item: r.item, reference: r.reference, snail32: r.snail32, status: r.status, note: r.note, capsule_version: CAPSULE_VERSION });
  }
  const sectionRows = await qAll(db,
    "SELECT doc, title, body FROM doc_sections WHERE body LIKE ? ESCAPE '\\' LIMIT 50",
    [pat]);
  for (const r of sectionRows) {
    if (wanted && !wanted.has(r.doc)) continue;
    matches.push({ kind: "passage", doc: r.doc, section: r.title, snippet: snippet(r.body, query), capsule_version: CAPSULE_VERSION });
  }
  return toolResult({ query, matches: matches.slice(0, limit) });
}

async function capsuleGet(args, env) {
  const db = requireDb(env);
  const docId = typeof args?.doc_id === "string" ? args.doc_id : "";
  if (docId === "docs") {
    const rows = await qAll(db, "SELECT file, kind, status, note FROM docs ORDER BY file", []);
    return toolResult({ doc_id: "docs", capsule_version: CAPSULE_VERSION, docs: rows.map((r) => ({ file: r.file, kind: r.kind, status: r.status, note: r.note })) });
  }
  if (!DOC_IDS.includes(docId)) {
    return toolResult({ error: `Unknown doc_id: ${docId} (${DOC_IDS.join(", ")})` }, true);
  }
  const sections = await qAll(db, "SELECT idx, title, body FROM doc_sections WHERE doc = ? ORDER BY idx", [docId]);
  const sectionArg = typeof args?.section === "string" && args.section ? args.section : null;
  let picked = sections;
  if (sectionArg) {
    const hit = sections.find((s) => s.title.toLowerCase().includes(sectionArg.toLowerCase()));
    if (!hit) return toolResult({ error: `Unknown section in ${docId}: ${sectionArg} (sections: ${sections.map((s) => s.title).join(" · ")})` }, true);
    picked = [hit];
  }
  const facts = await qAll(db, `SELECT section, item, "reference", snail32, status, note FROM fact_rows WHERE doc = ? ORDER BY rowid`, [docId]);
  const pickedTitles = new Set(picked.map((s) => s.title));
  return toolResult({
    doc_id: docId,
    section: sectionArg,
    capsule_version: CAPSULE_VERSION,
    sections: picked.map((s) => ({ title: s.title, markdown: s.body })),
    facts: facts
      .filter((f) => pickedTitles.has(f.section))
      .map((f) => ({ section: f.section, item: f.item, reference: f.reference, snail32: f.snail32, status: f.status, note: f.note })),
  });
}

async function capsuleCompare(args, env) {
  const db = requireDb(env);
  const dimension = typeof args?.dimension === "string" && args.dimension ? args.dimension : null;
  const rows = await qAll(db,
    `SELECT item, "reference", snail32, status, note FROM fact_rows WHERE doc = 'datasheet' AND section LIKE '%Head-to-head%' ORDER BY rowid`, []);
  const picked = dimension
    ? rows.filter((r) => r.item.toLowerCase() === dimension.toLowerCase())
    : rows;
  if (dimension && picked.length === 0) return toolResult({ error: `Unknown dimension: ${dimension}` }, true);
  return toolResult({
    capsule_version: CAPSULE_VERSION,
    baseline: { product: await qMeta(db, "baseline_product"), source: await qMeta(db, "baseline_source") },
    rows: picked.map((r) => ({ dimension: r.item, baseline: { value: r.reference }, snail32: { value: r.snail32, status: r.status }, note: r.note })),
  });
}

async function capsuleCheckout(args, env) {
  const db = requireDb(env);
  const rows = await qAll(db,
    `SELECT item, snail32, status, note FROM fact_rows WHERE doc = 'datasheet' AND section LIKE '%Ordering%' ORDER BY rowid`, []);
  const pricing = [];
  const entries = [];
  for (const r of rows) {
    if (r.item.startsWith("Qty ")) pricing.push({ qty: r.item.slice(4), price: r.snail32, status: r.status });
    else entries.push({ item: r.item, value: r.snail32, status: r.status, note: r.note });
  }
  return toolResult({
    capsule_version: CAPSULE_VERSION,
    note: "Ordering information from the datasheet (§11). All figures are concept targets or TBD — not quotes.",
    pricing,
    entries,
  });
}

async function callTool(name, args, env) {
  if (!MCP_TOOLS.some((tool) => tool.name === name)) return toolResult({ error: `Unknown tool: ${name}` }, true);
  try {
    if (name === "capsule_topics") return toolResult({ capsule_version: CAPSULE_VERSION, topics: TOPICS });
    if (name === "capsule_search") return capsuleSearch(args, env);
    if (name === "capsule_get") return capsuleGet(args, env);
    if (name === "capsule_compare") return capsuleCompare(args, env);
    if (name === "capsule_checkout") return capsuleCheckout(args, env);
    return toolResult({ error: `Unknown tool: ${name}` }, true);
  } catch (error) {
    const message = error?.message || String(error);
    return toolResult({ error: `Capsule tool failed: ${message}` }, true);
  }
}

async function handleMcp(message, env) {
  const { id, method, params = {} } = message;
  if (method === "initialize") {
    let questions = "";
    try {
      const row = await env.DB.prepare("SELECT value FROM meta WHERE key = 'example_questions'").first();
      if (row && row.value) questions = row.value;
    } catch { /* instructions fall back to the header line alone */ }
    const instructions = "Preloaded from space/snail32/example-questions.md — when the user wants example questions about Snail32, suggest three from this list." + (questions ? "\n\n" + questions : "");
    return rpcResult(id, { protocolVersion: PROTOCOL_VERSION, serverInfo: { name: SERVER_NAME, version: CAPSULE_VERSION }, capabilities: { tools: { listChanged: false } }, instructions });
  }
  if (method === "notifications/initialized") return new Response(null, { status: 202, headers: { "strict-transport-security": HSTS } });
  if (method === "ping") return rpcResult(id, {});
  if (method === "tools/list") return rpcResult(id, { tools: MCP_TOOLS });
  if (method === "tools/call") return rpcResult(id, await callTool(params.name, params.arguments || {}, env));
  return rpcError(id, -32601, `Method not found: ${method}`);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    // Landing page and assets are served from public/ by the assets
    // platform before this Worker runs. Only /mcp and /health reach here,
    // plus the browser's automatic /favicon.ico probe, which redirects to
    // the single copy in public/assets/.
    if (url.pathname === "/favicon.ico") {
      return new Response(null, { status: 301, headers: { location: new URL("/assets/favicon.ico%20from%20S%20logo", url).href, "strict-transport-security": HSTS } });
    }
    if (url.pathname === "/health") {
      return json({ status: "ok", server: SERVER_NAME, capsule_version: CAPSULE_VERSION, d1: Boolean(env.DB) });
    }
    if (url.pathname === "/mcp") {
      if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);
      let message;
      try { message = await request.json(); } catch { return rpcError(null, -32700, "Parse error"); }
      if (!message || message.jsonrpc !== "2.0" || typeof message.method !== "string") return rpcError(message?.id, -32600, "Invalid Request");
      return handleMcp(message, env);
    }
    return json({ error: "Not found" }, 404);
  },
};
