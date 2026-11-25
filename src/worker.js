// White Capsule MCP server — Snail32.
// Read-only, no auth, stores nothing, logs nothing (clean-book rule).
// Data lives in D1 (database `white-capsule`), seeded from the capsule
// files by scripts/seed.mjs. The files are the source of truth; D1 is
// a derived read copy.
//
// Transport: Streamable HTTP, protocol 2025-06-18. Hand-rolled JSON-RPC,
// same shape as devices-control-worker (no SDK, no dependencies).

const CAPSULE_VERSION = "0.4.0";
const SERVER_NAME = "white-capsule";
const PROTOCOL_VERSION = "2025-06-18";

const TOPICS = [
  { id: "spec", description: "Structured Snail32 spec — every field with value, status, source." },
  { id: "comparison", description: "Head-to-head vs the ESP32-S3 baseline, with verdicts and migration notes." },
  { id: "sourcing", description: "Commercial facts — price ladder (dated), MOQ, lead time, stock, lifecycle." },
  { id: "compliance", description: "Certifications: certified / planned / unknown, plus buyer obligations." },
  { id: "docs", description: "Source documents the capsule rests on — all 9 expected, all missing." },
  { id: "playbook", description: "The sourcing evaluation, step by step (evaluation-playbook.md)." },
];

const MCP_TOOLS = [
  {
    name: "capsule_topics",
    description: "List the capsule's sections.",
    inputSchema: { type: "object", additionalProperties: false },
  },
  {
    name: "capsule_search",
    description: "Search the capsule by text. Returns matching passages, each with file, section, value, status, source.",
    inputSchema: {
      type: "object",
      additionalProperties: false,
      properties: {
        query: { type: "string", description: "Text to search for." },
        topics: { type: "array", items: { type: "string" }, description: "Optional section filter: spec, comparison, sourcing, compliance." },
        limit: { type: "integer", description: "Max results, 1-10, default 5." },
      },
      required: ["query"],
    },
  },
  {
    name: "capsule_get",
    description: "Return a whole capsule document (or one spec section), with statuses and sources.",
    inputSchema: {
      type: "object",
      additionalProperties: false,
      properties: {
        doc_id: { type: "string", description: "spec, comparison, sourcing, compliance, or docs." },
        section: { type: "string", description: "For spec: one top-level section (io, mcu, memory, operating, package_board, power, radio, security, software)." },
      },
      required: ["doc_id"],
    },
  },
  {
    name: "capsule_compare",
    description: "Head-to-head rows vs the ESP32-S3 baseline, with verdicts and migration notes.",
    inputSchema: {
      type: "object",
      additionalProperties: false,
      properties: {
        dimension: { type: "string", description: "Optional single dimension, e.g. 'ADC'." },
      },
    },
  },
  {
    name: "capsule_sourcing",
    description: "Commercial facts: price ladder (dated), MOQ, lead time, stock, lifecycle.",
    inputSchema: { type: "object", additionalProperties: false },
  },
];

function json(value, status = 200) {
  return Response.json(value, { status, headers: { "cache-control": "no-store" } });
}
function rpcResult(id, result) {
  return Response.json({ jsonrpc: "2.0", id, result });
}
function rpcError(id, code, message) {
  return Response.json({ jsonrpc: "2.0", id: id ?? null, error: { code, message } });
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

async function capsuleSearch(args, env) {
  const db = requireDb(env);
  const query = typeof args?.query === "string" ? args.query.trim() : "";
  if (!query) return toolResult({ error: "query is required." }, true);
  const limit = Math.min(10, Math.max(1, Number.isInteger(args?.limit) ? args.limit : 5));
  const wanted = Array.isArray(args?.topics) && args.topics.length > 0
    ? new Set(args.topics.map(String))
    : null;
  const pat = likePattern(query);
  const matches = [];

  if (!wanted || wanted.has("spec")) {
    for (const r of await qAll(db,
      "SELECT field, section, value, status, source FROM spec_fields WHERE field LIKE ? ESCAPE '\\' OR value LIKE ? ESCAPE '\\' OR source LIKE ? ESCAPE '\\' LIMIT ?",
      [pat, pat, pat, limit])) {
      matches.push({ file: "spec.json", section: r.section, field: r.field, value: r.value, status: r.status, source: r.source, capsule_version: CAPSULE_VERSION });
    }
  }
  if (!wanted || wanted.has("comparison")) {
    for (const r of await qAll(db,
      "SELECT dimension, snail32_value, snail32_status, snail32_source, baseline_value, baseline_status, baseline_source, verdict, migration_note FROM comparison_rows WHERE dimension LIKE ? ESCAPE '\\' OR snail32_value LIKE ? ESCAPE '\\' OR baseline_value LIKE ? ESCAPE '\\' OR migration_note LIKE ? ESCAPE '\\' LIMIT ?",
      [pat, pat, pat, pat, limit])) {
      matches.push({ file: "comparison.json", section: "comparison", dimension: r.dimension, snail32: { value: r.snail32_value, status: r.snail32_status, source: r.snail32_source }, baseline: { value: r.baseline_value, status: r.baseline_status, source: r.baseline_source }, verdict: r.verdict, migration_note: r.migration_note, capsule_version: CAPSULE_VERSION });
    }
  }
  if (!wanted || wanted.has("sourcing")) {
    for (const r of await qAll(db,
      "SELECT key, value, status, source FROM sourcing WHERE key LIKE ? ESCAPE '\\' OR value LIKE ? ESCAPE '\\' LIMIT ?",
      [pat, pat, limit])) {
      matches.push({ file: "sourcing.json", section: "sourcing", field: r.key, value: r.value, status: r.status, source: r.source, capsule_version: CAPSULE_VERSION });
    }
  }
  if (!wanted || wanted.has("compliance")) {
    for (const r of await qAll(db,
      "SELECT item, status, notes FROM compliance_rows WHERE item LIKE ? ESCAPE '\\' OR notes LIKE ? ESCAPE '\\' LIMIT ?",
      [pat, pat, limit])) {
      matches.push({ file: "compliance.md", section: "compliance", field: r.item, value: r.status, status: r.status, source: null, notes: r.notes, capsule_version: CAPSULE_VERSION });
    }
  }
  return toolResult({ query, matches: matches.slice(0, limit) });
}

async function capsuleGet(args, env) {
  const db = requireDb(env);
  const docId = typeof args?.doc_id === "string" ? args.doc_id : "";
  if (docId === "spec") {
    const section = typeof args?.section === "string" && args.section ? args.section : null;
    const rows = section
      ? await qAll(db, "SELECT field, section, value, status, source FROM spec_fields WHERE section = ? ORDER BY field", [section])
      : await qAll(db, "SELECT field, section, value, status, source FROM spec_fields ORDER BY field", []);
    if (section && rows.length === 0) return toolResult({ error: `Unknown spec section: ${section}` }, true);
    return toolResult({ doc_id: "spec", section, capsule_version: CAPSULE_VERSION, fields: rows.map((r) => ({ field: r.field, value: r.value, status: r.status, source: r.source })) });
  }
  if (docId === "comparison") {
    const rows = await qAll(db, "SELECT dimension, snail32_value, snail32_status, snail32_source, baseline_value, baseline_status, baseline_source, verdict, migration_note FROM comparison_rows ORDER BY dimension", []);
    return toolResult({ doc_id: "comparison", capsule_version: CAPSULE_VERSION, baseline: { product: await qMeta(db, "baseline_product"), source: await qMeta(db, "baseline_source") }, rows: rows.map((r) => ({ dimension: r.dimension, snail32: { value: r.snail32_value, status: r.snail32_status, source: r.snail32_source }, baseline: { value: r.baseline_value, status: r.baseline_status, source: r.baseline_source }, verdict: r.verdict, migration_note: r.migration_note })) });
  }
  if (docId === "sourcing") {
    const rows = await qAll(db, "SELECT key, value, status, source FROM sourcing ORDER BY key", []);
    return toolResult({ doc_id: "sourcing", capsule_version: CAPSULE_VERSION, entries: rows.map((r) => ({ key: r.key, value: r.value, status: r.status, source: r.source })) });
  }
  if (docId === "compliance") {
    const rows = await qAll(db, "SELECT item, status, cert_no, evidence, date, notes FROM compliance_rows ORDER BY item", []);
    return toolResult({ doc_id: "compliance", capsule_version: CAPSULE_VERSION, rows: rows.map((r) => ({ item: r.item, status: r.status, cert_no: r.cert_no, evidence: r.evidence, date: r.date, notes: r.notes })) });
  }
  if (docId === "docs") {
    const rows = await qAll(db, "SELECT file, kind, status, note FROM docs ORDER BY file", []);
    return toolResult({ doc_id: "docs", capsule_version: CAPSULE_VERSION, docs: rows.map((r) => ({ file: r.file, kind: r.kind, status: r.status, note: r.note })) });
  }
  return toolResult({ error: `Unknown doc_id: ${docId} (spec, comparison, sourcing, compliance, docs)` }, true);
}

async function capsuleCompare(args, env) {
  const db = requireDb(env);
  const dimension = typeof args?.dimension === "string" && args.dimension ? args.dimension : null;
  const rows = dimension
    ? await qAll(db, "SELECT dimension, snail32_value, snail32_status, snail32_source, baseline_value, baseline_status, baseline_source, verdict, migration_note FROM comparison_rows WHERE dimension = ?", [dimension])
    : await qAll(db, "SELECT dimension, snail32_value, snail32_status, snail32_source, baseline_value, baseline_status, baseline_source, verdict, migration_note FROM comparison_rows ORDER BY dimension", []);
  if (dimension && rows.length === 0) return toolResult({ error: `Unknown dimension: ${dimension}` }, true);
  return toolResult({
    capsule_version: CAPSULE_VERSION,
    baseline: { product: await qMeta(db, "baseline_product"), source: await qMeta(db, "baseline_source") },
    rows: rows.map((r) => ({ dimension: r.dimension, snail32: { value: r.snail32_value, status: r.snail32_status, source: r.snail32_source }, baseline: { value: r.baseline_value, status: r.baseline_status, source: r.baseline_source }, verdict: r.verdict, migration_note: r.migration_note })),
  });
}

async function capsuleSourcing(args, env) {
  const db = requireDb(env);
  const rows = await qAll(db, "SELECT key, value, status, source FROM sourcing ORDER BY key", []);
  const byKey = new Map(rows.map((r) => [r.key, r]));
  const pricing = [];
  for (let i = 0; ; i++) {
    const qty = byKey.get(`pricing.${i}.qty`);
    if (!qty) break;
    pricing.push({
      qty: qty.value,
      price: byKey.get(`pricing.${i}.price`)?.value ?? null,
      currency: byKey.get(`pricing.${i}.currency`)?.value ?? null,
      status: byKey.get(`pricing.${i}.status`)?.value ?? null,
    });
  }
  pricing.sort((a, b) => Number(a.qty) - Number(b.qty));
  const entry = (key) => {
    const r = byKey.get(key);
    return r ? { value: r.value, status: r.status, source: r.source } : null;
  };
  return toolResult({
    capsule_version: CAPSULE_VERSION,
    pricing,
    moq: entry("moq"),
    lead_time_weeks: entry("availability.lead_time_weeks"),
    entries: rows.filter((r) => !r.key.startsWith("pricing.")).map((r) => ({ key: r.key, value: r.value, status: r.status, source: r.source })),
  });
}

async function callTool(name, args, env) {
  if (!MCP_TOOLS.some((tool) => tool.name === name)) return toolResult({ error: `Unknown tool: ${name}` }, true);
  try {
    if (name === "capsule_topics") return toolResult({ capsule_version: CAPSULE_VERSION, topics: TOPICS });
    if (name === "capsule_search") return capsuleSearch(args, env);
    if (name === "capsule_get") return capsuleGet(args, env);
    if (name === "capsule_compare") return capsuleCompare(args, env);
    if (name === "capsule_sourcing") return capsuleSourcing(args, env);
    return toolResult({ error: `Unknown tool: ${name}` }, true);
  } catch (error) {
    const message = error?.message || String(error);
    return toolResult({ error: `Capsule tool failed: ${message}` }, true);
  }
}

async function handleMcp(message, env) {
  const { id, method, params = {} } = message;
  if (method === "initialize") return rpcResult(id, { protocolVersion: PROTOCOL_VERSION, serverInfo: { name: SERVER_NAME, version: CAPSULE_VERSION }, capabilities: { tools: { listChanged: false } } });
  if (method === "notifications/initialized") return new Response(null, { status: 202 });
  if (method === "ping") return rpcResult(id, {});
  if (method === "tools/list") return rpcResult(id, { tools: MCP_TOOLS });
  if (method === "tools/call") return rpcResult(id, await callTool(params.name, params.arguments || {}, env));
  return rpcError(id, -32601, `Method not found: ${method}`);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
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
