# Product state — Snail32

The capsule's memory of the product. Read this first, every evaluation
(playbook Step 0). Update it at write-back (Step 8).

This file holds facts about Snail32 only — what is verified, what is
still unknown, what is decided, what is next for the product. It never
holds anything about a reader: no reader identity, no session records,
no query logs. Clean-book rule.

## Status

- Capsule version: 0.3.0. Product status: mockup concept — not shipping.
- Trial evaluation verdict (2026-11-25): **not yet**. Report:
  `findings/2026-11-25-evaluation.md`.

## Verification

- Spec: 36 fields `target`, 29 `unknown`, 0 `verified`.
- Source documents: all 9 expected docs missing (`docs/docs-manifest.json`).
- Compliance: all 10 rows `unknown`. No certifications.
- Baseline: ESP32-S3 verified against Espressif S3 Datasheet v1.9.

## Open product questions

- Which ESP32-S3 variant (which WROOM-1) is the pricing baseline? The
  capsule names no variant, so the @1k price comparison is
  variant-dependent.
- Evaluation-task blanks unfilled: the product, annual quantity, target
  price, certifications needed, timeline.
- Pin-compatibility with the S3-WROOM-1 footprint is a `target`,
  unproven.
- ADC: 16 channels, 12-bit — `worse` than S3, no migration cost written
  yet.

## Next step for the product

1. Fill the evaluation-task blanks (product, quantity, target price,
   certs, timeline).
2. Name the S3 variant before any pricing comparison.
3. Get a real Snail32 datasheet into `docs/` — until then every spec
   value stays `target` or `unknown`.
