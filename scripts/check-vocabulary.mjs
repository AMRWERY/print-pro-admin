// Fails when photography, optics or lab-themed vocabulary is still present in the admin.
// Usage: npm run check:vocab
import { readdirSync, readFileSync, statSync, existsSync } from "node:fs";
import { join, relative } from "node:path";

const BANNED = [
  "camera",
  "cameras",
  "lens",
  "lenses",
  "lighting",
  "audio",
  "tripod",
  "tripods",
  "medium format",
  "medium-format",
  "colorimeter",
  "colorimeters",
  "baryta",
  "cine",
  "hasselblad",
  "photograph",
  "photography",
  "photographer",
  "photographers",
  "atelier",
  "cleanroom",
  "escrow",
  "vault",
  "vaults",
  "metrology",
  "requisition",
  "requisitions",
  "spectro",
  "spectrophotometer",
  "curator",
  "curatorial",
  "archival",
  "apparatus",
  "optical",
  "outgassing",
  "qaHold",
];

/** Intentional exceptions as "relative/path:word", each with a reason. */
const ALLOW = [];

const ROOTS = ["app", "server"];
const EXT = /\.(vue|ts|json)$/;
// No backslashes here: spaces become a character class, word edges use lookarounds.
const alt = BANNED.map((w) => w.replace(/ /g, "[ ]")).join("|");
const re = new RegExp("(?<![A-Za-z])(" + alt + ")(?![A-Za-z])", "gi");

const walk = (dir, out = []) => {
  if (!existsSync(dir)) return out;
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (EXT.test(name)) out.push(p);
  }
  return out;
};

let hits = 0;
for (const root of ROOTS) {
  for (const file of walk(root)) {
    const rel = relative(".", file).split(String.fromCharCode(92)).join("/");
    readFileSync(file, "utf8")
      .split(/\r?\n/)
      .forEach((line, i) => {
        for (const m of line.matchAll(re)) {
          const word = m[0].toLowerCase();
          if (ALLOW.includes(`${rel}:${word}`)) continue;
          hits++;
          console.log(`${rel}:${i + 1}: ${word}`);
        }
      });
  }
}

console.log(`\n${hits} banned-word match(es)`);
process.exit(hits ? 1 : 0);
