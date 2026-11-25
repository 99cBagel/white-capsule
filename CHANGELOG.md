# CHANGELOG — Snail32 White Capsule

Every change to this capsule is dated here. A change without a changelog
entry did not happen.

## 0.4.0 — 2026-11-25

- MCP server built: Cloudflare Worker `white-capsule` at cap.keeg.uk/mcp
  (hand-rolled JSON-RPC, no dependencies, same shape as devices-control).
  Serves capsule_topics / capsule_search / capsule_get / capsule_compare
  / capsule_sourcing. Read-only, no auth, stores nothing, logs nothing.
- D1 database `white-capsule` is the read store, seeded from the capsule
  files by scripts/seed.mjs. The files stay the source of truth; D1 is
  a derived read copy, re-seeded on every capsule change.
- Route: cap.keeg.uk/mcp* → worker. The landing page at cap.keeg.uk/ is
  a separate manual deploy and is not served by this worker.
- Repo is now the source of truth: capsule files live at the repo root
  (root layout); the local white-capsule-snail32/ scaffold is superseded.

## 0.3.0 — 2026-11-25

- Clean-book rule adopted (biblical): the capsule does not log readers'
  info and does not track users' interactions. No reader identity, no
  session records, no query logs, no analytics, no telemetry, no
  per-reader state, no cookies. The MCP server stores nothing and logs
  nothing; same answer to everyone.
- New `state/` layer — product state only: `state/index.md` (verification
  status, open product questions, next step) and `state/decisions.md`
  (dated product decisions with reasons). The session-notes idea was
  dropped: one note per session is a session log, and the clean-book
  rule forbids it.
- Optional Claude Code hook (`.claude/settings.json`, SessionStart only):
  injects the state index into context when a session starts. No
  SessionEnd write-back — a hook that writes what happened in a session
  would log the interaction.
- Playbook: Step 0 reads `state/` first; Step 8 writes back product
  findings only; new clean-book release checklist before any version bump.
- README fixed: comparison baseline is ESP32-S3 (was WROOM-32); spec
  values are concept targets (was "all TBD").

## 0.2.0 — 2026-11-25

- Baseline switched to ESP32-S3 (user's pick). S3 values verified against
  Espressif ESP32-S3 Series Datasheet v1.9 (LX7 dual 240 MHz, 512 KB SRAM,
  384 KB ROM, 802.11 b/g/n, BT 5.0 LE, 45 GPIO, USB OTG, QFN56 7×7).
- Snail32 concept spec made up at the user's request: RISC-V dual 320 MHz,
  768 KB SRAM, Wi-Fi 6, BT 5.3 LE, 0.5 TOPS NPU, 48 GPIO, $2.50 @1k target,
  pin-compatible with S3-WROOM-1 footprint (target). All marked `target` —
  concept placeholders, not measurements.
- Price ladder / MOQ / lead time set as targets ($2.50 @1k, MOQ 1k, 8 wks).

## 0.1.0 — 2026-11-25

- Scaffold created: README, manifest, spec/comparison/sourcing templates,
  compliance table, evaluation playbook, agent handbook, evaluation task,
  MCP tool spec, docs manifest, findings index.
- All Snail32 values `TBD` / `unknown`. Nothing invented.
- ESP32 baseline verified against Espressif ESP32-WROOM-32 Datasheet v3.8
  (dual-core LX6 240 MHz, 520 KB SRAM, 4 MB flash, 802.11 b/g/n, BT 4.2 +
  BLE, 3.0–3.6 V, –40 to +85 °C).
- Open decision: WROOM-32 is NRND — name the exact ESP32 variant for the
  comparison baseline.
