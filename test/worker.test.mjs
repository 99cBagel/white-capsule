// Local tests for the White Capsule MCP worker.
// Builds an in-memory SQLite DB from scripts/seed.mjs and drives the
// worker's fetch handler through a fake D1 binding (prepare/bind/all/first).
import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { DatabaseSync } from "node:sqlite";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import worker from "../src/worker.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function fakeD1(db) {
  return {
    prepare(sql) {
      return {
        bind(...params) {
          return {
            all: async () => ({ results: db.prepare(sql).all(...params) }),
            first: async () => db.prepare(sql).get(...params) ?? null,
            run: async () => db.prepare(sql).run(...params),
          };
        },
      };
    },
  };
}

let env;
test.before(() => {
  const sql = execFileSync("node", ["scripts/seed.mjs"], { cwd: root, encoding: "utf8" });
  const db = new DatabaseSync(":memory:");
  db.exec(sql);
  env = { DB: fakeD1(db) };
});

async function post(body) {
  const res = await worker.fetch(new Request("http://localhost/mcp", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  }), env);
  return res.json();
}
async function callTool(name, args = {}) {
  const res = await post({ jsonrpc: "2.0", id: 1, method: "tools/call", params: { name, arguments: args } });
  assert.equal(res.error, undefined, JSON.stringify(res.error));
  return res.result.structuredContent;
}

test("health reports ok with D1 bound", async () => {
  const res = await worker.fetch(new Request("http://localhost/health"), env);
  const body = await res.json();
  assert.equal(body.status, "ok");
  assert.equal(body.server, "white-capsule");
  assert.equal(body.capsule_version, "0.4.0");
  assert.equal(body.d1, true);
});

test("initialize + tools/list", async () => {
  const init = await post({ jsonrpc: "2.0", id: 1, method: "initialize", params: {} });
  assert.equal(init.result.protocolVersion, "2025-06-18");
  assert.equal(init.result.serverInfo.name, "white-capsule");
  assert.equal(init.result.serverInfo.version, "0.4.0");
  const list = await post({ jsonrpc: "2.0", id: 2, method: "tools/list", params: {} });
  assert.deepEqual(list.result.tools.map((t) => t.name), [
    "capsule_topics", "capsule_search", "capsule_get", "capsule_compare", "capsule_sourcing",
  ]);
});

test("capsule_topics lists 6 sections", async () => {
  const r = await callTool("capsule_topics");
  assert.equal(r.topics.length, 6);
  assert.deepEqual(r.topics.map((t) => t.id), ["spec", "comparison", "sourcing", "compliance", "docs", "playbook"]);
});

test("capsule_search finds Wi-Fi in comparison and spec", async () => {
  const r = await callTool("capsule_search", { query: "Wi-Fi", limit: 10 });
  const files = r.matches.map((m) => m.file);
  assert.ok(files.includes("comparison.json"));
  assert.ok(files.includes("spec.json"));
  const wifi = r.matches.find((m) => m.dimension === "Wi-Fi");
  assert.equal(wifi.verdict, "better");
  assert.equal(wifi.snail32.status, "target");
});

test("capsule_search respects topics filter and limit", async () => {
  const r = await callTool("capsule_search", { query: "TBD", topics: ["spec"], limit: 3 });
  assert.equal(r.matches.length, 3);
  assert.ok(r.matches.every((m) => m.file === "spec.json"));
});

test("capsule_get spec returns 65 fields; radio section returns 10", async () => {
  const all = await callTool("capsule_get", { doc_id: "spec" });
  assert.equal(all.fields.length, 65);
  const radio = await callTool("capsule_get", { doc_id: "spec", section: "radio" });
  assert.equal(radio.fields.length, 10);
  const wifi = radio.fields.find((f) => f.field === "radio.wifi_standards");
  assert.equal(wifi.value, "802.11ax (Wi-Fi 6)");
  assert.equal(wifi.status, "target");
});

test("capsule_compare returns 14 rows; ADC is worse", async () => {
  const all = await callTool("capsule_compare");
  assert.equal(all.rows.length, 14);
  assert.equal(all.baseline.product, "ESP32-S3-WROOM-1 (ESP32-S3)");
  const adc = await callTool("capsule_compare", { dimension: "ADC" });
  assert.equal(adc.rows.length, 1);
  assert.equal(adc.rows[0].verdict, "worse");
});

test("capsule_sourcing returns the price ladder, MOQ, lead time", async () => {
  const r = await callTool("capsule_sourcing");
  assert.deepEqual(r.pricing.map((p) => p.qty), ["1", "100", "1000", "10000"]);
  assert.equal(r.pricing.find((p) => p.qty === "1000").price, "2.50");
  assert.equal(r.moq.value, "1000");
  assert.equal(r.lead_time_weeks.value, "8");
});

test("capsule_get docs and compliance match the files", async () => {
  const docs = await callTool("capsule_get", { doc_id: "docs" });
  assert.equal(docs.docs.length, 9);
  assert.ok(docs.docs.every((d) => d.status === "missing"));
  const comp = await callTool("capsule_get", { doc_id: "compliance" });
  assert.equal(comp.rows.length, 10);
  assert.ok(comp.rows.every((r) => r.status === "unknown"));
});

test("unknown tool and doc_id return errors", async () => {
  const badTool = await post({ jsonrpc: "2.0", id: 1, method: "tools/call", params: { name: "nope", arguments: {} } });
  assert.equal(badTool.result.isError, true);
  const badDoc = await post({ jsonrpc: "2.0", id: 1, method: "tools/call", params: { name: "capsule_get", arguments: { doc_id: "nope" } } });
  assert.equal(badDoc.result.isError, true);
});

test("GET /mcp is 405; unknown path is 404", async () => {
  const get = await worker.fetch(new Request("http://localhost/mcp"), env);
  assert.equal(get.status, 405);
  const nf = await worker.fetch(new Request("http://localhost/nope"), env);
  assert.equal(nf.status, 404);
});
