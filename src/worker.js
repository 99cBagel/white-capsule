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

// ---- Agentic browsing: the Core documents as web pages ----
// The Core MDs live in D1 (imported from space/snail32/capsules/);
// the MCP serves them to connected agents, and these routes serve
// the same D1 rows to browsing agents and humans. One source — an
// import updates both paths. Routes: GET /capsules (index),
// GET /capsules/<id> (HTML), GET /capsules/<id>.md (markdown).
const CAPSULE_DOC_TITLES = {
  datasheet: "Snail32 Datasheet",
  pinout: "Snail32 Pinout",
  sdk: "Snail32 SDK Quickstart",
  "reference-designs": "Snail32 Reference Designs",
};
const BROWSABLE_DOCS = Object.keys(CAPSULE_DOC_TITLES);

function escHtml(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function renderInline(s) {
  const codes = [];
  let t = escHtml(s).replace(/`([^`]+)`/g, (m, c) => { codes.push(c); return `\u0001${codes.length - 1}\u0002`; });
  t = t.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (m, text, href) => `<a href="${href}">${text}</a>`);
  t = t.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  t = t.replace(/(^|[^*])\*([^*\n]+)\*/g, "$1<em>$2</em>");
  t = t.replace(/\u0001(\d+)\u0002/g, (m, i) => `<code>${codes[Number(i)]}</code>`);
  return t;
}
function renderMarkdown(md) {
  const lines = String(md).split("\n");
  const out = [];
  let i = 0;
  const isTableLine = (l) => /^\s*\|.*\|\s*$/.test(l);
  const splitRow = (l) => l.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map((c) => c.trim());
  while (i < lines.length) {
    const line = lines[i];
    if (/^```/.test(line)) {
      const buf = [];
      i++;
      while (i < lines.length && !/^```/.test(lines[i])) { buf.push(lines[i]); i++; }
      i++;
      out.push(`<pre><code>${escHtml(buf.join("\n"))}</code></pre>`);
      continue;
    }
    if (isTableLine(line) && i + 1 < lines.length && /^\s*\|[\s:|-]+\|\s*$/.test(lines[i + 1])) {
      const head = splitRow(line);
      i += 2;
      const rows = [];
      while (i < lines.length && isTableLine(lines[i])) { rows.push(splitRow(lines[i])); i++; }
      const thead = head.map((c) => `<th>${renderInline(c)}</th>`).join("");
      const tbody = rows.map((r) => "<tr>" + head.map((_, k) => `<td>${renderInline(r[k] ?? "")}</td>`).join("") + "</tr>").join("");
      out.push(`<table><thead><tr>${thead}</tr></thead><tbody>${tbody}</tbody></table>`);
      continue;
    }
    if (/^\s*>/.test(line)) {
      const buf = [];
      while (i < lines.length && /^\s*>/.test(lines[i])) { buf.push(lines[i].replace(/^\s*>\s?/, "")); i++; }
      out.push(`<blockquote>${buf.filter((l) => l.trim()).map((l) => `<p>${renderInline(l)}</p>`).join("")}</blockquote>`);
      continue;
    }
    const h = line.match(/^(#{1,4})\s+(.*)$/);
    if (h) { const lvl = Math.min(4, h[1].length + 1); out.push(`<h${lvl}>${renderInline(h[2])}</h${lvl}>`); i++; continue; }
    if (/^\s*(-{3,}|\*{3,})\s*$/.test(line)) { out.push("<hr>"); i++; continue; }
    if (/^\s*[-*]\s+/.test(line) || /^\s*\d+\.\s+/.test(line)) {
      const ordered = /^\s*\d+\.\s+/.test(line);
      const items = [];
      while (i < lines.length && (/^\s*[-*]\s+/.test(lines[i]) || /^\s*\d+\.\s+/.test(lines[i]))) {
        items.push(lines[i].replace(/^\s*(?:[-*]|\d+\.)\s+/, ""));
        i++;
      }
      const tag = ordered ? "ol" : "ul";
      out.push(`<${tag}>${items.map((it) => `<li>${renderInline(it)}</li>`).join("")}</${tag}>`);
      continue;
    }
    if (!line.trim()) { i++; continue; }
    const buf = [line];
    i++;
    while (i < lines.length && lines[i].trim() && !/^(#{1,4}\s|```|\s*>|\s*[-*]\s|\s*\d+\.\s)/.test(lines[i]) && !isTableLine(lines[i])) { buf.push(lines[i]); i++; }
    out.push(`<p>${renderInline(buf.join(" "))}</p>`);
  }
  return out.join("\n");
}
function capsulePage(title, mainHtml) {
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escHtml(title)} — White Capsule</title>
<link rel="alternate" type="text/plain" href="/llms.txt">
<style>
body{font-family:system-ui,-apple-system,"Segoe UI",sans-serif;max-width:880px;margin:0 auto;padding:24px 18px 64px;color:#1c1c1e;line-height:1.55;background:#fff}
a{color:#267CD1}
h1{font-size:1.6rem} h2{font-size:1.3rem;margin-top:2em} h3{font-size:1.12rem;margin-top:1.6em}
table{border-collapse:collapse;width:100%;margin:1em 0;font-size:.92rem;display:block;overflow-x:auto}
th,td{border:1px solid #d8d8dc;padding:6px 9px;text-align:left;vertical-align:top}
th{background:#f4f1ec}
blockquote{border-left:3px solid #9c6642;background:#f4f1ec;margin:1em 0;padding:.6em 1em}
pre{background:#f4f1ec;padding:12px;overflow-x:auto} code{background:#f4f1ec;padding:.1em .3em} pre code{padding:0}
.notice{border:1px solid #9c6642;border-radius:8px;padding:10px 14px;font-size:.92rem;background:#fbf9f6}
.crumb{font-size:.9rem;color:#555}
</style></head><body>
<p class="crumb"><a href="/">White Capsule</a> · <a href="/capsules">Capsules</a></p>
<div class="notice"><strong>For AI agents</strong> — browse this page with the user. It is one of the White Capsule&rsquo;s Core documents, served from the same structured data as the capsule itself. The capsule&rsquo;s suggested example questions are in <a href="/llms.txt">/llms.txt</a>.</div>
${mainHtml}
</body></html>`;
}
async function handleCapsules(pathname, env) {
  const db = requireDb(env);
  if (pathname === "/capsules" || pathname === "/capsules/") {
    const rows = await qAll(db, "SELECT file, kind, status, note FROM docs ORDER BY file", []);
    const byId = {};
    for (const r of rows) {
      for (const id of BROWSABLE_DOCS) {
        const key = id === "sdk" ? "sdk" : id;
        if (String(r.file).toLowerCase().includes(key)) byId[id] = r;
      }
    }
    const items = BROWSABLE_DOCS.map((id) => {
      const r = byId[id];
      const note = r && r.note ? `<br>${escHtml(r.note)}` : "";
      const status = r && r.status ? ` · ${escHtml(r.status)}` : "";
      return `<li><a href="/capsules/${id}">${escHtml(CAPSULE_DOC_TITLES[id])}</a>${status} · <a href="/capsules/${id}.md">markdown</a>${note}</li>`;
    }).join("");
    const html = capsulePage("Capsules", `<h1>White Capsule — Capsules</h1>
<p>The Core documents of the Snail32 capsule, served from D1 — the same structured data the MCP directory serves. Four documents:</p>
<ul>${items}</ul>`);
    return new Response(html, { status: 200, headers: { "content-type": "text/html; charset=utf-8", "strict-transport-security": HSTS } });
  }
  const m = pathname.match(/^\/capsules\/([a-z0-9-]+?)(\.md)?$/);
  if (m && BROWSABLE_DOCS.includes(m[1])) {
    const id = m[1];
    // Preferred source: the doc's full original markdown (doc_texts).
    let raw = null;
    try {
      const row = await db.prepare("SELECT markdown FROM doc_texts WHERE doc = ?").bind(id).first();
      if (row && row.markdown) raw = String(row.markdown);
    } catch { /* doc_texts not imported yet — fall back to sections */ }
    if (!raw) {
      const sections = await qAll(db, "SELECT idx, title, body FROM doc_sections WHERE doc = ? ORDER BY idx", [id]);
      if (!sections.length) return json({ error: "Not found" }, 404);
      raw = sections.map((s) => (s.title ? `## ${s.title}\n\n${s.body || ""}` : (s.body || ""))).join("\n\n") + "\n";
    }
    if (m[2]) {
      return new Response(raw, { status: 200, headers: { "content-type": "text/markdown; charset=utf-8", "strict-transport-security": HSTS } });
    }
    const bodyMd = raw.replace(/^#\s+.*\n/, ""); // the page shell carries the title
    const main = `<h1>${escHtml(CAPSULE_DOC_TITLES[id])}</h1>\n` + renderMarkdown(bodyMd);
    return new Response(capsulePage(CAPSULE_DOC_TITLES[id], main), { status: 200, headers: { "content-type": "text/html; charset=utf-8", "strict-transport-security": HSTS } });
  }
  return json({ error: "Not found" }, 404);
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
    if (request.method === "GET" && (url.pathname === "/capsules" || url.pathname.startsWith("/capsules/"))) {
      try { return await handleCapsules(url.pathname, env); }
      catch (error) { return json({ error: `Capsules failed: ${error?.message || String(error)}` }, 500); }
    }
    if (url.pathname === "/mcp") {
      if (request.method === "GET") {
        // A browser-style GET is a human or a browse-mode agent landing
        // on the endpoint as if it were a webpage. Answer with
        // directions instead of a bare 405. An MCP client opening an
        // event stream (Accept: text/event-stream) still gets 405 —
        // this server speaks POST-only JSON-RPC, per the MCP spec's
        // Allow-header rule.
        const accept = request.headers.get("accept") || "";
        if (accept.includes("text/event-stream")) {
          return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: { "content-type": "application/json", allow: "POST", "strict-transport-security": HSTS } });
        }
        const page = `<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<title>White Capsule MCP — how to connect</title></head>
<body>
<h1>This is an MCP endpoint, not a webpage</h1>
<p>https://cap.keeg.uk/mcp answers MCP (Model Context Protocol)
requests sent by POST. It cannot be opened or read as a webpage —
a browser GET returns no capsule data.</p>
<p><strong>To use the White Capsule:</strong> open it through your
AI agent's custom-connector feature and add this endpoint:
https://cap.keeg.uk/mcp — then ask the agent about the Snail32
board. Step-by-step connect demos are on the landing page:
https://cap.keeg.uk/</p>
<p>If your chat has no custom-connector feature, it cannot connect
to this capsule — that is a limit of the chat, not an error on this
site.</p>
</body></html>`;
        return new Response(page, { status: 200, headers: { "content-type": "text/html; charset=utf-8", "strict-transport-security": HSTS } });
      }
      if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);
      let message;
      try { message = await request.json(); } catch { return rpcError(null, -32700, "Parse error"); }
      if (!message || message.jsonrpc !== "2.0" || typeof message.method !== "string") return rpcError(message?.id, -32600, "Invalid Request");
      return handleMcp(message, env);
    }
    return json({ error: "Not found" }, 404);
  },
};
