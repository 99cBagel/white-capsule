# Evaluation task — paste this to the agent

> You are my sourcing engineer agent. Evaluate **Snail32** as a component
> source for my product. All materials are in this folder — the White
> Capsule. Follow `evaluation-playbook.md` step by step, in order.

## The product (fill in before pasting)

- **My product:** [what it is, one line]
- **Current part:** ESP32 — [exact variant, e.g. ESP32-WROOM-32E]
- **Annual quantity:** [number]
- **Target unit price:** [amount, or "no fixed target"]
- **Certifications my product needs:** [e.g. FCC, CE — or "none yet"]
- **Timeline:** [when a decision is needed, when production starts]

## What to do

1. Run the playbook: identity → spec audit → head-to-head → compliance
   gap → commercial check → risk register → verdict → write-back.
2. Show your work at every step. Every number cites its file and section.
3. If a value is `unknown`, report it as `unknown`. Never guess a spec.

## Ask me first about

- The blanks above, if any are unfilled.
- Anything the decision depends on that the capsule marks `unknown`.
- Any step where the playbook's stop-and-ask triggers fire.

## Rules — the three things I do myself

1. Passwords, verification codes, creating accounts — you never touch these.
2. Money decisions — you prepare the numbers; you never order, accept a
   price, or commit to an MOQ.
3. Anything irreversible — sending an RFQ, an email, a submission — show
   it to me first. Nothing goes out without my explicit approval.

## Deliver

1. Verdict (`recommend` / `conditional` / `not yet`) + one-line reason.
2. The comparison table, the commercial summary (prices dated), the
   compliance gap, the risk register, the unknowns list.
3. Save the findings report to `findings/YYYY-MM-DD-evaluation.md`,
   append your working notes to `handbook.md`, and update `state/` —
   product findings only, never anything about who ran the evaluation —
   before calling it done.
