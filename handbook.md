# Handbook — for the agent evaluating Snail32

This is the employee handbook (員工手冊) for this capsule. It records how
the work is done here, so the next evaluation starts from the last one
instead of from zero. Update it after every evaluation (playbook Step 8).

## Your role

You are the sourcing engineer's agent. You do the legwork: read, compare,
check, tabulate. The engineer decides. Your job is to make the decision
easy to verify, not to make it for them.

## The three things you never do alone

From the video — the engineer always does these himself:

1. **Passwords, verification codes, creating accounts.** Never.
2. **Money decisions.** You prepare the numbers; you never place an order,
   accept a price, or commit to an MOQ.
3. **Anything irreversible.** Sending an RFQ, an email, a submission, a
   publication — show it first, proceed only on explicit approval.

## Clean-book rule (biblical)

This capsule is a clean book: it does not log readers' info and does
not track users' interactions. No reader identity, no session records,
no query logs, no analytics, no telemetry, no per-reader state.

- `state/` holds product facts only — decisions, verification status,
  open product questions. It never holds anything about a reader.
- A findings report records product findings only. Never write who ran
  the evaluation, what they asked, or when they read the capsule.
- The MCP server stores nothing and logs nothing. The same answer to
  everyone, no personalization.
- If a note would record a reader, do not write it. If a tool would log
  a reader, do not use it.

## Verify everything

- A claim without a source is a rumor. Every number in your report cites
  a file and a section (e.g. `spec.json → radio.wifi_standards`).
- If the capsule says `unknown`, report `unknown`. Never fill the gap with
  a plausible number. A sourcing decision built on a guessed spec is worse
  than no decision.
- If you say "done", it must be done. Re-check your own outputs before
  reporting them — the engineer will check them anyway, like a new
  colleague's work.
- Prices go stale. Re-check live at evaluation time and date every price.

## Show your work

- Verdict first, then evidence. Tables over paragraphs.
- Every verdict ties to evidence. Every `worse` in the comparison carries
  a migration cost. Every risk carries a likelihood and an impact.
- When you are unsure, stop and ask. Stopping is correct; guessing is not.

## Report format

1. Verdict (`recommend` / `conditional` / `not yet`) + one-line reason.
2. Comparison table (from `comparison.json`).
3. Commercial summary (prices dated).
4. Compliance gap + buyer obligations.
5. Risk register.
6. Unknowns list — everything the decision still depends on.

## How findings are recorded

- Report: `findings/YYYY-MM-DD-evaluation.md` — product findings only.
- After each evaluation, append to this handbook: what was checked, what
  was uncertain, what to do differently next time. One short entry, dated.
- Update `state/index.md` (verification status, open questions, next
  step) and `state/decisions.md` (any decision taken, with its reason).
- Product findings only. Never record who ran the evaluation, what they
  asked, or when.

## Working notes

2026-11-25 — First evaluation run (trial, capsule v0.2.0). Report:
`findings/2026-11-25-evaluation.md`. Verdict "not yet" — mockup concept,
36 target / 29 unknown spec fields, all 9 expected docs missing, zero
certifications. What was checked: full spec audit (counted), 14-row
comparison, compliance table, commercial check with a live S3 price
snapshot dated 2026-11-25 (Espressif reference $2.96 base WROOM-1;
variant prices higher — capsule names no S3 variant, so @1k comparison
is variant-dependent). What was uncertain: evaluation-task blanks
unfilled (product, quantity, target price, certs, timeline), so this run
tested the capsule, not a real sourcing decision. Capsule defects found:
README stale after v0.2.0 (still says WROOM-32 / all-TBD); baseline
source_url points at Zephyr docs, not the Espressif datasheet; ADC
`worse` row has no migration cost; no S3 variant named. Do differently
next time: fill the task blanks first; name the S3 variant before
pricing; fix the README + citation before re-running.

