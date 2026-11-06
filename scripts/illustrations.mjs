// Builds public/illustrations/<name>.html from each figure in illustrations/: the hairline kernel (copied unchanged
// from the hairline skill), a host that mounts the figure without the bench's controls, and the figure itself.
// Each figure is checked on the skill's bench first (look.mjs); this page is only how it's shown in a case study.
import { readFileSync, readdirSync, writeFileSync, mkdirSync } from "node:fs";

const kernel = readFileSync("illustrations/kernel.js", "utf8");
const host = `(() => {
  const stage = document.getElementById("stage"), out = document.getElementById("read");
  window.hairline = (figure) => {
    const [, mid] = figure.range;
    HL.inject(document);
    stage.setAttribute("data-hairline", figure.name);
    stage.setAttribute("role", "img");
    stage.setAttribute("aria-label", figure.means);
    const svg = HL.mk("svg", { viewBox: "0 0 400 320", "aria-hidden": "true" }, stage);
    let text = null;
    const read = { get textContent() { return text; }, set textContent(v) { text = v == null ? "" : String(v); out.textContent = text; } };
    figure.mount({ stage, svg, read }, mid);
    if (text === null) read.textContent = "rest";
  };
})();`;

// Follows the case study's theme switch: reads <html data-theme> on the page around it (same origin) and watches it.
const theme = `(() => {
  const stage = document.getElementById("stage");
  const sync = () => {
    let dark = false;
    try { dark = parent.document.documentElement.dataset.theme === "dark"; } catch {}
    stage.dataset.hairlineTheme = dark ? "dark" : "light";
    document.documentElement.style.colorScheme = dark ? "dark" : "light";
  };
  sync();
  try { new MutationObserver(sync).observe(parent.document.documentElement, { attributes: true, attributeFilter: ["data-theme"] }); } catch {}
})();`;

mkdirSync("public/illustrations", { recursive: true });
for (const file of readdirSync("illustrations").filter((f) => f.endsWith(".js") && f !== "kernel.js")) {
  const name = file.replace(/\.js$/, "");
  const figure = readFileSync(`illustrations/${file}`, "utf8");
  writeFileSync(
    `public/illustrations/${name}.html`,
    `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${name}</title>
<style>
  :root { color-scheme: light; }
  html, body { margin: 0; height: 100%; background: transparent; overflow: hidden; }
  body { display: grid; place-items: center; }
  /* On the case-study sheet (#fbfaf8) the kernel's default greys read at about 1.6:1; these read at 3:1 to 15:1. */
  #stage { width: 100%; --hairline-plate: #fbfaf8; --hairline-mid: #8f8a83; --hairline-edge: #5f5b55; --hairline-lo: #cdc8c0; --hairline-hi: #1d1d1f; --hairline-stroke: 1.1; }
  /* Dark, on the dark page (#131315): the same steps from the lowest stroke to the brightest, at 1.9:1 to 17:1. */
  #stage[data-hairline-theme="dark"] { --hairline-plate: #131315; --hairline-mid: #77736d; --hairline-edge: #a6a19a; --hairline-lo: #3a3835; --hairline-hi: #f5f5f7; }
  /* The read-out is for screen readers only: the bench shows it, the page doesn't. */
  #read { position: fixed; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
</style>
</head>
<body>
<div id="stage" data-hairline-theme="light"></div>
<span id="read" aria-live="polite"></span>
<script>${kernel}</script>
<script>${host}</script>
<script>${theme}</script>
<script type="module">${figure}</script>
</body>
</html>
`,
  );
  console.log(`public/illustrations/${name}.html`);
}
