// Copies the public site files into dist/ and marks them noindex (demo, not for search engines).
import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
const out = "dist";
rmSync(out, { recursive: true, force: true });
mkdirSync(`${out}/en`, { recursive: true });
for (const f of ["index.html", "styles.css", "tokens.css", "base.css", "warp.js"]) cpSync(f, `${out}/${f}`);
cpSync("en/index.html", `${out}/en/index.html`);
for (const f of ["index.html", "en/index.html"]) {
  const p = `${out}/${f}`;
  const html = readFileSync(p, "utf8").replace('<meta charset="utf-8">', '<meta charset="utf-8">\n  <meta name="robots" content="noindex, nofollow">');
  writeFileSync(p, html);
}
writeFileSync(`${out}/robots.txt`, "User-agent: *\nDisallow: /\n");
console.log("built dist/");
