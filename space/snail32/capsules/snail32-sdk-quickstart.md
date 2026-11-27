# Snail32 — SDK Quickstart (Draft)

> **DRAFT — CONCEPT DOCUMENT: Snail32 SDK Quickstart.** Snail32 is a concept-stage board; no silicon exists yet. This document is built around a reference flow that is real today: **ESP-IDF on the ESP32-S3**, as documented in Espressif's ESP-IDF Programming Guide. Each step states the reference step first, then the **Snail32 position**. Snail32's own toolchain is **TBD** — no Snail32 step below can be performed today, and no Snail32 tool name, version, or download is invented anywhere in this document.

## 1. Read this first

There is no Snail32 SDK to install yet. No toolchain has been named, no board exists to connect, and no code has been run on Snail32. What exists is the reference flow: an engineer can buy an ESP32-S3 board today and follow Espressif's documented path from install to a running `hello_world` in one sitting. Snail32's stated ambition is that porting from that flow should be cheap — via an **ESP-IDF API-compatible layer**, status **target, unproven**. This quickstart is organised so the gap between "documented and real" and "target" is visible at every step.

What the capsule spec states for Snail32 today, all as **targets**:

| Item | Value | Status |
| --- | --- | --- |
| SDK | FreeRTOS + Arduino | Target |
| RTOS | FreeRTOS | Target |
| ESP32 code portability | Via an ESP-IDF API-compatible layer — target, unproven | Target |
| OTA updates | Yes | Target |
| Programming / debug interface | Full-speed USB OTG + USB Serial/JTAG | Target |
| Toolchain | TBD — not yet specified | TBD |
| Languages | TBD — not yet specified | TBD |

Reference sources for the ESP32-S3 steps: ESP-IDF Programming Guide, "Get Started" for ESP32-S3 — toolchain setup for Linux/macOS: https://docs.espressif.com/projects/esp-idf/en/release-v5.1/esp32s3/get-started/linux-macos-setup.html — for Windows: https://docs.espressif.com/projects/esp-idf/en/release-v5.1/esp32s3/get-started/windows-setup.html

## 2. Step 0 — Get hardware

**Reference (ESP32-S3):** order an ESP32-S3 board or module from a distributor — the part is active and stocked (see the draft sample-program document). Connect it to the computer with a USB cable and note the serial port it enumerates as (COM ports on Windows).

**Snail32 position:** there is no hardware. Samples are not available: sample price, quantity, and ship date are all TBD in the datasheet's Ordering information, and its status is "unknown." Development-board features are likewise TBD — not yet specified. **Stop here today for Snail32**; the remaining steps describe the reference flow and what Snail32 would have to match.

## 3. Step 1 — Install the toolchain and ESP-IDF

**Reference (ESP32-S3):** the documented flow (Linux/macOS shown; Windows uses the ESP-IDF Tools Installer, which deploys Python, Git, cross-compilers, CMake, Ninja, OpenOCD, and ESP-IDF):

1. Install the prerequisites for your OS (Python, Git, CMake, Ninja, and the other packages the guide lists).
2. Get ESP-IDF: `git clone -b release/v5.1 --recursive https://github.com/espressif/esp-idf.git`
3. Install the tools for this chip: `cd ~/esp/esp-idf` then `./install.sh esp32s3`
4. Set up the environment in each new terminal: `. $HOME/esp/esp-idf/export.sh`

**Snail32 position:**

- Toolchain name: **TBD — not yet specified.** The spec names no compiler, IDE, version, download source, or host-OS support.
- The processor target is RISC-V dual-core, 32-bit, so a RISC-V toolchain is implied by the architecture — but which one, and packaged how, is undecided. ESP-IDF's Xtensa toolchain does not target Snail32.
- USB driver requirements for the Serial/JTAG interface: TBD — not yet specified.

## 4. Step 2 — Get the SDK and a first project

**Reference (ESP32-S3):** ESP-IDF *is* the SDK — the clone in Step 1 includes the libraries, components, and examples. The guide's first project is `get-started/hello_world`, copied from the ESP-IDF examples directory into your workspace. An Arduino core for the ESP32-S3 also exists as an alternative layer on top of ESP-IDF.

**Snail32 position:**

- The SDK target is stated as "FreeRTOS + Arduino": a FreeRTOS-based SDK (RTOS: FreeRTOS, target) with an Arduino layer.
- Distribution (repository, package, installer): TBD — not yet specified.
- Version: TBD — not yet specified.
- Example projects and templates: TBD — not yet specified.

## 5. Step 3 — Configure and build

**Reference (ESP32-S3):** in the project directory, set the chip target and configure, then build:

```
idf.py set-target esp32s3
idf.py menuconfig
idf.py build
```

The build compiles the application and all ESP-IDF components, then generates the bootloader, partition table, and application binaries.

**Snail32 position:**

- Project creation method (IDE wizard, command line, template copy): TBD — not yet specified.
- Board configuration (flash 8 MB, PSRAM 8 MB — both targets): the settings an engineer must select are TBD — not yet specified.
- The intended first milestone matches the reference: build a minimal project (blink an LED / print over serial) to prove toolchain, SDK, and board work together — the same "first blink" goal the capsule's expected dev-board guide describes.

## 6. Step 4 — Flash and monitor

**Reference (ESP32-S3):** with the board connected, flash and watch the output:

```
idf.py -p PORT flash
idf.py -p PORT monitor
```

(`PORT` is the board's serial port; the two combine as `idf.py -p PORT flash monitor`.) Debugging is available over the chip's JTAG interfaces, including the built-in USB Serial/JTAG controller, with the OpenOCD copy installed in Step 1.

**Snail32 position:**

- Interface: USB Serial/JTAG (target), part of the stated USB capability (full-speed USB OTG + USB Serial/JTAG).
- Flashing tool and command: TBD — not yet specified.
- Serial monitor tool and settings: TBD — not yet specified.
- Debug (breakpoints, JTAG) support and tooling: TBD — not yet specified.

## 7. Step 5 — Porting ESP32-S3 code to Snail32

This is the step to plan carefully; it is the concept's biggest software risk.

**Direct answer to "can I build Snail32 firmware with ESP-IDF, and how much of my ESP32-S3 codebase ports over unchanged?": no — not with ESP-IDF itself; and no share of an existing codebase can be promised to port unchanged.** How much would actually carry over depends on which APIs the compatibility layer covers and how closely it matches ESP-IDF behaviour — both undecided today — so any percentage would be invented. The honest planning assumption is that porting is real work until the layer exists and your specific components are tested against it.

- The reference processor is Xtensa and is programmed with ESP-IDF. Snail32's processor is RISC-V. **ESP-IDF does not run on Snail32** — the datasheet's comparison states it directly: "RISC-V means no ESP-IDF — code porting is the biggest migration cost."
- The bridge is a stated target: an **ESP-IDF API-compatible layer**, so existing ESP-IDF-style code could be ported against familiar APIs. Its status is **target — unproven**. No part of it has been demonstrated.
- Practical guidance today: budget the port as real work. Do not assume any ESP-IDF component, driver, or Arduino library works until the compatibility layer exists and the specific component is tested against it.

## 8. Step 6 — OTA updates

**Reference (ESP32-S3):** ESP-IDF includes OTA update support as part of the framework, working with the reference chip's secure boot and flash encryption features (see the draft datasheet, §7).

**Snail32 position:**

- OTA support is a **target** (yes, in the spec).
- Mechanism, image format, signing, and rollback behaviour: TBD — not yet specified. Secure boot and flash encryption are also targets, and how they interact with OTA is undecided.

## 9. Known unknowns for this quickstart

| Question | Status |
| --- | --- |
| Toolchain (name, version, source, host OS) | TBD — not yet specified |
| SDK distribution and version | TBD — not yet specified |
| Programming languages | TBD — not yet specified |
| USB drivers | TBD — not yet specified |
| Flashing / monitor / debug tools | TBD — not yet specified |
| Example projects | TBD — not yet specified |
| ESP-IDF API-compatible layer (scope, maturity) | Target — unproven |
| Hardware to run any of this on | Does not exist yet |

The reference column of this document can be executed today, exactly as written, on a purchased ESP32-S3 board. When a Snail32 toolchain and SDK are named and a board exists, the Snail32 column should be rewritten as imperative steps with versions — and every claim in it tested on the real board before this document is published without the DRAFT banner.
