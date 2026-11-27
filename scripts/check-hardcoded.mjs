// `npm run check:hardcoded [folder...]`: lists English text typed straight into templates (visible text and
// label/title/placeholder-style attributes) instead of going through the translation files.
// Folders are relative to app/ (for example `components/products pages/products`); no folder means all of app/.
import { readFileSync, readdirSync } from "node:fs";
import { join, relative } from "node:path";

const root = "app";
const targets = process.argv.slice(2).filter((a) => !a.startsWith("--"));
const quiet = process.argv.includes("--summary");

const attrRe = /\s(label|title|placeholder|description|hint|aria-label|subtitle|eyebrow|tag|button-label|message|alt|empty-text)="([^"{}]*[A-Za-z]{3,}[^"{}]*)"/g;
const textRe = />\s*([A-Z][A-Za-z0-9 ,.'&/:()!?-]{5,})\s*</g;

const files = [];
const walk = (dir) => {
  for (const f of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, f.name);
    if (f.isDirectory()) walk(p);
    else if (f.name.endsWith(".vue")) files.push(p);
  }
};
for (const t of targets.length ? targets : [""]) walk(join(root, t));

let total = 0;
const lines = [];
for (const file of files) {
  const s = readFileSync(file, "utf8");
  const start = s.indexOf("<template");
  if (start < 0) continue;
  // Example text inside HTML comments is documentation, not UI.
  // The template ends at the closing tag at the start of a line (doc comments in <script> can mention </template>).
  const end = s.lastIndexOf("\n</template>");
  const tpl = s.slice(start, end < 0 ? s.length : end + 12).replace(/<!--[\s\S]*?-->/g, "");
  const found = new Set();
  for (const m of tpl.matchAll(attrRe)) {
    // tag="span" names an HTML element, not text.
    if (m[1] === "tag" && /^[a-z0-9]+$/.test(m[2])) continue;
    found.add(m[2].trim());
  }
  for (const m of tpl.matchAll(textRe)) if (!/^(true|false)$/i.test(m[1].trim())) found.add(m[1].trim());
  if (!found.size) continue;
  total += found.size;
  lines.push(`${found.size}\t${relative(".", file)}${quiet ? "" : "\n   " + [...found].map((x) => JSON.stringify(x)).join("\n   ")}`);
}
console.log(lines.join("\n"));
console.log(`\n${total} hard-coded string(s) in ${lines.length} file(s).`);
process.exit(total ? 1 : 0);
