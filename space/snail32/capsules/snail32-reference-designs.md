# Snail32 — Reference Designs (Draft)

> **DRAFT — CONCEPT DOCUMENT: Snail32 Reference Designs.** Snail32 is a concept-stage board; no silicon exists yet. Each design below is a concept adaptation of a real, named ESP32 application: the **reference** side is real, shipping or published, and sourced in §7. The **Snail32** side is target-level and unproven — a design being listed here does not mean the hardware exists, that any Snail32 value has been measured, or that the reference firmware ports over. Every Snail32 dependency that is still TBD in the capsule spec is flagged in the design's Status line.

**Status words used in this document**

- **Target** — a Snail32 design goal from the datasheet. Not a measurement. Never quote as a spec.
- **TBD — not yet specified** — not yet decided or measured. A gap, not a zero.
- **Pattern** — an application shape repeated across many public ESP32 projects, not one named product.

All five designs also share two concept-level caveats: the S3-WROOM-1 footprint / pin-compatibility claim is a target, not proven (see the draft pinout document), and ESP32 code portability rests on an ESP-IDF API-compatible layer that is itself a target and unproven (spec: software).

## RD-1 — Snail32 + onboard cam

- **Reference: ESP32-S3-EYE (Espressif).** A small AI development board built on the ESP32-S3 SoC and Espressif's ESP-WHO image-processing framework. It integrates a 2-megapixel OV2640 camera, a digital I2S MEMS microphone, an LCD sub-board, a microSD slot, 8 MB octal PSRAM and 8 MB flash, and streams images over Wi-Fi. ESP-WHO runs face detection, face recognition, pedestrian detection and QR recognition on-device. Espressif's own named applications: smart doorbell, surveillance systems, facial-recognition time clock. It is the proven shape of "camera + AI + Wi-Fi on one small board."
- **Snail32 design.** A camera module connects to the Snail32 camera interface; the module buffers frames in PSRAM, runs detection/recognition locally, shows results on a small LCD or streams them over Wi-Fi, and takes voice input from an I2S microphone. The user gets a self-contained smart camera — doorbell, attendance clock, or room monitor — with no cloud round-trip for the vision work.
- **Exercises** (spec targets): PSRAM 8 MB and SRAM 768 KB (frame buffering and inference), Wi-Fi 6 802.11ax (streaming), USB OTG (debug/console), I2S ×2 (microphone), GPIO 48.
- **Status: concept adaptation — blocked on a TBD.** The camera interface itself is **TBD** in the Snail32 spec (the datasheet lists it as not yet specified), and the LCD interface is likewise TBD. Until both are defined, this design is a block diagram, not a buildable reference.

## RD-2 — Snail32 + drone control

- **Reference: ESP-Drone (Espressif).** An open-source mini-quadcopter solution whose flight code is ported from the Bitcraze Crazyflie project (GPL-3.0). Note the chip attribution: the project supports ESP32, ESP32-S2 and ESP32-S3 targets, but the documented reference hardware — the ESP32-S2-Drone V1.2 main board — is built around an **ESP32-S2-WROVER** module plus an MPU6050 IMU, not an ESP32-S3. It flies Stabilize, Height-hold and Position-hold modes (extension boards add barometer, time-of-flight and optical-flow sensors for the hold modes), drives four small brushed motors, and is controlled over Wi-Fi from a mobile app or gamepad. Espressif positions it for STEAM education; support has been limited since December 2022.
- **Snail32 design.** The module is the flight controller: it reads an IMU over I2C, runs the stabilisation loop on one core, drives the four motor outputs, monitors battery voltage on an ADC channel, and keeps the Wi-Fi link to the app or gamepad on the other core. The user gets a small Wi-Fi quadcopter whose whole flight stack — sensing, control, comms — sits on one module.
- **Exercises** (spec targets): I2C ×2 (IMU and hold-mode sensors), SPI ×4 (additional sensors), ADC 12-bit / 16 ch (battery monitoring), GPIO 48, RISC-V dual-core 320 MHz (control loop + comms split), Wi-Fi 6 802.11ax (control link).
- **Status: concept adaptation — blocked on TBDs.** PWM channel count is **TBD** in the spec, and motor drive is nothing without it. Active current is also TBD, so flight time cannot even be estimated. Flight control is the least forgiving design in this set: it needs hard real-time behaviour from a software stack that does not exist yet.

## RD-3 — Snail32 + robotic arm

- **Reference: pattern, not a product.** The repeated public shape is: an ESP32 drives a PCA9685 16-channel PWM controller over I2C; the PCA9685 generates the servo signals for a 4–6 joint arm plus gripper; the servos draw power from a separate supply through the driver board, never from the MCU board; and the ESP32 hosts a web interface for joint control. A named exemplar build is OmArm Zero — a 3D-printed 5-joint arm plus gripper (MG996R and SG90 servos on PCA9685 channels), controlled from a browser over Wi-Fi with the interface served from the chip's flash. Stated plainly: there is no single "the ESP32 robotic arm" product; this is a well-worn project pattern.
- **Snail32 design.** The module talks I2C to the servo driver, serves the control page over Wi-Fi (sliders, saved poses, sequences), and optionally reads joint or gripper sensors back over ADC or a second I2C bus. The user gets a desktop arm they can drive, teach poses to, and script from any browser — a pick-and-place and STEM-demo workhorse.
- **Exercises** (spec targets): I2C ×2 (servo driver, sensors), Wi-Fi 6 802.11ax (control UI), ADC 12-bit / 16 ch (feedback), GPIO 48, USB OTG (setup and serial control).
- **Status: concept adaptation.** The most forgiving design here — the servo timing lives in the external driver, so it does not depend on Snail32's own PWM. Remaining flags: PWM channels **TBD** (only matters for a direct-drive variant), and I/O voltage **TBD**, which the I2C level-matching to the driver board depends on.

## RD-4 — Snail32 + sensor meter

- **Reference: pattern, not a product.** The canonical ESP32 metering node: a BME280-class environmental sensor (temperature, humidity, pressure) on I2C; the node wakes on a timer, takes a reading, publishes it — over MQTT to a broker such as the one in Home Assistant, or over ESP-NOW to an always-on gateway that republishes to MQTT — then returns to deep sleep on battery. Published builds repeat the same shape down to the parts: 18650/LiPo cell, charger board, battery voltage read back through an ADC divider and reported with the reading. Stated plainly: this is the most-copied ESP32 application pattern there is, not a named product.
- **Snail32 design.** The module is the whole node: sensor on I2C, battery on an ADC channel, Wi-Fi (or Bluetooth LE) for the report, deep sleep between cycles. The user gets a place-anywhere meter — room climate, greenhouse, cold storage — that reports for months per charge and shows up in their home-automation dashboard like any other sensor.
- **Exercises** (spec targets): I2C ×2 (sensor), ADC 12-bit / 16 ch (battery metering), deep sleep 5 µA, supply 3.0–3.6 V, Wi-Fi 6 802.11ax and Bluetooth 5.3 LE (reporting), RTC SRAM 16 KB (state across sleeps).
- **Status: concept adaptation — battery life unprovable today.** The design lives or dies on sleep behaviour, and only the deep-sleep figure exists, as a target. Light-sleep current, active current and wake sources are all **TBD**, so no battery-life number can be stated — any runtime claim for this design would be invented.

## RD-5 — Snail32 + smart display (HMI)

- **Reference: ESP32-S3-LCD-EV-Board (Espressif).** Espressif's HMI evaluation board: an ESP32-S3-WROOM-1 mainboard (16 MB flash, 8 MB PSRAM) plus swappable LCD sub-boards. The flagship configuration is a 3.95-inch 480×480 RGB touchscreen (GC9503CV driver, FT5x06 capacitive touch); an 800×480 variant exists, and the mainboard supports I2C, SPI, 8080 and RGB display interfaces. LVGL lists it as a supported board, and Espressif's named applications are smart central-control screens, 86-type wall switch panels, appliance control panels, EV dashboards and video doorbells.
- **Snail32 design.** The module drives a touchscreen panel — frame buffer in PSRAM, touch controller on I2C — renders the UI locally, and uses Wi-Fi / Bluetooth to talk to the devices the panel controls. The user gets a wall panel or appliance front panel: thermostat, lighting console, machine control screen — one module behind the glass.
- **Exercises** (spec targets): PSRAM 8 MB (frame buffer), SPI ×4 and I2C ×2 (display and touch), GPIO 48, Wi-Fi 6 802.11ax and Bluetooth 5.3 LE (device links), USB OTG (setup).
- **Status: concept adaptation — blocked on TBDs.** The LCD interface is **TBD** in the Snail32 spec and the touch sensor entry is **TBD** as well. The reference design's whole point is its display interfaces; until Snail32 defines its own, RD-5 is an application sketch, not a reference design.

## 6. Summary

| Design | Reference | Reference kind | Key Snail32 TBD blockers |
| --- | --- | --- | --- |
| RD-1 Onboard cam | ESP32-S3-EYE (Espressif) | Named product | Camera interface, LCD interface |
| RD-2 Drone control | ESP-Drone (Espressif; reference board is ESP32-S2) | Named project | PWM channels, active current |
| RD-3 Robotic arm | ESP32 + PCA9685 arm pattern (exemplar: OmArm Zero) | Pattern | PWM channels (direct-drive only), I/O voltage |
| RD-4 Sensor meter | ESP32 + BME280 MQTT / ESP-NOW node pattern | Pattern | Light-sleep and active current, wake sources |
| RD-5 Smart display | ESP32-S3-LCD-EV-Board (Espressif) | Named product | LCD interface, touch sensor |

## 7. Sources

Reference applications (verified 2026-11-27):

- ESP32-S3-EYE — Espressif board guide (camera, microphone, PSRAM/flash, ESP-WHO, named applications): https://docs.espressif.com/projects/esp-board-manager/en/latest/references/boards/esp32_s3_eye.html
- ESP-WHO framework overview (Espressif developer portal): https://developer.espressif.com/blog/2026/05/esp-who-get-started/
- ESP-Drone — Espressif documentation (chips supported, Crazyflie port, flight modes, support policy): https://docs.espressif.com/projects/espressif-esp-drone/en/latest/index.html
- ESP-Drone — source repository (ESP32-S2-Drone hardware, GPL-3.0): https://github.com/espressif/esp-drone
- Robotic-arm pattern — OmArm Zero build guide (ESP32 + PCA9685 + servos, browser control): https://omartronics.com/omarm-zero-build-5-dof-robotic-arm-esp32-web-control/
- Robotic-arm pattern — multi-servo PCA9685 control tutorial (Robojax): https://robojax.com/tutorial_view.php?id=365&lang=zu
- Sensor-meter pattern — ESP32 + BME280 weather station over MQTT with deep sleep: https://www.esp32diy.com/en/du-an/tram-thoi-tiet-mqtt
- Sensor-meter pattern — ESP-NOW sensor nodes with MQTT gateway (ShillehTek): https://shillehtek.com/blogs/news/esp32-bme280-esp-now-mqtt-home-assistant
- ESP32-S3-LCD-EV-Board — Espressif user guide (display sub-boards, interfaces, module fitted): https://docs.espressif.com/projects/esp-dev-kits/en/latest/esp32s3/esp32-s3-lcd-ev-board/user_guide_v1.4.html
- ESP32-S3-LCD-EV-Board — LVGL supported-boards listing (resolution, touch): https://lvgl.io/boards

Snail32 side: the Core MD documents in this folder — the datasheet (targets/TBD) and the pinout (status language and the footprint caveat).
