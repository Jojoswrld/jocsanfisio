// Copies version 3's public files (Spanish and English) into dist-v3/ and marks them noindex (demo, not for search engines).
import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
const out = "dist-v3";
rmSync(out, { recursive: true, force: true });
mkdirSync(`${out}/en`, { recursive: true });
for (const f of ["index.html", "styles.css", "tokens.css", "base.css", "warp.js"]) cpSync(`v3/${f}`, `${out}/${f}`);
cpSync("v3/en/index.html", `${out}/en/index.html`);
for (const p of [`${out}/index.html`, `${out}/en/index.html`]) {
  const html = readFileSync(p, "utf8").replace('<meta charset="utf-8">', '<meta charset="utf-8">\n  <meta name="robots" content="noindex, nofollow">');
  writeFileSync(p, html);
}
writeFileSync(`${out}/robots.txt`, "User-agent: *\nDisallow: /\n");
console.log("built dist-v3/");
