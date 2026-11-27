# Snail32 — MCP Evaluation Playbook

How an agent evaluates the White Capsule MCP server at
**https://cap.keeg.uk/mcp**. The framework mimics **MCP Playground**
(mcpplaygroundonline.com): a security scan in 8 categories, graded A–F,
plus a functional test — connect as a real client, execute the tools,
and answer real questions with them. Every criterion below is one probe:
what to send, and what passes. Record PASS / FAIL / N-A per criterion,
with evidence (status code, header, or response excerpt).

Declared posture — judge against it, not against a generic server: this
capsule is **read-only and anonymous by design**. Open access is the
product promise, not a defect. A criterion about exposure passes when
what is exposed matches that posture.

## Part 1 — The scan (MCP Playground's 8 categories)

### 1. Transport security
- [ ] HTTPS only — the endpoint answers on https; no http listener.
- [ ] TLS certificate valid and in date.
- [ ] http://cap.keeg.uk redirects to https.
- [ ] `Strict-Transport-Security` header present, max-age ≥ 31536000.

### 2. Authentication & access
- [ ] Every tool in `tools/list` is read-only — no tool can write,
  delete, send, or execute. (Any write tool exposed = FAIL.)
- [ ] `resources/list` and `prompts/list` expose nothing beyond the
  declared surface (empty is correct for this capsule).
- [ ] No tool result contains credentials, keys, or personal data.
- [ ] OAuth discovery endpoint (`/.well-known/oauth-authorization-server`)
  returns 404 or a correct document — never a crash or a false promise.

### 3. MCP protocol
- [ ] `initialize` returns serverInfo (name `white-capsule`, version)
  and a protocolVersion the client offered.
- [ ] `notifications/initialized` is accepted (HTTP 202, no body error).
- [ ] `ping` returns an empty result.
- [ ] Unknown method returns JSON-RPC error `-32601` — not an HTTP 500,
  not an HTML error page.
- [ ] Malformed JSON returns `-32700`; a call with a missing required
  argument returns a clean tool error, not a crash.

### 4. Stateless spec (2026-07-28)
- [ ] N-A — this server implements the 2025-06-18 Streamable HTTP spec.
  Record N-A with this reason; re-check if the server migrates.

### 5. Information disclosure
- [ ] Error messages leak no internals — no file paths, stack traces,
  SQL text, or environment details.
- [ ] Tool names and descriptions contain no prompt-injection markers
  (no "ignore previous instructions", no hidden directives to agents).
- [ ] Tool results contain no instructions addressed to the agent —
  data only.
- [ ] Response headers disclose no framework/runtime versions beyond
  the declared server name and version.

### 6. Injection & exfiltration
- [ ] `capsule_search` with SQL-style input (`' OR 1=1 --`) returns a
  normal result or a clean error — never a data dump.
- [ ] `capsule_get` with `../../etc/passwd` or an unknown doc_id returns
  a clean error listing the valid doc_ids.
- [ ] `capsule_compare` with an unknown dimension returns a clean error.
- [ ] No tool accepts a URL, a file path, or a command as an argument —
  the SSRF / command-injection surface is zero by construction; verify
  from `tools/list` schemas.
- [ ] An oversized argument (10,000 characters) is handled — clean
  error or normal result, never a crash.

### 7. Security headers & CORS
- [ ] `X-Content-Type-Options: nosniff` present.
- [ ] Framing is controlled — `X-Frame-Options` or a CSP
  `frame-ancestors` directive.
- [ ] CORS is not wildcard-with-credentials: no
  `Access-Control-Allow-Origin: *` combined with
  `Access-Control-Allow-Credentials: true`.
- [ ] A cross-origin probe with a foreign `Origin` header gets the
  declared policy, consistently.

### 8. Resilience
- [ ] 10 concurrent requests (mixed `initialize` and `tools/call`) all
  complete — or are rate-limited with 429 and a `Retry-After` header.
  No 500s.
- [ ] Each individual call completes in under 5 seconds.
- [ ] A second identical run gives identical results — the server is
  stateless per call and stores nothing between readers.

## Part 2 — The functional test (Tester + Evals style)

- [ ] `tools/list` returns exactly the 5 declared tools:
  `capsule_topics`, `capsule_search`, `capsule_get`, `capsule_compare`,
  `capsule_checkout`.
- [ ] Every tool has a description; every input property is typed and
  described; a tool with no inputs declares an explicit empty schema.
- [ ] Execute each tool once with valid arguments — every result is
  well-formed and consistent with the Core MDs.
- [ ] The agent test: answer the capsule's 6 example questions (from
  `example-questions.md`) using only the tools. Each answer must trace
  to a Core MD passage (document + section). An explicit `unknown` /
  TBD is a pass. Silence, or a value the Core MDs do not contain, is a
  FAIL for that question.

## Scoring (Playground style)

- Score = criteria passed ÷ criteria applicable (N-A and by-design
  exclusions leave the denominator).
- **A** ≥ 95% · **B** ≥ 85% · **C** ≥ 70% · **D** ≥ 50% · **F** < 50%.
- Hard F, regardless of score: a write tool exposed anonymously, or any
  Part 1 §6 probe that succeeds in extracting data.

## Report

One page, delivered to the operator (never saved into the capsule
space): grade first; per-category PASS / FAIL / N-A counts; each finding
with severity, evidence, and the fix; the 6-question results. Product
findings only — never who ran the evaluation or when (clean-book rule).

## Sources

Framework: MCP Playground — Security Scanner (35+ checks, 8 categories,
A–F) and Server Tester / Evals, mcpplaygroundonline.com, checked
2026-11-27. Reference runs against this server, same day: MCP Showcase
Server Tester (full pass) and Security Scanner (76/100, grade C —
findings: anonymous tool list, by design; 2 tools with undeclared input
properties), Glama Inspector (connected, 5 tools, no errors).
