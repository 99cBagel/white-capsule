# Snail32 — Datasheet (Draft)

> **DRAFT — CONCEPT DOCUMENT: Snail32 Datasheet.** Snail32 is a concept-stage board; no silicon exists yet. This document is built around a reference product: the **ESP32-S3** (module **ESP32-S3-WROOM-1**), a real, shipping part. Reference values are **verified** from Espressif's published documentation, named in §13. Every Snail32 value is a design **target** or **TBD** — not a measurement, and not verified.

| Field | Value |
| --- | --- |
| Product | Snail32 |
| Category | MCU module / development board |
| Reference product | ESP32-S3-WROOM-1 (ESP32-S3), Espressif |
| Maker | TBD — not yet specified |
| Part number | TBD — not yet specified |
| Revision | TBD — not yet specified |
| Spec basis | Capsule spec v0.2.0 (all Snail32 values are concept targets) |

**Status words used in this document**

- **Verified** — taken from a named Espressif document (see §13). Used only for ESP32-S3 reference values.
- **Target** — a Snail32 design goal. Not a measurement. Never quote as a spec.
- **TBD — not yet specified** — not yet decided or measured. A gap, not a zero.

**How to read this capsule.** This document and the other three Core documents in `docs/` (pinout, SDK quickstart, reference designs) are the capsule's only source of truth; the MCP service renders its answers from them. Statuses: **Verified** — measured or taken from a named source document, with the source cited with the value; **Target** — a design goal, including concept placeholders invented for this mockup — not a measurement, never quote as a spec; **Unknown** — not yet decided or measured, a gap, not a zero. The baseline for every comparison is the **ESP32-S3-WROOM-1 (ESP32-S3)**, its values verified against the **Espressif ESP32-S3 Series Datasheet v1.9**.

## 1. Overview

Snail32 is a concept-stage wireless MCU module / development board, defined against the ESP32-S3-WROOM-1 as its reference. The design target is a RISC-V dual-core processor with Wi-Fi 6 and Bluetooth 5.3 LE, in the same package and footprint as the reference module, so that it could serve as a drop-in candidate for designs built around that module.

The reference is real and orderable; Snail32 is not. No Snail32 silicon exists, nothing has been built or measured, and code portability rests on an ESP-IDF API-compatible layer that is itself a target and unproven. Read every Snail32 column below in that light.

## 2. Head-to-head against the reference

Baseline values are **verified** (Espressif ESP32-S3 Series Datasheet v1.9). Every Snail32 value is a **target**. Verdicts are this capsule's comparison verdicts, not measurements.

| Dimension | ESP32-S3 (verified) | Snail32 (target) | Verdict | Notes |
| --- | --- | --- | --- | --- |
| CPU core | Xtensa dual-core 32-bit LX7 | RISC-V dual-core 32-bit | Better | RISC-V means no ESP-IDF — code porting is the biggest migration cost. |
| Clock (max) | 240 MHz | 320 MHz | Better | Snail32 beats the baseline on this dimension. |
| SRAM | 512 KB + 16 KB RTC | 768 KB + 16 KB RTC | Better | Snail32 beats the baseline on this dimension. |
| Flash / PSRAM | 8 MB flash opt.; in-package PSRAM up to 16 MB (S3R16) | 8 MB flash + 8 MB PSRAM | Same | Equivalent for sourcing purposes. |
| Wi-Fi | 802.11 b/g/n, 2.4 GHz | Wi-Fi 6 (802.11ax), 2.4 GHz | Better | Wi-Fi 6 needs new RF validation and host testing. |
| Bluetooth | Bluetooth 5.0 LE (no Classic) | Bluetooth 5.3 LE | Better | Snail32 beats the baseline on this dimension. |
| GPIO | 45 programmable (4 strapping) | 48 programmable | Better | Pin-compatible footprint target softens hardware migration. |
| ADC | 12-bit SAR ADC ×2, up to 20 ch | 12-bit ADC, 16 ch | Worse | Snail32 is behind the baseline — migration cost or risk. |
| AI acceleration | Vector instructions (SIMD) | 0.5 TOPS NPU | Better | NPU needs its own toolchain and model support. |
| USB | Full-speed USB OTG + USB Serial/JTAG | Full-speed USB OTG + USB Serial/JTAG | Same | Equivalent for sourcing purposes. |
| Package / footprint | QFN56 7×7 mm | QFN56 7×7 mm, pin-compatible with S3-WROOM-1 footprint | Same | Pin-compatible target is the drop-in story — must be proven on the real pinout. |
| SDK / ecosystem | ESP-IDF, Arduino core; FreeRTOS | FreeRTOS + Arduino; ESP-IDF API-compatible layer | Worse | No ESP-IDF on RISC-V — budget the port, or the IDF-compatible layer must be real. |
| Unit price @ 1k | Distributor-dependent — check live at evaluation time | $2.50 | Better | Snail32 beats the baseline on this dimension. |
| Certifications | RF certified; REACH/RoHS | None yet — planned | Worse | Snail32 has none yet — buyer does host-device certification or waits. |

Migration notes that matter: RISC-V means no ESP-IDF, so code porting is the biggest migration cost; Wi-Fi 6 needs new RF validation and host testing; the pin-compatible footprint target softens hardware migration but must be proven on the real pinout.

## 3. Processor and memory

| Item | ESP32-S3 reference (verified) | Snail32 | Snail32 status |
| --- | --- | --- | --- |
| CPU | Xtensa dual-core 32-bit LX7 | RISC-V dual-core, 32-bit | Target |
| Max clock | 240 MHz | 320 MHz | Target |
| FPU | Not stated in the sources consulted for this draft | Single-precision | Target |
| SRAM | 512 KB | 768 KB | Target |
| RTC SRAM | 16 KB | 16 KB | Target |
| ROM | 384 KB | 384 KB | Target |
| Flash | Up to 16 MB across module variants; 8 MB in the compared configuration | 8 MB | Target |
| PSRAM | In-package, up to 16 MB (S3R16) | 8 MB | Target |
| Memory options (variants) | Multiple module variants combine different flash sizes and PSRAM options (comparison file) | Single configuration targeted (8 MB flash + 8 MB PSRAM); variant options TBD — not yet specified | TBD |

## 4. Wireless

| Item | ESP32-S3 reference (verified) | Snail32 | Snail32 status |
| --- | --- | --- | --- |
| Wi-Fi standards | 802.11 b/g/n | 802.11ax (Wi-Fi 6) | Target |
| Wi-Fi band | 2.4 GHz (2412–2484 MHz) | 2.4 GHz | Target |
| Wi-Fi max data rate | 150 Mbps (802.11n, HT40) | TBD — not yet specified | TBD |
| Bluetooth | 5.0 LE (Classic: no); Bluetooth mesh; 125 Kbps–2 Mbps PHYs | 5.3 LE (Classic: no — LE only) | Target |
| TX power | Typ 20.5 dBm (802.11b, 1 Mbps) | TBD — not yet specified | TBD |
| RX sensitivity | Typ −98.2 dBm (802.11b, 1 Mbps) | TBD — not yet specified | TBD |
| Antenna | On-board PCB antenna (WROOM-1); external antenna via connector (WROOM-1U) | TBD — not yet specified | TBD |
| Other radios | None in the reference | TBD — not yet specified | TBD |

No Snail32 RF value has been measured. There is no Snail32 RF test report.

## 5. I/O and peripherals

Reference counts are chip-level unless marked "module". The reference module breaks out 36 GPIOs on 41 pins (see the draft pinout document).

| Item | ESP32-S3 reference (verified) | Snail32 | Snail32 status |
| --- | --- | --- | --- |
| GPIO, total | 45 programmable (chip); 36 on the module | 48 | Target |
| GPIO, usable | Reduced by strapping and reserved pins — see pinout draft | TBD — not yet specified | TBD |
| ADC | 12-bit SAR ×2, up to 20 channels | 12-bit, 16 channels | Target |
| DAC | Not present in the reference module datasheet's peripheral list | TBD — not yet specified (resolution and channels) | TBD |
| UART | Yes — UART0/UART1 on module pins; full counts in the ESP32-S3 Series Datasheet | 3× | Target |
| I2C | Yes — see ESP32-S3 Series Datasheet for counts | 2× | Target |
| SPI | Yes — SPI and FSPI interfaces on module pins | 4× | Target |
| I2S | Yes — see ESP32-S3 Series Datasheet for counts | 2× | Target |
| CAN | Yes — TWAI controller, compatible with ISO 11898-1 | Yes (TWAI/CAN) | Target |
| USB | Full-speed USB OTG + USB Serial/JTAG | Full-speed USB OTG + USB Serial/JTAG | Target |
| PWM | LED PWM and MCPWM controllers | TBD — not yet specified | TBD |
| SDIO | Yes — SDIO host | TBD — not yet specified | TBD |
| Ethernet | Not present in the reference module datasheet's peripheral list | TBD — not yet specified | TBD |
| Touch sensor | Yes — TOUCH1–TOUCH14 on module pins | TBD — not yet specified | TBD |
| LCD interface | Present on the reference chip — see ESP32-S3 Series Datasheet (not covered in §2's comparison) | TBD — not yet specified | TBD |
| Camera interface | Present on the reference chip — see ESP32-S3 Series Datasheet (not covered in §2's comparison) | TBD — not yet specified | TBD |
| Strapping pins | 4 — GPIO0, GPIO45, GPIO46, GPIO3 | TBD — not yet specified | TBD |

Snail32 pin-by-pin assignment does not exist yet; see the draft pinout document, which presents the reference pin map in full.

## 6. Power

| Item | ESP32-S3 reference (verified) | Snail32 | Snail32 status |
| --- | --- | --- | --- |
| Supply voltage | 3.0–3.6 V (typ 3.3 V); external supply to deliver ≥ 0.5 A | 3.0–3.6 V | Target |
| Deep-sleep current | Typ 7 µA (RTC memory on, RTC peripherals off) | 5 µA | Target |
| Light-sleep current | See ESP32-S3 Series Datasheet | TBD — not yet specified | TBD |
| Modem-sleep current | See ESP32-S3 Series Datasheet | Not specified — the capsule spec defines no modem-sleep figure (see note below) | TBD |
| Active current | Peak TX 355 mA (802.11b @ 20.5 dBm); RX 95–97 mA | TBD — not yet specified | TBD |
| I/O voltage | 3.3 V | TBD — not yet specified | TBD |
| Wake sources | ULP coprocessor and RTC-domain sources (ESP32-S3 Series Datasheet) | TBD — not yet specified | TBD |

The Snail32 deep-sleep figure is a target, not a measurement. There are no measured Snail32 power figures of any kind; the power-measurements document the capsule expects is still missing.

On **modem-sleep** specifically: ESP-IDF names a modem-sleep mode, and engineers ask for its current. The capsule's spec does not define a modem-sleep state for Snail32 — its power states are active, light sleep, and deep sleep, and of those only deep sleep carries even a target figure (light sleep is TBD). So no modem-sleep current can be stated for Snail32 until the spec defines the mode and sets a figure; treat any modem-sleep number attributed to Snail32 as invented.

## 7. Security

| Item | ESP32-S3 reference (verified) | Snail32 | Snail32 status |
| --- | --- | --- | --- |
| Secure boot | Yes — ESP32-S3 Series Datasheet v1.9 (capsule baseline source) | Yes | Target |
| Flash encryption | Yes — ESP32-S3 Series Datasheet v1.9 (capsule baseline source) | Yes | Target |
| Crypto acceleration | Yes — ESP32-S3 Series Datasheet v1.9 (capsule baseline source) | TBD — not yet specified | TBD |
| eFuse / OTP | Yes — eFuse configuration bits throughout the reference documentation | TBD — not yet specified | TBD |

## 8. Software

| Item | ESP32-S3 reference (verified) | Snail32 | Snail32 status |
| --- | --- | --- | --- |
| RTOS | FreeRTOS (via ESP-IDF) | FreeRTOS | Target |
| SDK | ESP-IDF; Arduino core | FreeRTOS + Arduino | Target |
| OTA updates | Supported in ESP-IDF | Yes | Target |
| ESP32 code portability | Native — ESP-IDF is the reference SDK | Via an ESP-IDF API-compatible layer — target, unproven | Target |
| Toolchain | Xtensa toolchain installed with ESP-IDF (see quickstart draft) | TBD — not yet specified | TBD |
| Languages | C/C++ in ESP-IDF; Arduino sketches (ESP-IDF Programming Guide) | TBD — not yet specified | TBD |

## 9. Operating conditions and package

| Item | ESP32-S3 reference (verified) | Snail32 | Snail32 status |
| --- | --- | --- | --- |
| Operating temperature | −40 °C to +65/+85/+105 °C, by module variant | −40 °C to +85 °C | Target |
| Chip package | QFN56, 7×7 mm | QFN56, 7×7 mm | Target |
| Module dimensions | 18.0 × 25.5 × 3.1 mm (WROOM-1) | TBD — not yet specified | TBD |
| Pin-compatible with ESP32 | — (it is the reference) | Yes — S3-WROOM-1 footprint | Target |
| Pin pitch | Per the reference module datasheet's land pattern | TBD — not yet specified | TBD |
| Form factor / mounting | Surface-mount module, on-board PCB antenna (WROOM-1) | TBD — not yet specified | TBD |
| Weight | See reference module datasheet | TBD — not yet specified | TBD |
| ESD rating | ESD listed among the reference module's reliability tests (HTOL/HTSL/uHAST/TCT/ESD) | TBD — not yet specified | TBD |
| Humidity rating | See reference module datasheet | TBD — not yet specified | TBD |

## 10. Certifications

Reference: the ESP32-S3-WROOM-1 is RF certified and holds RoHS/REACH green certification (module datasheet; capsule comparison).

Snail32: none held. Every compliance item (FCC, CE RED, ISED, TELEC/MIC, RoHS, REACH, WEEE, conflict minerals, UL/safety, ISO 9001 of the maker) is status **unknown** in the capsule's compliance table, and the comparison records certifications as "none yet — planned." Until Snail32 holds its own modular certification, a buyer integrating it must do their own host-device certification, or wait.

## 11. Ordering information

Reference: the ESP32-S3-WROOM-1 is an active, distributor-stocked product, orderable today in single units — no sample-request process is needed for the reference.

Snail32: there is nothing to order. No samples, no distributor, no certification exist today. The commercial figures below are the capsule's targets, folded into this document from its former sourcing data — they are targets, not quotes, and a price here is a snapshot that must be re-checked live at evaluation time.

| Qty | Unit price (USD) | Status |
| --- | --- | --- |
| 1 | $3.50 | Target |
| 100 | $3.10 | Target |
| 1,000 | $2.50 | Target |
| 10,000 | $2.10 | Target |

| Item | Snail32 | Status |
| --- | --- | --- |
| MOQ | 1,000 units | Target |
| Lead time | 8 weeks | Target |
| Distributors | TBD — not yet specified | Unknown |
| Samples — price | TBD — not yet specified | Unknown |
| Samples — quantity available | TBD — not yet specified | Unknown |
| Samples — ship date | TBD — not yet specified | Unknown |

## 12. What would make this a real datasheet

Each Snail32 value above becomes a specification only when it is measured on real hardware or taken from a named source document held in the capsule's `docs/`. Until then, this document is a statement of design intent for a concept product, organised around a real reference.

## 13. Sources

- ESP32-S3 Series Datasheet v1.9 (Espressif) — the capsule's baseline source for comparison values.
- ESP32-S3-WROOM-1 & ESP32-S3-WROOM-1U Datasheet v1.0 (Espressif Systems, © 2022) — module features, electrical characteristics, ordering information. Canonical URL (printed in the document): https://www.espressif.com/documentation/esp32-s3-wroom-1_wroom-1u_datasheet_en.pdf — copy consulted via Octopart: http://datasheet.octopart.com/ESP32-S3-WROOM-1-N16R8-Espressif-Systems-datasheet-165560563.pdf
- This capsule's own former data files (spec, comparison, sourcing), folded into this document on 2026-11-27 and retired — the Core documents in `docs/` are now the only source of truth.
