# Snail32 — Sample Program (Draft)

> **DRAFT — CONCEPT DOCUMENT: Snail32 Sample Program.** Snail32 is a concept-stage board; no silicon exists yet. The Snail32 facts below are **targets** or **TBD**, taken from the capsule's sourcing file. This document is modelled on a reference product: the **ESP32-S3-WROOM-1** (Espressif) — an established module that buyers can order from stock at distributors today. That reference is what a working sample and ordering program looks like; Snail32 does not have one yet.

## 1. The reference: how ordering the ESP32-S3-WROOM-1 works today

The reference module is an active, in-production part. Distributor listings checked on 2026-11-27 (DigiKey; Mouser via distributor aggregators) show ESP32-S3-WROOM-1 variants with part status **Active**, held in distributor stock, and orderable in single units (cut tape / Digi-Reel) as well as production reels — no sample request process is needed, because evaluation quantities are simply purchased. Per the capsule's rule, no distributor price is frozen into this document; the comparison file records the reference price as "distributor-dependent — check live at evaluation time."

Reference listing (one example): ESP32-S3-WROOM-1-N4R8 at DigiKey — https://www.digikey.com/en/products/detail/espressif-systems/ESP32-S3-WROOM-1-N4R8/16162637

That is the bar: a sample program exists to get hardware into an evaluator's hands with minimum friction, and for the reference product the distributor channel already does it. Snail32's program below is written against that model — and is currently empty.

## 2. Status of the Snail32 sample program

**There is no sample program, because there are no samples.** The capsule's sourcing file is explicit about what is real today:

- Nothing ships yet — Snail32 is a mockup concept.
- No samples, no price list, no distributor, no certification exist.
- What exists today is the capsule and the concept design.

| Sample fact | Value | Status |
| --- | --- | --- |
| Sample price | TBD — not yet specified | Unknown |
| Sample quantity available | TBD — not yet specified | Unknown |
| Sample ship date | TBD — not yet specified | Unknown |
| Sample status overall | Unknown | Unknown |
| How to request samples | TBD — not yet specified (no channel exists) | TBD |

Measured against the reference in §1, the gap is total: the reference can be bought in ones, from stock, today; Snail32 cannot be obtained at any quantity, at any price, through any channel.

## 3. Commercial targets (not quotes)

These figures are concept targets from the capsule's sourcing file. They are **not a price list and not a quotation**; the sourcing file's own rule is that a price is a snapshot with a date and a status, to be re-checked live at evaluation time.

| Quantity | Unit price (USD) | Status |
| --- | --- | --- |
| 1 | $3.50 | Target |
| 100 | $3.10 | Target |
| 1,000 | $2.50 | Target |
| 10,000 | $2.10 | Target |

| Commercial item | Value | Status |
| --- | --- | --- |
| MOQ | 1,000 units | Target |
| Lead time | 8 weeks | Target |
| Stock position | TBD — not yet specified | TBD |
| Distributors | TBD — not yet specified (direct only, or named distributors) | TBD |

For contrast, the reference's price at the same 1,000-unit point is deliberately not stated here: it moves with the market and must be checked live, as the capsule's comparison file directs.

## 4. Terms — all open

| Term | Status |
| --- | --- |
| Payment terms | TBD — not yet specified |
| Incoterms | TBD — not yet specified |
| Returns / RMA | TBD — not yet specified |
| Warranty | TBD — not yet specified |

No order — sample or production — can be placed against unspecified terms. The reference product, sold through distributors, inherits the distributor's standard terms; a direct-only Snail32 program would have to write its own, which is part of the work listed in §7.

## 5. Lifecycle

| Item | Value / status |
| --- | --- |
| Lifecycle stage | Concept |
| EOL policy | TBD — not yet specified |
| EOL notice period | TBD — not yet specified |
| Longevity commitment | TBD — not yet specified |
| PCN (product change notification) process | TBD — not yet specified |
| Pin-compatible alternates / second sources | TBD — not yet specified |

A sourcing engineer will ask: if Snail32 disappears, what drops in? Today there is no answer — that is recorded here as TBD rather than filled in. (The honest interim answer is the reference itself: a design that keeps the ESP32-S3-WROOM-1 footprint can fall back to the reference module, which is one reason the footprint target matters.)

## 6. Certification status

**No certifications are held.** Per the capsule's compliance table, every item is status **unknown** — including the three evaluators ask about first:

| Certification | Status |
| --- | --- |
| FCC Part 15 (USA) | Unknown — no certificate, no grant |
| CE RED (EU) | Unknown — no certificate |
| RoHS | Unknown — no certificate |

The capsule's comparison records Snail32 certifications as "none yet — planned." The reference module, by contrast, is RF certified and holds RoHS/REACH certification (see the draft datasheet, §10, for the full side-by-side and the complete compliance list). Until Snail32 holds its own modular certification, a buyer integrating it must do their own host-device certification (FCC / CE), or wait — and samples must never be represented as certified product (see §7, item 5).

## 7. What has to happen before samples can ship

1. Silicon and a board revision must exist (see the capsule state: concept stage).
2. Sample price, quantity, and a ship date must be set in the sourcing file, with a date and a status.
3. A request channel must exist (direct or a named distributor) — the reference model in §1 shows the distributor route working today.
4. Basic terms (payment, returns, warranty) must be written down.
5. Any sample offered for RF evaluation must be labelled with the product's certification state: no certifications are held, so samples cannot be represented as certified product.

Until steps 1–4 are done, the correct answer to "how do I get a Snail32 sample?" is: **you cannot yet — the product is a concept, and this document will be updated when that changes.** An evaluator who needs hardware today should be pointed at the reference product in §1.
