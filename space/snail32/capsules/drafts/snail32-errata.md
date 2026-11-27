# Snail32 — Errata (Draft)

> **DRAFT — CONCEPT DOCUMENT: Snail32 Errata.** Snail32 is a concept-stage board; no silicon exists yet. Every value below is a design target or TBD, taken from the capsule's spec — not a measurement, not verified, unless a value is explicitly marked verified with its named source.

## 1. Errata items

**None. This list is empty, and it could not be otherwise: no Snail32 silicon exists, no board has been built, and nothing has been observed failing.**

An empty errata at this stage must not be read as a clean bill of health. It records the absence of hardware, not the absence of problems. Errata are discovered by building and testing silicon; a concept that exists only as design targets has had no opportunity to produce any.

| Field | Value |
| --- | --- |
| Product revision covered | TBD — not yet specified (no revision exists) |
| Errata items | 0 |
| Date of last item | — (no items) |

## 2. What this document will track

Once hardware exists, each errata entry will record:

- A unique ID and a short title.
- The silicon / board revision(s) affected.
- What the device actually does, against what the spec says it should do.
- How the problem was observed (test, measurement, or field report) — with the source named.
- Severity and the effect on a design using the part.
- A workaround, if one exists, or an explicit "no workaround."
- Status: open, fixed in a later revision (named), or will-not-fix.

An entry may only be created from behaviour observed on real hardware. Nothing may be entered from speculation, and no entry may be removed once published — it is closed by a status change, so the history stays visible.

## 3. Current known-unknowns (not errata)

The capsule spec carries open unknowns. They are listed here because they are the places problems are most likely to be found once hardware exists — but they are **not errata entries**, and must not be quoted as known defects or as known-good areas. Each is TBD — not yet specified in the spec:

- **Power behaviour** — active current and light-sleep current are unspecified; only the deep-sleep figure exists, and it is a target (5 µA), not a measurement.
- **RF behaviour** — TX power, RX sensitivity, Wi-Fi maximum data rate, and the antenna approach are all unspecified and unmeasured.
- **Pin compatibility** — the S3-WROOM-1 footprint-compatibility claim is a target that cannot be checked until a pin map exists; the usable-GPIO count is also unspecified.
- **Peripheral completeness** — DAC, PWM channel count, SDIO, Ethernet, and touch are unspecified; whether they exist at all is undecided.
- **Electrical robustness** — I/O voltage, ESD rating, and humidity rating are unspecified.
- **Security implementation** — secure boot and flash encryption are targets; crypto acceleration and eFuse/OTP behaviour are unspecified.
- **Software maturity** — the ESP-IDF API-compatible layer is a target and unproven; the toolchain is unspecified. Porting problems, when they appear, will be tracked in SDK release notes rather than here, unless they are caused by the hardware.

## 4. How this document changes

The first real revision of this errata will be written when the first silicon or board revision is tested. At that point this draft's §1 is replaced by the item table, the affected revision is named, and the DRAFT banner comes off only when every entry cites its observation source.
