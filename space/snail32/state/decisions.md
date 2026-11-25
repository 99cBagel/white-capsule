# Product decisions — Snail32

Dated decisions about the product, with reasons. When a new session
asks "how was this decided?", the answer is here — not in any reader's
history, because the capsule keeps none.

## 2026-11-25 — Comparison baseline is ESP32-S3

ESP32-S3 (ESP32-S3-WROOM-1), verified against the Espressif ESP32-S3
Series Datasheet v1.9. Reason: the owner's pick; the WROOM-32 is NRND
and was the wrong baseline.

## 2026-11-25 — Snail32 spec values are concept targets

Every Snail32 value in the capsule is a `target`, invented for the
mockup at the owner's request. Reason: no measurements exist yet. A
target must be re-proven before it is quoted as a spec.

## 2026-11-25 — Clean-book rule adopted (biblical)

The capsule does not log readers' info and does not track users'
interactions. No reader identity, no session records, no query logs,
no analytics, no telemetry, no per-reader state. Reason: trust — a
reader must be able to evaluate a product without being watched. The
capsule is a book, not a service desk. Its memory holds product state
only.
