# Snail32 — Development Board Guide (Draft)

> **DRAFT — CONCEPT DOCUMENT: Snail32 Dev-Board Guide.** Snail32 is a concept-stage board; no silicon exists yet. Every value below is a design target or TBD, taken from the capsule's spec — not a measurement, not verified, unless a value is explicitly marked verified with its named source.

## 1. Status of the board

No development board exists. The capsule spec leaves every board-level fact undecided:

| Board fact | Status |
| --- | --- |
| Dev-board features | TBD — not yet specified |
| Form factor | TBD — not yet specified |
| Dimensions | TBD — not yet specified |
| Mounting | TBD — not yet specified |
| Weight | TBD — not yet specified |

This guide is therefore a structured outline: the sections the real guide will contain, the module-level targets that constrain the board, and the decisions still open. It cannot be used to operate a board, because there is no board to operate.

## 2. What the board must expose

The board exists to make the module's targeted capabilities reachable. From the capsule spec (all targets):

| Capability | Target | Board implication |
| --- | --- | --- |
| Processor | RISC-V dual-core, 320 MHz max | — |
| Memory | 8 MB flash, 8 MB PSRAM | — |
| Wi-Fi / Bluetooth | Wi-Fi 6 (2.4 GHz), Bluetooth 5.3 LE | Antenna approach is TBD — not yet specified |
| USB | Full-speed USB OTG + USB Serial/JTAG | The expected power, programming, and debug connection |
| GPIO | 48 total; usable count TBD | Header breakout count cannot be stated yet |
| Peripherals | UART 3×, I2C 2×, SPI 4×, I2S 2×, CAN (TWAI), ADC 12-bit/16 ch | Which are broken out to headers: TBD |
| Supply | 3.0–3.6 V (module input) | Board input voltage and regulation: TBD |

## 3. Powering the board

- Module supply range: 3.0–3.6 V (**target**).
- Board power input (USB-powered, external supply, or both): TBD — not yet specified.
- On-board regulation, current capacity, and power indication: TBD — not yet specified. The module's active current is itself TBD, so the board's supply sizing cannot be stated.

## 4. Connecting and first use

The intended first-use flow, once a board exists:

1. Connect the board over USB — the module targets full-speed USB OTG plus USB Serial/JTAG, which is the expected programming and debug path. Cable and connector type: TBD — not yet specified.
2. Install the toolchain and SDK — see the draft SDK quickstart. Toolchain: TBD — not yet specified.
3. Build and flash the first project ("first blink") — the milestone this guide will walk through once software exists.
4. Open the serial monitor and confirm output — tool and settings: TBD — not yet specified.

No step in this flow can be executed today.

## 5. Headers and pin access

- Pin assignment does not exist yet; see the draft pinout. Which signals reach headers, and the header layout, are TBD — not yet specified.
- Boot / strapping controls on the board (buttons, jumpers): TBD — not yet specified. The module's strapping pins are themselves TBD.
- Reset and boot buttons: TBD — not yet specified.

## 6. Known limitations

- **Concept stage.** The module is a design target; the board is not designed, built, or tested.
- **Nothing is verified.** No value in the module spec is a measurement.
- **No certifications.** The board and module hold none; see the capsule's compliance table (all items unknown).
- **No support channel, warranty, or returns terms exist** — all TBD in the capsule's sourcing file.

## 7. What this guide needs before publication

1. A designed board: form factor, dimensions, mounting, weight, feature list.
2. A pin map and header assignment.
3. Power architecture: inputs, regulation, measured current draw.
4. A working toolchain and SDK, so §§3–4 can be written as tested steps.
5. Photographs and a board layout figure — of a real board.

Until then, this document stays a draft outline and must not be published as a user guide.
