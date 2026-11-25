# Evaluation — Snail32 as an ESP32-S3 replacement (trial run)

**Date:** 2026-11-25
**Capsule version:** 0.2.0
**Run by:** sourcing-engineer agent, following `evaluation-playbook.md` in order.
**Purpose of this run:** trial — test whether the capsule, as it stands, lets an
agent evaluate Snail32 from this folder alone. This is NOT a sourcing
recommendation for a real product: the blanks in `evaluation-task.md` (my
product, annual quantity, target price, certifications needed, timeline)
are unfilled, so the verdict is about capsule readiness.

## Verdict: NOT YET

Snail32 is a mockup concept. Nothing ships, nothing is measured, no
certification exists, no source document exists in `docs/`. On paper the
concept targets beat the ESP32-S3 on compute, radio, AI and price — but
every one of those wins is a `target`, not a measurement, and the migration
bill (no ESP-IDF on RISC-V, zero certifications) is real and unpriced.

## 1 — Identity

Snail32 is the company's ESP32-competing board, a mockup concept
(`README.md`, `capsule.json`). It claims to replace the ESP32-S3
(`comparison.json` baseline: ESP32-S3-WROOM-1, verified against Espressif
ESP32-S3 Series Datasheet v1.9). Drop-in claim: QFN56 7×7 mm,
pin-compatible with the S3-WROOM-1 footprint — status `target`
(`comparison.json` → Package / footprint). No pinout document exists to
prove it (`docs/docs-manifest.json` → snail32-pinout.png: missing), so the
drop-in story is unproven. Playbook Step 1 stop-and-ask fires here; this
run continues as a trial only, and the verdict reflects it.

## 2 — Spec audit

`spec.json` counted 2026-11-25: **36 fields `target`, 29 fields `unknown`**,
0 `verified`, 0 `claimed`. Zero values without a status — Step 2 pass on
that count. Every `target` carries the source "concept placeholder —
invented 2026-11-25 at user's request". Nothing was invented by this run.

Unknowns that the decision depends on (full list in §6): DAC, Ethernet,
SDIO, touch sensor, PWM channel count, usable GPIO count, strapping pins,
active current, antenna, TX power / RX sensitivity, EOL policy, longevity
commitment, samples, stock, distributors, payment terms, warranty, returns.

## 3 — Head-to-head vs ESP32-S3

From `comparison.json` (14 rows): **better 8, same 3, worse 3**.

| Dimension | ESP32-S3 (verified) | Snail32 (target) | Verdict |
| --- | --- | --- | --- |
| CPU core | Xtensa LX7 dual, 32-bit | RISC-V dual, 32-bit | better |
| Clock (max) | 240 MHz | 320 MHz | better |
| SRAM | 512 KB + 16 KB RTC | 768 KB + 16 KB RTC | better |
| Flash / PSRAM | 8 MB flash opt.; PSRAM to 16 MB | 8 MB flash + 8 MB PSRAM | same |
| Wi-Fi | 802.11 b/g/n, 2.4 GHz | Wi-Fi 6 (ax), 2.4 GHz | better |
| Bluetooth | 5.0 LE | 5.3 LE | better |
| GPIO | 45 programmable | 48 programmable | better |
| ADC | 12-bit, up to 20 ch | 12-bit, 16 ch | worse |
| AI acceleration | Vector instructions (SIMD) | 0.5 TOPS NPU | better |
| USB | Full-speed OTG + USB Serial/JTAG | Same | same |
| Package / footprint | QFN56 7×7 mm | QFN56 7×7 mm, pin-compatible (target) | same |
| SDK / ecosystem | ESP-IDF, Arduino, FreeRTOS | FreeRTOS + Arduino; ESP-IDF API-compatible layer (target) | worse |
| Unit price @ 1k | check live (see §5) | $2.50 (target) | better |
| Certifications | RF certified; REACH/RoHS | None yet — planned | worse |

Migration costs attached: RISC-V → no ESP-IDF, code porting is the
biggest cost; Wi-Fi 6 needs new RF validation and host testing; NPU needs
its own toolchain and model support; pin-compatibility must be proven on
the real pinout; no certifications → buyer does host-device certification
or waits. **Gap:** the ADC row is `worse` with no migration cost attached
("—") — Step 3 pass fails on that row. Cost: a design using >16 ADC
channels, or channels the S3 has and Snail32 drops, needs a redesign or an
external ADC; the capsule does not say which.

## 4 — Compliance gap

`compliance.md`: all 10 rows `unknown` — FCC Part 15, CE RED, ISED,
TELEC/MIC, RoHS, REACH, WEEE, conflict minerals, UL/safety, ISO 9001
(maker). No certificate number anywhere. Buyer obligations until Snail32
holds its own modular certification: host-device FCC/CE certification (or
wait), plus RoHS/REACH evidence for the EU. Time and money for that are
not in the capsule — they cannot be, until the certification plan exists.

## 5 — Commercial check (prices dated 2026-11-25)

Snail32 (`sourcing.json`, all `target`): $3.50 @1, $3.10 @100, **$2.50
@1k**, $2.10 @10k; MOQ 1,000 (target); lead time 8 weeks (target).
Samples, stock, distributors, payment terms, warranty, returns: TBD /
unknown. Lifecycle stage: concept; EOL policy and longevity commitment
unknown.

ESP32-S3 live snapshot, checked 2026-11-25 for this run (not a quote):
Espressif's own published sample reference price for the base
ESP32-S3-WROOM-1 is **$2.96** (esp32.iammanis.com/pricing, figures
verified September 2026, indicative — not a volume price). FindChips/TME
listings the same day show variant prices well above that (e.g.
WROOM-1-N16R8 $4.15 at 650 units), so the @1k comparison depends on
which S3 variant the product actually uses — and the capsule's baseline
names no flash/PSRAM variant. Snail32's $2.50 target beats the $2.96
reference by $0.46, but the comparison is target-vs-reference, not
quote-vs-quote, and the saving is smaller than the unpriced migration
bill (porting + certification + RF validation).

Total cost = unit price + migration cost + certification cost + risk.
Only the first term has a number, and it is a target. The other three
are unpriced unknowns.

## 6 — Risk register

| Risk | Likelihood | Impact | Mitigation / owner |
| --- | --- | --- | --- |
| No silicon, no measurements — every spec is a target | Certain | High | Owner: company. Ship samples + datasheet before any sourcing decision. |
| RISC-V, no ESP-IDF — code porting | Certain if adopted | High | Budget the port, or prove the IDF-compatible layer is real. Owner: company SDK team. |
| Pin-compatibility unproven (no pinout doc) | Unknown | High | Publish pinout; verify pin-for-pin. Owner: company. |
| Zero certifications — buyer certifies the host device | Certain if adopted now | High | Certification plan with dates, or buyer waits. Owner: company. |
| Single source, no second source / EOL policy | Unknown | Medium | Name alternates + EOL policy. Owner: company. |
| Price target unproven ($2.50 @1k) | Unknown | Medium | Distributor quote at 1k/10k when samples exist. Owner: company. |
| ADC regression (16 vs 20 ch) | Certain on paper | Low–Medium | ADC row needs a migration cost; check channel needs. Owner: engineer. |
| NPU toolchain / model support immature | Unknown | Medium | SDK quickstart + model support list. Owner: company. |
| Capsule defects found in this run (see §7) | Certain | Low | Fix before the next evaluation. Owner: capsule maintainer. |

## 7 — Unknowns list (what the decision still depends on)

- Real measurements for all 36 `target` fields (datasheet, RF and power
  test reports — all 9 expected docs in `docs/docs-manifest.json` are
  missing).
- The 29 `unknown` spec/commercial fields (§2).
- The evaluation-task blanks: my product, annual quantity, target price,
  certifications needed, timeline.
- S3 variant (flash/PSRAM) for a like-for-like price comparison.
- Certification plan with dates; EOL / longevity policy; second source.
- Migration cost in time and money for the ESP-IDF port and for
  host-device certification.

## 8 — Capsule defects found by this run (fix before the next evaluation)

1. **README.md is stale after v0.2.0.** Its Contents list still says
   "comparison vs ESP32-WROOM-32", its spec line still says "all values
   TBD", and "What is still missing" still says "Everything about Snail32
   itself: the spec values…" — but v0.2.0 filled 36 target values and
   re-baselined to the S3. A reader of the README alone gets the old
   capsule.
2. **Baseline citation mismatch.** `comparison.json` / `capsule.json`
   cite "Espressif ESP32-S3 Series Datasheet v1.9" but the `source_url`
   points to a Zephyr project docs page
   (docs.zephyrproject.org … soc-esp32s3-features), not Espressif's
   datasheet. Fix the URL or the source name.
3. **ADC row missing its migration cost** (see §3).
4. **No S3 variant named.** The price comparison needs the exact
   WROOM-1 variant (N4R2 / N8R8 / N16R8 …) — prices span roughly
   $2.96–$4.15+ by variant.
5. **Handbook example note is now outdated.** The commented example in
   `handbook.md` still says the baseline variant is open and Snail32
   values are all unknown — both were settled/changed by v0.2.0.

## What would change the verdict

A datasheet + pinout + RF/power measurements (turning targets into
verified values), a certification plan with dates, samples with a
distributor quote at 1k, and the evaluation-task blanks filled in for a
real product. Then re-run the playbook — the next evaluation starts from
this report.

## Sources

- `spec.json`, `comparison.json`, `sourcing.json`, `capsule.json`,
  `compliance.md`, `docs/docs-manifest.json`, `evaluation-playbook.md`,
  `handbook.md`, `evaluation-task.md`, `README.md`, `CHANGELOG.md`
  (all in `~/workspace/white-capsule-snail32/`, capsule v0.2.0).
- Live S3 price snapshot 2026-11-25: https://esp32.iammanis.com/pricing/
  (Espressif reference $2.96, verified Sept 2026) and
  https://www.findchips.com/search/esp32-s3-wroom-1 (TME listings).
