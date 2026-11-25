# Snail32 — Sourcing Evaluation Playbook

The steps a sourcing engineer (and their agent) run to evaluate Snail32
as a component source. Work in order. Show your work at every step. Stop
at the triggers — do not work around them.

## Step 0 — Setup

- **Input:** this folder, dropped into the agent's working folder.
- **Task:** paste `evaluation-task.md`, fill in the blanks (product,
  quantity, target price, certification needs, timeline).
- **Ask first:** the task lists what to ask the engineer before starting.
  Nothing moves until those are answered.
- **Read the product's memory first:** `state/index.md` and
  `state/decisions.md` — what was verified, what is still unknown, what
  was decided and why. This is the capsule's memory of the product, not
  of any reader. There is no reader memory; the clean-book rule forbids it.
- **Output:** a short statement of the evaluation question, in one sentence.

## Step 1 — Identity

- **Input:** `capsule.json`, `spec.json` (identity), `README.md`.
- **Do:** What is Snail32, in one paragraph? What does it claim to replace
  (ESP32 — which variant)? Is it pin-compatible (drop-in) or a redesign?
- **Pass:** the identity paragraph is written and the compatibility claim
  is stated with its source.
- **Stop and ask:** if the compatibility claim has no source.

## Step 2 — Spec audit

- **Input:** `spec.json`, `docs/` (datasheet, test reports).
- **Do:** walk every field. Each value must carry a status and a source.
  `verified` = source cited. `claimed` = manufacturer claim, no evidence.
  `target` = design goal. `unknown` = gap.
- **Output:** an audit table — field, value, status, source. Every
  `unknown` goes onto the unknowns list. Nothing is filled in by guessing.
- **Pass:** zero values without a status. Zero invented numbers.
- **Stop and ask:** if a value the decision depends on is `unknown`.

## Step 3 — Head-to-head vs ESP32

- **Input:** `comparison.json`.
- **Do:** fill the Snail32 side from Step 2, then set a verdict per row
  (`better` / `same` / `worse` / `unknown`) and a migration note: what
  breaks when moving from ESP32 — pinout, SDK, power, RF, code porting.
- **Output:** the completed comparison table.
- **Pass:** every row has a verdict; every `worse` has a migration cost
  attached (time, money, or risk).
- **Stop and ask:** if the ESP32 baseline variant is wrong for the
  engineer's product (see the open decision in `comparison.json`).

## Step 4 — Compliance gap

- **Input:** `compliance.md`.
- **Do:** certified vs planned vs unknown. What must the buyer still do
  (host-device certification, testing), and what does it cost in time
  and money?
- **Output:** a gap list with buyer obligations.
- **Pass:** no certification claimed without a certificate number.

## Step 5 — Commercial check

- **Input:** `sourcing.json`.
- **Do:** price ladder vs the incumbent (re-check live — never trust a
  frozen price), MOQ, lead time, stock, distributors, samples, lifecycle
  and EOL policy. Total cost = unit price + migration cost + certification
  cost + risk.
- **Output:** a commercial summary with dates on every price.
- **Pass:** every price carries a date and a status.
- **Stop and ask:** before any contact with a distributor or supplier
  (that is an outward message — approval first), and before any money
  decision.

## Step 6 — Risk register

- **Do:** list risks with likelihood, impact, and mitigation: single-source
  risk, company viability, roadmap slip, certification timeline, support
  quality, pin-compatibility risk, SDK maturity.
- **Output:** a risk table. Unknowns from Step 2 are risks too.
- **Pass:** every risk has a named owner or a named unknown.

## Step 7 — Verdict

- **Do:** one verdict — `recommend` / `conditional` / `not yet` — with
  reasons tied to evidence (file + section for each reason), and a
  confidence note (what would change the verdict).
- **Output:** the verdict, the comparison table, the risk register, the
  unknowns list. Verdict first, evidence after.
- **Pass:** the verdict can be checked in one look by the engineer.

## Step 8 — Write-back (the video's step 4)

- **Do:** save the findings report to `findings/YYYY-MM-DD-evaluation.md`
  (product findings only). Append working notes to `handbook.md`: what
  was checked, what was uncertain, what to do differently next time.
  Update `state/index.md` and `state/decisions.md` with what changed
  about the product. This is the employee handbook — the next evaluation
  starts from it.
- **Clean-book rule:** write back product findings only. Never record who
  ran the evaluation, what they asked, or when they read the capsule.
  If a note would record a reader, do not write it.
- **Pass:** the report, the handbook update, and the state update are all
  saved before the task is called done.

## Stop-and-ask triggers (any step)

- Passwords, verification codes, creating accounts.
- Any money decision: order, price acceptance, MOQ commitment.
- Any irreversible send: RFQ, email, submission, publication.
- Any contact with a supplier, distributor, or certifier.
- Any value the decision depends on that is `unknown`.

When a trigger fires: stop, show what you have, ask. Do not proceed on
your own judgment.

## Clean-book check (before any version bump)

Run this before the capsule version moves. Every item must pass.

- [ ] No logging code in the capsule or the MCP server.
- [ ] No analytics, no telemetry, no cookies.
- [ ] No per-reader state anywhere — no reader identity, no session
  records, no query logs, no usage counters (not even in aggregate).
- [ ] `state/` holds product facts only.
- [ ] Findings reports record product findings only.
- [ ] The MCP spec still says: read-only, stores nothing, logs nothing,
  same answer to everyone.
