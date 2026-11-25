// Landing page for cap.keeg.uk/ — Snail32 White Capsule.
// Source draft: landing-draft.html (VM only). Keep the two in step.
export const LANDING_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>White Capsule Service (Example Snail32 Board)</title>
<link rel="icon" href="/assets/favicon.ico" sizes="any">
<link rel="icon" type="image/svg+xml" href="/assets/white-capsule-logo.svg">
<link rel="icon" type="image/png" sizes="64x64" href="/assets/icon-64.png">
<link rel="icon" type="image/png" sizes="256x256" href="/assets/icon-256.png">
<link rel="apple-touch-icon" href="/assets/icon-256.png">
<meta name="description" content="Snail32 White Capsule — a concept microcontroller board. Connect an agent to the capsule MCP for spec, comparison, sourcing, and compliance data.">
<meta name="theme-color" content="#267cd1">
<meta property="og:type" content="website">
<meta property="og:url" content="https://cap.keeg.uk/">
<meta property="og:title" content="White Capsule Service (Example Snail32 Board)">
<meta property="og:description" content="Turning White Papers into Agent-Ready Knowledge">
<meta property="og:image" content="https://cap.keeg.uk/assets/logo-1024.png">
<style>
* { box-sizing: border-box; }
body { margin: 0; background: #f7fafc; color: #000; font-family: -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; line-height: 1.55; }
.page { max-width: 880px; margin: 0 auto; padding: 28px 22px 56px; }
.brand { display: flex; align-items: center; gap: 14px; }
.brand .logo { width: 120px; height: 120px; flex: none; }
.brand .logo img { width: 100%; height: 100%; display: block; }
.brand-name { font-size: 27px; font-weight: 700; color: #000; }
.cb { color: #267cd1; }
.brand-name .board { font-size: 19px; font-weight: 600; color: #267cd1; }
.slogan { font-style: italic; color: #000; margin-top: 2px; }
h1 { font-size: 21px; letter-spacing: 1.5px; color: #000; border-bottom: 2px solid #267cd1; padding-bottom: 8px; margin: 34px 0 10px; }
p { margin: 10px 0; }
ul { margin: 10px 0; padding-left: 22px; }
li { margin: 4px 0; }
.mockup { color: #8c8c8c; font-size: 14.5px; }
.connect-row { display: flex; gap: 10px; align-items: stretch; margin: 14px 0 4px; flex-wrap: wrap; }
.endpoint-text { font-style: italic; font-weight: 300; font-size: 17px; overflow-wrap: anywhere; }
button.small { font-size: 13px; font-weight: 600; padding: 4px 14px; min-height: 32px; border-radius: 6px; box-shadow: 0 2px 0 #1a5c96, 0 4px 8px rgba(0, 10, 18, 0.18); }
button.small:active, button.small.is-down { transform: translateY(3px); box-shadow: 0 0 0 #123f66, 0 1px 2px rgba(0, 10, 18, 0.18); transition: transform 0.05s ease, box-shadow 0.05s ease, background-color 0.05s ease; }
button { appearance: none; border: 0; border-radius: 8px; background: #267cd1; color: #fff; font-size: 16px; font-weight: 600; padding: 10px 22px; cursor: pointer; min-height: 44px; box-shadow: 0 3px 0 #1a5c96, 0 6px 12px rgba(0, 10, 18, 0.18); transition: transform 0.45s cubic-bezier(0.34, 1.8, 0.64, 1), box-shadow 0.25s ease, background-color 0.45s ease; }
button:active, button.is-down { background: #1a5c96; transform: translateY(4px); box-shadow: 0 0 0 #123f66, 0 2px 4px rgba(0, 10, 18, 0.18); transition: transform 0.05s ease, box-shadow 0.05s ease, background-color 0.05s ease; }
.videos a { color: #267cd1; text-decoration: none; font-weight: 600; }
.copied-note { display: none; color: #000; font-size: 14.5px; margin: 2px 0 10px; }
@media print { body { background: #fff; } button { display: none; } }
</style>
</head>
<body>
<div class="page">
<div class="brand">
<div class="logo"><img src="/assets/white-capsule-logo.svg" alt="White Capsule logo"></div>
<div>
<div class="brand-name">White Capsule Service <span class="board">( Example Snail32 Board )</span></div>
<div class="slogan">Turning White Papers into Agent-Ready Knowledge</div>
</div>
</div>

<h1>ABOUT <span class="cb">Snail32</span></h1>
<p>a concept microcontroller board — a RISC-V dual-core chip at 320 MHz with Wi-Fi 6 and Bluetooth 5.3 LE, in the same package and footprint as the ESP32-S3, with more economic value, and faster connection, and lower MOQ.</p>

<h1>WHY <span class="cb">White Capsule</span>?</h1>
<ul>
<li>Agentic component evaluation, concept-stage engineering, comparative benchmarking, BOM cost analysis</li>
<li>Agent-mediated anonymous access — zero footprint, no registration, no logging, no visit records retained</li>
</ul>

<h1>STEP 1. connect</h1>
<p>Open Agent and connect to this endpoint:</p>
<div class="connect-row">
<span class="endpoint-text">https://cap.keeg.uk/mcp</span>
<button id="copy-endpoint" type="button" class="small">COPY</button>
</div>
<p class="copied-note" id="note-endpoint">Endpoint URL copied to clipboard</p>
<p class="videos">Connect demo video:
<a href="https://snail-eyes.keeg.uk/media/assets/how-to-connect-meta-muse.mp4" target="_blank" rel="noopener">&#9654; Muse</a> &middot;
<a href="https://snail-eyes.keeg.uk/media/assets/how-to-connect-chatgpt.mp4" target="_blank" rel="noopener">&#9654; ChatGPT</a> &middot;
<a href="https://snail-eyes.keeg.uk/media/assets/how-to-connect-claude.mp4" target="_blank" rel="noopener">&#9654; Claude</a>
</p>

<h1>STEP 2. access Snail32 White Capsule</h1>
<div class="connect-row">
<button id="copy-try" type="button">TRY WITH AGENT</button>
</div>
<p class="copied-note" id="note-try">paste to chat box to start</p>

<script>
var TRY_TEXT = [
  "Connect to: https://cap.keeg.uk/mcp",
  "",
  "Explore the product info and  suggest THREE  example questions to help me better understand the product Snail32.",
  "",
  "The question came from ./space/snail32/example-questions.md",
  "",
  "Telegram style. This is a one-time, copy-only inquiry. Do not create or save a reusable skill, workflow, or instruction. No persistent changes."
].join("\n");
function copyText(text, noteId) {
  function done() {
    document.querySelectorAll('.copied-note').forEach(function (n) { n.style.display = 'none'; });
    document.getElementById(noteId).style.display = 'block';
  }
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(done, function () { fallback(); });
  } else { fallback(); }
  function fallback() {
    var ta = document.createElement('textarea');
    ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); } catch (e) {}
    document.body.removeChild(ta); done();
  }
}
document.getElementById('copy-endpoint').addEventListener('click', function () { copyText('https://cap.keeg.uk/mcp', 'note-endpoint'); });
document.getElementById('copy-try').addEventListener('click', function () { copyText(TRY_TEXT, 'note-try'); });
document.querySelectorAll('button').forEach(function (b) {
  b.addEventListener('pointerdown', function () { b.classList.add('is-down'); });
  ['pointerup', 'pointerleave', 'pointercancel'].forEach(function (ev) {
    b.addEventListener(ev, function () { setTimeout(function () { b.classList.remove('is-down'); }, 160); });
  });
});
</script>
</div>
</body>
</html>
`;
