# Snail32 — Reference Design Guide (Draft)

> **DRAFT — CONCEPT DOCUMENT: Snail32 Reference Schematic.** Snail32 is a concept-stage board; no silicon exists yet. Every value below is a design target or TBD, taken from the capsule's spec — not a measurement, not verified, unless a value is explicitly marked verified with its named source.

## 1. Status of the reference design

No reference schematic exists. This draft is the guide text that will accompany it: what the reference design must contain, what the capsule spec already fixes as design targets, and which values must be decided before any schematic can be drawn. Nothing in this document is a circuit that can be built.

A buyer normally copies the reference design into their own board. Until the blocking values in §3 are specified, there is nothing to copy.

## 2. Blocks the reference design must show

| Block | What it must show | Basis in the spec | Status |
| --- | --- | --- | --- |
| Power input and regulation | A supply design for the module's 3.0–3.6 V input range (target), sized for the active current | Supply voltage: target. Active current: TBD | Blocked — current unknown |
| Power integrity | Decoupling and bulk capacitance, supply sequencing if any | No values in spec | TBD — not yet specified |
| Reset and boot | Reset circuit and boot-mode selection | Strapping pins: TBD | Blocked — strapping unknown |
| Clock | Clock source and any external crystal or oscillator requirement | Core clock max 320 MHz (target); clock source not in spec | TBD — not yet specified |
| Memory | How the 8 MB flash and 8 MB PSRAM (targets) connect — in-package or external | Sizes: targets. Integration: not in spec | TBD — not yet specified |
| USB | Full-speed USB OTG + USB Serial/JTAG (target): connector, protection, routing | USB: target | Partially defined |
| Debug / programming | The USB Serial/JTAG path (target) as the programming and debug interface | USB: target. Toolchain: TBD | Partially defined |
| RF and antenna | Antenna choice (chip, trace, or connector), matching network, keep-out | Antenna: TBD. TX power and RX sensitivity: TBD | Blocked — RF undefined |
| I/O breakout | UART 3×, I2C 2×, SPI 4×, I2S 2×, CAN (TWAI), ADC 12-bit/16 ch, GPIO 48 (all targets) | Peripheral counts: targets. Pin assignment: TBD | Blocked — no pin map |
| Uncommitted interfaces | DAC, PWM, SDIO, Ethernet, touch — include or omit | All TBD in spec | TBD — not yet specified |
| Security features | Any hardware support secure boot and flash encryption (targets) need, e.g. key provisioning | Secure boot / flash encryption: targets. eFuse/OTP: TBD | TBD — not yet specified |

## 3. Blocking unknowns

The schematic cannot be drawn until these are decided. Each is currently **TBD — not yet specified** in the capsule spec:

1. **Pin map.** No pad assignment exists (see the draft pinout). Every block above depends on it.
2. **Active current.** Without it, the power supply and decoupling cannot be sized.
3. **I/O voltage.** Needed for every interface level and pull-up choice.
4. **Strapping pins.** Needed for the boot and reset circuits.
5. **Antenna approach and RF figures.** TX power and RX sensitivity are unspecified; the RF section and its layout rules cannot be written.
6. **Clock source.** The spec gives a maximum core clock (320 MHz, target) but no clock-generation scheme.

## 4. Layout guidance

No layout rules can be stated yet. RF keep-out, controlled-impedance routing, ground strategy, and thermal guidance all depend on the pin map, the antenna decision, and measured or simulated RF and power behaviour — none of which exist. Any layout numbers written now would be invented, so this section is intentionally empty except for this note: **TBD — not yet specified.**

## 5. Relationship to the ESP32-S3 baseline

The package and footprint target (QFN56, 7×7 mm; S3-WROOM-1 footprint, both targets) means an existing ESP32-S3-WROOM-1 reference design is the natural starting sketch for a Snail32 one. It is not a substitute: the processor is a different architecture (RISC-V vs Xtensa), the radio targets differ (Wi-Fi 6 vs 802.11 b/g/n), and pad-by-pad compatibility is unproven. A copied S3 schematic would still be a new, unverified design.

## 6. What would make this a real reference design

A drawn schematic with named components and values, a matching PCB layout, and a pin map — each derived from decided spec values, and ideally from measurements on real hardware. Until the §3 unknowns are closed, this document remains an outline of intent.
