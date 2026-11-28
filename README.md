# White Capsule — Snail32

> **Status: MOCKUP CONCEPT — not shipping.**
> Snail32 values are concept **targets**, set at the owner's request for
> the mockup. Not measurements. A target must be re-proven before it is
> quoted as a spec.

## What this is

A White Capsule turns a product's white papers into structured,
auditable knowledge that AI agents read through MCP. This capsule holds
one product: **Snail32**, a concept microcontroller board positioned
against the ESP32-S3.

- Service: **White Capsule Service** — https://cap.keeg.uk/
- MCP endpoint: https://cap.keeg.uk/mcp (read-only, no auth, no logging)

## The capsule = 4 Core MDs + 3 MDs

The Core MDs are the capsule's **only source of truth**. Everything the
MCP serves is parsed from them.

**Core — `space/snail32/capsules/`**

| Document | Holds |
| --- | --- |
| `snail32-datasheet.md` | Spec tables vs the ESP32-S3 reference, the head-to-head comparison, certifications, ordering information |
| `snail32-pinout.md` | The verified ESP32-S3-WROOM-1 pin map with the Snail32 position per pin; the drop-in question |
| `snail32-sdk-quickstart.md` | The real ESP-IDF flow on ESP32-S3 and the Snail32 position at each step, including porting |
| `snail32-reference-designs.md` | Five concept designs adapted from real ESP32 applications, with their Snail32 TBD blockers |

`docs-manifest.json` in the same folder lists these four and their
status. `drafts/` holds unlisted drafts; the MCP does not serve them.

**Supporting — `space/snail32/`**

| Document | Role |
| --- | --- |
| `example-questions.md` | Six starter questions, preloaded to agents at connect (served dynamically from D1 — see below) |
| `mcp-tools.md` | The contract for the five MCP tools |
| `evaluation-playbook.md` | How the MCP service is evaluated: the scan + functional test, graded A–F |

## How it runs

```text
Core MDs ──► src/import-to-d1.mjs ──► D1 (derived read copy) ──► src/worker.js ──► MCP
```

- The Worker cannot read files, so `src/import-to-d1.mjs` parses the
  Core MDs (+ the manifest, + `example-questions.md`) into SQL; applying
  it rebuilds D1's tables (`meta`, `docs`, `doc_sections`, `fact_rows`).
- Tools: `capsule_topics` · `capsule_search` · `capsule_get` ·
  `capsule_compare` · `capsule_checkout`.
- The example questions live in D1 `meta` and the Worker reads them at
  initialize time. The .md is the only copy — there is no second copy
  in code to drift.
- **Evaluation documents are not in D1.** D1 holds only what the
  capsule says about the board; the playbook is an evaluator's
  instrument and is read as a file.
- Edit a Core MD → re-run the importer → D1 follows. Nothing flows back.

## llms.txt pairing

Every page pairs with an **llms.txt companion** for **agentic
browsing**. The companion has nothing to do with MCP: connecting to
the MCP is a separate path (STEP 1 above), not covered in any
llms.txt. The companion tells a visiting agent:

1. *This page is about …*
2. Browse this page with the user — also find out the user's
   interests.
3. Say what the page is, and offer **2 example questions selected
   from the companion's list**, matched to the user's interests:
   *"Which do you want me to explore?"* — the questions **nudge the
   browsing path**.

At cap.keeg.uk this lives in two places: `public/llms.txt` (served at
https://cap.keeg.uk/llms.txt) and the **FOR AI AGENTS** notice at the
top of the landing page. The same pairing is the standard for the
owner's other sites; companions are generated from a per-site
registry, never hand-copied, and a gated site's companion states the
gate only — nothing private is ever published in an llms.txt.

## Rules

- **Status language.** Every value is one of: *verified* (the ESP32-S3
  reference, from the Espressif datasheet) · *target* (a Snail32 design
  goal) · *TBD / unknown* (a gap — not a zero, not a guess).
- **Clean book.** The server is read-only, stores nothing, logs
  nothing, sets no cookies, and gives the same answer to everyone. No
  reader information of any kind is recorded.
- **Deploys.** Push to GitHub → GitHub Actions deploys the Worker and
  the static site. D1 changes only when the importer is run.

## Layout

```text
public/            landing page, assets, llms.txt (served as static files)
src/               worker.js (the MCP server) · import-to-d1.mjs
space/snail32/     the capsule: capsules/ (Core) + the 3 supporting MDs
```
