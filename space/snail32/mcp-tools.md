# Snail32 — MCP surface (White Capsule)

How this capsule is served to agents over MCP. Same pattern as the
company's KB servers (snail-eyes-kb, simonchen-kb): read-only, no auth,
stores nothing. The capsule files are the source of truth; the MCP tools
are a read window onto them.

## Transport

- Cloudflare Worker, Streamable HTTP, protocol 2025-06-18.
- Server name: `white-capsule`. No auth. Read-only. Stores nothing.
  Logs nothing.
- Data: Cloudflare D1 database `white-capsule`, seeded from the capsule
  files at deploy time (`scripts/seed.mjs`). The files are the source of
  truth; D1 is a derived read copy. The server queries D1 — it never
  reads the files at request time.
- Every response carries the capsule version (`capsule.json → version`)
  and the status of each value (see below).

## Tools

| Tool | Arguments | Returns |
| --- | --- | --- |
| `capsule_topics` | — | The capsule's sections: spec, comparison, sourcing, compliance, docs, playbook. |
| `capsule_search` | `query`, `topics?`, `limit?` (1–10, default 5) | Matching passages, each with file, section, value, status, source. |
| `capsule_get` | `doc_id` (`spec` / `comparison` / `sourcing` / `compliance` / `docs`), `section?` | The full document or section, with statuses and sources. |
| `capsule_compare` | `dimension?` | Head-to-head rows vs the ESP32 baseline, with verdicts and migration notes. |
| `capsule_checkout` | — | Commercial facts: price ladder (dated), MOQ, lead time, stock, lifecycle. |

Keep the tool count small. Three tools are enough to start
(`capsule_topics`, `capsule_search`, `capsule_get`); add `capsule_compare`
and `capsule_checkout` when the comparison and commercial data are real.

## Grounding rules (the server must enforce these)

- Answer only from capsule passages. Quote values exactly, with status
  and source. Never invent a spec, a price, or a certification.
- If a value is `unknown`, say so plainly. Never fill the gap.
- `target` is a design goal, never a spec. Say which it is every time.
- Prices are snapshots: always include the date and the status, and say
  "re-check live" when the price decides anything.
- No pricing commitment, no order, no RFQ through the capsule. The
  capsule informs; the engineer decides.
- If a question is not covered by the capsule, say so plainly and name
  the missing document.

## Clean-book rules (the server must enforce these)

- No request logging, no analytics, no telemetry. The server keeps no
  record of who asked what, or when.
- No per-reader state. No personalization, no per-reader rate limiting
  (a per-IP limit is per-reader tracking). If abuse protection is ever
  needed, it must be coarse and global, never per reader.
- The same answer to everyone. The capsule is a book, not a service desk.

## Response envelope

Every value the server returns carries:

```json
{ "value": "…", "status": "verified | claimed | target | unknown | na",
  "source": "docs/snail32-datasheet.pdf §4.2 (or null)",
  "capsule_version": "0.3.0" }
```

## Versioning

- The capsule version bumps on every content change (see `CHANGELOG.md`).
- The seed step runs at deploy time: a content change means re-seed +
  redeploy, so the served version always matches the files.
- Never serve a newer version number than the files it reads.
