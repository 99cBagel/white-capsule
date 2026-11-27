# Snail32 — Evaluation Handbook

**Evaluation by application.** This handbook is aligned with the
capsule's Reference Designs (`capsules/snail32-reference-designs.md`):
each design is a test case. For every design, Snail32 is compared
against the ESP32 incumbent that design is copied from, on exactly
**3 criteria** — the three things that decide that application.

Each criterion is scored one of four ways:

- **Ahead** — Snail32's *target* beats the incumbent's *measured* value
  (a target is a claim; it scores Ahead on paper only)
- **Level** — target matches the incumbent's proven capability
- **Behind** — the incumbent does it today; Snail32 cannot, or has not
  specified it
- **Unproven** — the deciding fact is TBD; the criterion cannot be
  scored until evidence exists

The incumbent's side is always real and shipping. Snail32's side is
targets and TBDs — so a design score of "0 Ahead on evidence" is the
expected result today, and any criterion flips only on new evidence (a
specification, a measurement, a working demo), never on a claim.

## RD-1 — Webcam · Snail32 + onboard cam vs ESP32-S3-EYE

| # | Criterion | Snail32 | ESP32 incumbent | Score |
| --- | --- | --- | --- | --- |
| 1 | Camera path — sensor interface, resolution, frame rate | Camera interface **TBD** — not specified | DVP camera, OV2640 2 MP, streaming today | Unproven |
| 2 | Vision memory & processing — frame buffers, on-device detection | 8 MB PSRAM (target); vision framework TBD | 8 MB PSRAM; ESP-WHO face detection/recognition running | Behind |
| 3 | Streaming link — Wi-Fi throughput for live video | Wi-Fi 6 (target); RF figures TBD | Wi-Fi 4, proven in the product | Unproven |

## RD-2 — Drone control · Snail32 + drone vs ESP-Drone

| # | Criterion | Snail32 | ESP32 incumbent | Score |
| --- | --- | --- | --- | --- |
| 1 | Motor drive — PWM channels for 4 motors + update rate | PWM channel count **TBD** | 4 brushed motors driven, flying today | Unproven |
| 2 | Flight stack — IMU interface, control loop, proven firmware | I2C/SPI (target); no flight firmware exists | MPU6050 IMU; Crazyflie-derived stack, Stabilize / Height-hold / Position-hold | Behind |
| 3 | Power in flight — active current → flight time | Active current **TBD** — flight time cannot be estimated | Flies on its documented power budget | Unproven |

## RD-3 — Robotic arm · Snail32 + arm vs ESP32 + PCA9685 pattern

| # | Criterion | Snail32 | ESP32 incumbent | Score |
| --- | --- | --- | --- | --- |
| 1 | Servo drive path — native PWM, or PCA9685 over I2C | 2× I2C (target) — the PCA9685 path works on paper; native PWM count TBD | PCA9685 pattern proven in many builds | Level |
| 2 | Control link — operator UI over Wi-Fi / Bluetooth | Wi-Fi 6 + BT 5.3 LE (targets) | Wi-Fi 4 web UI, proven | Ahead (on paper) |
| 3 | I/O for sensors & encoders — GPIO count, I/O voltage | 48 GPIO (target); I/O voltage **TBD** | GPIO and 3.3 V levels documented | Unproven |

## RD-4 — Sensor meter · Snail32 + sensor node vs ESP32 + BME280 pattern

| # | Criterion | Snail32 | ESP32 incumbent | Score |
| --- | --- | --- | --- | --- |
| 1 | Sleep current → battery life | Deep sleep **5 µA (target)**; light sleep TBD | Deep sleep 7 µA (measured, typ) | Ahead (on paper) |
| 2 | Sensor bus & wake — I2C sensors, wake sources | 2× I2C (target); wake sources **TBD** | I2C + full wake-source set, proven in battery nodes | Unproven |
| 3 | Reporting link — MQTT / low-power peer link | Wi-Fi 6 (target); **no ESP-NOW equivalent specified** | MQTT over Wi-Fi and ESP-NOW both running today | Behind |

## RD-5 — Smart display · Snail32 + HMI vs ESP32-S3-LCD-EV-Board

| # | Criterion | Snail32 | ESP32 incumbent | Score |
| --- | --- | --- | --- | --- |
| 1 | Display interface — LCD bus, resolution, refresh | LCD interface **TBD** — not specified | RGB / 8080 / SPI interfaces; 480×480 panel driven today | Unproven |
| 2 | Touch input — capacitive channels | Touch **TBD** — not specified | FT5x06 touch on the flagship panel; on-chip touch channels | Behind |
| 3 | Graphics stack — UI framework on the SDK | Framework TBD — the SDK itself is unproven | LVGL supported and shipping in products | Behind |

## Summary sheet

| Design | Ahead | Level | Behind | Unproven |
| --- | --- | --- | --- | --- |
| RD-1 Webcam | 0 | 0 | 1 | 2 |
| RD-2 Drone control | 0 | 0 | 1 | 2 |
| RD-3 Robotic arm | 1 | 1 | 0 | 1 |
| RD-4 Sensor meter | 1 | 0 | 1 | 1 |
| RD-5 Smart display | 0 | 0 | 2 | 1 |
| **Total (15 criteria)** | **2** | **1** | **5** | **7** |

**Reading the sheet:** Snail32 leads nowhere on evidence. Its two
"Ahead" scores are paper leads — a deep-sleep target below the
incumbent's measured figure, and newer radio standards as targets.
Seven criteria cannot be scored at all because the deciding fact is
TBD: the camera interface, the LCD interface, touch, PWM count, active
current, wake sources. Those TBDs — listed per design in the Reference
Designs document — are the evaluation's real output: they are the
specifications Snail32 owes before any design can be scored on merit.
