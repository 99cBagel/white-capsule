# Snail32 — White Capsule

> **Status: MOCKUP CONCEPT — not shipping.**
> Nothing in this capsule is a shippable product yet. Snail32 values are
> concept TARGETS — made up 2026-11-25 at the owner's request for the
> mockup. Not measurements. Any `target` must be re-proven before it is
> quoted as a spec.

## What this is

A White Capsule makes product information and engineering specifications
accessible to AI agents. Through MCP, it supports AI-assisted evaluation.
It delivers structured, reliable, and auditable product knowledge that
agents can use.

This capsule is for one product: **Snail32**, our ESP32-competing board,
written so a sourcing engineer — working with an AI agent the way the
「什麼是agent？」 video shows — can evaluate it as a component source and
verify every claim.

## How the engineer uses it (the video's workflow)

1. **Folder first.** Drop this whole folder into the agent's working folder.
   Everything the evaluation needs is inside it. No browsing, no hunting.
2. **Say it in words.** Paste the task in `evaluation-task.md`: what to do,
   where the materials are, what to ask about first.
3. **Watch it work, verify the result.** The agent follows
   `evaluation-playbook.md` step by step, shows its work, and stops at the
   listed triggers. Every verdict cites a file and a section.
4. **Save the method.** Findings go into `findings/`, the working notes
   go back into `handbook.md` — the employee handbook (員工手冊) — and
   the product state is updated in `state/` — so the second evaluation
   starts from the first. Product findings only: never record who ran the
   evaluation, what they asked, or when.

## Contents

```
white-capsule/
├── README.md                  this file — index + rules
├── capsule.json               manifest: identity, version, file inventory
├── spec.json                  structured Snail32 spec (concept targets)
├── comparison.json            head-to-head vs ESP32-S3 (baseline verified)
├── sourcing.json              commercial facts: price, MOQ, lead time, lifecycle
├── compliance.md              certifications: certified / planned / unknown
├── evaluation-playbook.md     the sourcing evaluation, step by step
├── handbook.md                the agent's employee handbook
├── evaluation-task.md         the paste-in task for the agent
├── mcp-tools.md               the MCP surface that serves this capsule
├── CHANGELOG.md               audit trail — every change, dated
├── state/
│   ├── index.md               product state: verified / unknown / next step
│   └── decisions.md           dated product decisions with reasons
├── .claude/
│   └── settings.json          optional Claude Code hook: SessionStart only
├── docs/
│   └── docs-manifest.json     the source documents this capsule rests on
├── findings/
│   └── README.md              where evaluation reports go
├── src/
│   └── worker.js              MCP server (Cloudflare Worker, D1-backed)
├── wrangler.jsonc             worker config: D1 binding, cap.keeg.uk/mcp route
├── scripts/
│   └── seed.mjs               builds the D1 seed SQL from the capsule files
├── package.json               scripts: seed, deploy, test
└── assets/
    ├── logo-1024.png          logo, 1024×1024, transparent background
    ├── icon-256.png           large icon, 256×256, transparent background
    ├── icon-64.png            small icon, 64×64, transparent background
    ├── favicon.ico            favicon (16/32/48/64)
    ├── white-capsule-logo.psd layered work copy (8 layers, transparent background)
    └── white-capsule-logo.svg vector trace (5 colors, transparent background)
```

## The three rules of this capsule

1. **Structured.** Numbers live in JSON with named fields, not buried in
   prose. An agent can read `spec.json` and compare field by field.
2. **Reliable.** Every value carries a status and a source. See the
   confidence legend in `capsule.json`:
   `verified` / `claimed` / `target` / `unknown`.
   A `target` is a design goal, not a measurement. An `unknown` is a gap,
   not a zero.
3. **Auditable.** Every change is dated in `CHANGELOG.md`. Every claim
   traces to a document in `docs/`. If the document is not in `docs/`,
   the claim does not exist.

## Clean-book rules (biblical)

This capsule is a clean book. A book doesn't know who read it, which
pages they opened, or how long they lingered — and neither does this
capsule.

- **No reader info.** No reader identity, no session records, no query
  logs. Nothing about who used the capsule is ever written down.
- **No tracking.** No analytics, no telemetry, no per-reader state, no
  cookies. No usage counters, not even in aggregate.
- **Product state only.** `state/` holds facts about Snail32 — decisions,
  verification status, open product questions. It never holds anything
  about a reader.
- **The server neither stores nor logs.** The MCP server is read-only,
  stores nothing, logs nothing, and gives the same answer to everyone.
  No personalization, no per-reader rate limiting.

The vendor gives up all usage metrics. That is the price — and the point:
a reader can trust this capsule precisely because it cannot report on
them.

## What the agent must never do alone

From the video — three things the engineer always does himself:

1. Passwords, verification codes, creating accounts — never.
2. Money decisions (place an order, accept a price, commit to an MOQ) — never.
3. Anything irreversible (send an RFQ, publish, submit) — show first,
   proceed only on explicit approval.

These are written into `handbook.md` and `evaluation-task.md`, not left
to memory.

## What is still missing

Real measurements, real documents, real certifications. The spec values,
price ladder, and lead time are concept `target`s — invented for the
mockup, not measured. All 9 expected source documents are missing and
all 10 compliance rows are `unknown`. Fill them from real measurements
and real documents — or leave them `unknown`. A capsule that says
"unknown" is honest. A capsule that guesses is useless.
