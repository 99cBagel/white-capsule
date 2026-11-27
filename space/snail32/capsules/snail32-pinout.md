# Snail32 — Pinout (Draft)

> **DRAFT — CONCEPT DOCUMENT: Snail32 Pinout.** Snail32 is a concept-stage board; no silicon exists yet. This document is built around a reference product: the **ESP32-S3-WROOM-1** module (Espressif), whose pin map below is real and **verified** from Espressif's published datasheet. Snail32's position is stated per pin: the concept targets the same package and footprint as the reference, so the target is "same as reference" — but that is a **target**, not a proven pin map, and every deviation is **TBD**.

This draft is the table from which the final pinout diagram (snail32-pinout.png) will be drawn.

## 1. How to read this document

- The **reference columns** (No., Name, Type, Function) reproduce Table 2, "Pin Definitions," of the ESP32-S3-WROOM-1 & ESP32-S3-WROOM-1U Datasheet v1.0 (Espressif Systems). Source: https://www.espressif.com/documentation/esp32-s3-wroom-1_wroom-1u_datasheet_en.pdf (copy consulted: http://datasheet.octopart.com/ESP32-S3-WROOM-1-N16R8-Espressif-Systems-datasheet-165560563.pdf)
- Type key, from the same table: **P** = power supply; **I** = input; **O** = output; **T** = high impedance.
- The **Snail32 position** column states the concept's intent for that position. "Same as reference (target)" follows from the capsule's package target — QFN56 7×7 mm, pin-compatible with the S3-WROOM-1 footprint. It is a claim to be proven pad by pad, not a fact.
- Snail32 has **no pin map of its own**. Nothing in the Snail32 column may be used to lay out a board.

## 2. Reference pin map, with Snail32 position

| No. | Name | Type | Function — ESP32-S3-WROOM-1 (verified) | Snail32 position |
| --- | --- | --- | --- | --- |
| 1 | GND | P | GND | Same as reference (target) |
| 2 | 3V3 | P | Power supply | Same as reference (target) |
| 3 | EN | I | High: on, enables the chip. Low: off, the chip powers off. Do not leave the EN pin floating. | Same as reference (target) |
| 4 | IO4 | I/O/T | RTC_GPIO4, GPIO4, TOUCH4, ADC1_CH3 | Same as reference (target) |
| 5 | IO5 | I/O/T | RTC_GPIO5, GPIO5, TOUCH5, ADC1_CH4 | Same as reference (target) |
| 6 | IO6 | I/O/T | RTC_GPIO6, GPIO6, TOUCH6, ADC1_CH5 | Same as reference (target) |
| 7 | IO7 | I/O/T | RTC_GPIO7, GPIO7, TOUCH7, ADC1_CH6 | Same as reference (target) |
| 8 | IO15 | I/O/T | RTC_GPIO15, GPIO15, U0RTS, ADC2_CH4, XTAL_32K_P | Same as reference (target) |
| 9 | IO16 | I/O/T | RTC_GPIO16, GPIO16, U0CTS, ADC2_CH5, XTAL_32K_N | Same as reference (target) |
| 10 | IO17 | I/O/T | RTC_GPIO17, GPIO17, U1TXD, ADC2_CH6 | Same as reference (target) |
| 11 | IO18 | I/O/T | RTC_GPIO18, GPIO18, U1RXD, ADC2_CH7, CLK_OUT3 | Same as reference (target) |
| 12 | IO8 | I/O/T | RTC_GPIO8, GPIO8, TOUCH8, ADC1_CH7, SUBSPICS1 | Same as reference (target) |
| 13 | IO19 | I/O/T | RTC_GPIO19, GPIO19, U1RTS, ADC2_CH8, CLK_OUT2, USB_D− | Same as reference (target) |
| 14 | IO20 | I/O/T | RTC_GPIO20, GPIO20, U1CTS, ADC2_CH9, CLK_OUT1, USB_D+ | Same as reference (target) |
| 15 | IO3 | I/O/T | RTC_GPIO3, GPIO3, TOUCH3, ADC1_CH2 | Same as reference (target); strapping pin on the reference — Snail32 strapping set TBD |
| 16 | IO46 | I/O/T | GPIO46 | Same as reference (target); strapping pin on the reference — Snail32 strapping set TBD |
| 17 | IO9 | I/O/T | RTC_GPIO9, GPIO9, TOUCH9, ADC1_CH8, FSPIHD, SUBSPIHD | Same as reference (target) |
| 18 | IO10 | I/O/T | RTC_GPIO10, GPIO10, TOUCH10, ADC1_CH9, FSPICS0, FSPIIO4, SUBSPICS0 | Same as reference (target) |
| 19 | IO11 | I/O/T | RTC_GPIO11, GPIO11, TOUCH11, ADC2_CH0, FSPID, FSPIIO5, SUBSPID | Same as reference (target) |
| 20 | IO12 | I/O/T | RTC_GPIO12, GPIO12, TOUCH12, ADC2_CH1, FSPICLK, FSPIIO6, SUBSPICLK | Same as reference (target) |
| 21 | IO13 | I/O/T | RTC_GPIO13, GPIO13, TOUCH13, ADC2_CH2, FSPIQ, FSPIIO7, SUBSPIQ | Same as reference (target) |
| 22 | IO14 | I/O/T | RTC_GPIO14, GPIO14, TOUCH14, ADC2_CH3, FSPIWP, FSPIDQS, SUBSPIWP | Same as reference (target) |
| 23 | IO21 | I/O/T | RTC_GPIO21, GPIO21 | Same as reference (target) |
| 24 | IO47 | I/O/T | SPICLK_P_DIFF, GPIO47, SUBSPICLK_P_DIFF | Same as reference (target) |
| 25 | IO48 | I/O/T | SPICLK_N_DIFF, GPIO48, SUBSPICLK_N_DIFF | Same as reference (target) |
| 26 | IO45 | I/O/T | GPIO45 | Same as reference (target); strapping pin on the reference — Snail32 strapping set TBD |
| 27 | IO0 | I/O/T | RTC_GPIO0, GPIO0 | Same as reference (target); strapping pin on the reference — Snail32 strapping set TBD |
| 28 | IO35 | I/O/T | SPIIO6, GPIO35, FSPID, SUBSPID (note b) | Same as reference (target); availability depends on the Snail32 PSRAM interface — TBD |
| 29 | IO36 | I/O/T | SPIIO7, GPIO36, FSPICLK, SUBSPICLK (note b) | Same as reference (target); availability depends on the Snail32 PSRAM interface — TBD |
| 30 | IO37 | I/O/T | SPIDQS, GPIO37, FSPIQ, SUBSPIQ (note b) | Same as reference (target); availability depends on the Snail32 PSRAM interface — TBD |
| 31 | IO38 | I/O/T | GPIO38, FSPIWP, SUBSPIWP | Same as reference (target) |
| 32 | IO39 | I/O/T | MTCK, GPIO39, CLK_OUT3, SUBSPICS1 | Same as reference (target) |
| 33 | IO40 | I/O/T | MTDO, GPIO40, CLK_OUT2 | Same as reference (target) |
| 34 | IO41 | I/O/T | MTDI, GPIO41, CLK_OUT1 | Same as reference (target) |
| 35 | IO42 | I/O/T | MTMS, GPIO42 | Same as reference (target) |
| 36 | RXD0 | I/O/T | U0RXD, GPIO44, CLK_OUT2 | Same as reference (target) |
| 37 | TXD0 | I/O/T | U0TXD, GPIO43, CLK_OUT1 | Same as reference (target) |
| 38 | IO2 | I/O/T | RTC_GPIO2, GPIO2, TOUCH2, ADC1_CH1 | Same as reference (target) |
| 39 | IO1 | I/O/T | RTC_GPIO1, GPIO1, TOUCH1, ADC1_CH0 | Same as reference (target) |
| 40 | GND | P | GND | Same as reference (target) |
| 41 | EPAD | P | GND | Same as reference (target) |

Notes from the reference datasheet:

- **Note b (pins 28–30):** in module variants that embed OSPI PSRAM (ESP32-S3R8), IO35, IO36, and IO37 connect to the OSPI PSRAM and are not available for other uses. For pins 28–30, the default function is decided by an eFuse bit.
- The reference chip has 45 programmable GPIOs; the module brings 36 of them to pins, alongside power, enable, and the exposed ground pad.
- The reference module (WROOM-1) carries an on-board PCB antenna with a keep-out zone; the WROOM-1U variant uses an external antenna connector and has no keep-out zone.

## 3. Strapping pins

Reference (verified, ESP32-S3-WROOM-1 Datasheet v1.0, §3.3): the ESP32-S3 has four strapping pins.

| Reference pin | Role on the reference | Snail32 position |
| --- | --- | --- |
| GPIO0 | Booting mode (default pull-up; 1 = SPI boot, 0 = download boot) | Strapping set TBD — not yet specified |
| GPIO46 | Download-boot condition and ROM boot-message print control (default pull-down) | Strapping set TBD — not yet specified |
| GPIO45 | VDD_SPI voltage selection (default pull-down; 0 = 3.3 V, 1 = 1.8 V) | Strapping set TBD — not yet specified |
| GPIO3 | JTAG signal source selection (floating by default) | Strapping set TBD — not yet specified |

Snail32's spec leaves strapping pins entirely TBD: which pins, how many, and their required boot states are all undecided. The reference set above is the starting point the concept would be judged against — nothing more.

## 4. Reference facts the Snail32 targets are measured against

| Item | ESP32-S3-WROOM-1 (verified) | Snail32 | Snail32 status |
| --- | --- | --- | --- |
| Module pins | 41 (40 + exposed pad) | Per footprint target | Target |
| Module dimensions | 18.0 × 25.5 × 3.1 mm | TBD — not yet specified | TBD |
| Chip package | QFN56, 7×7 mm (ESP32-S3 Series Datasheet v1.9) | QFN56, 7×7 mm | Target |
| GPIO | 45 programmable on chip (4 strapping); 36 on module pins | 48 total; usable TBD | Target / TBD |
| Supply | 3.0–3.6 V (typ 3.3 V) | 3.0–3.6 V | Target |
| Antenna | On-board PCB antenna + keep-out zone (WROOM-1) | TBD — not yet specified | TBD |
| Pin pitch / land pattern | Defined in the reference module datasheet, §7 | TBD — not yet specified | TBD |

## 5. The pin-compatibility question

**Direct answer to "is the pinout a drop-in match for the ESP32-S3?": not proven.** Drop-in compatibility is a design target, and today it cannot be checked — no Snail32 pin map exists to check it against.

The concept's central hardware claim is a target: same package (QFN56, 7×7 mm) and pin-compatible with the ESP32-S3-WROOM-1 footprint, so the module could drop into an existing design. The reference side of that claim is now fully documented above. The Snail32 side **cannot be checked** until a real Snail32 pin map exists — the datasheet's comparison states it plainly: the pin-compatible target "must be proven on the real pinout."

Two mismatches are already visible and unresolved:

- **GPIO count.** The reference chip offers 45 programmable GPIOs and the module exposes 36; the Snail32 target is 48 programmable. Where the additional pins would live on a 41-pin module footprint is unexplained — TBD.
- **Strapping.** The reference reserves 4 pins for strapping. Snail32's strapping set is undecided, so boot behaviour on a shared footprint is undefined — TBD.

Until a Snail32 pin map exists:

- Do not lay out a board against this draft.
- Do not assume any ESP32-S3 pin function carries over to the same position on Snail32.
- Treat "drop-in vs redesign" as an open question, not a decided one.

## 6. What the final diagram needs before it can be drawn

1. A Snail32 pad list: pad number → net name, confirmed against the reference map above, position by position.
2. A deviation list: every position where Snail32 differs from the reference, with the reason.
3. The strapping pin set and its required boot states.
4. The usable-GPIO count, after reserved and strapping pins are excluded — and an explanation of the 48-GPIO target against a 41-pin footprint.
5. The antenna approach (on-board with keep-out zone, external connector, or other), matching the reference decision it replaces.
6. Confirmation — or withdrawal — of the S3-WROOM-1 footprint-compatibility target, pad by pad.

Each item is currently TBD — not yet specified.
