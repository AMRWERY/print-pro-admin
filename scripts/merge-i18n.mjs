// `node scripts/merge-i18n.mjs <fragment.json>... [--check]`
//
// Adds new messages to app/config/i18n/locales/en.json and ar.json from fragment files shaped like
//   { "en": { "products_ui": { "save_label": "Save" } }, "ar": { "products_ui": { "save_label": "حفظ" } } }
//
// It refuses (and writes nothing) when: English and Arabic do not have exactly the same keys, a message is not
// valid vue-i18n syntax (write a literal @ as {'@'}), or a key already exists with different text.
// A key that already exists with the same text is skipped. `--check` validates without writing.
import { readFileSync, writeFileSync } from "node:fs";
import { baseCompile } from "@intlify/message-compiler";

const args = process.argv.slice(2);
const dry = args.includes("--check");
const files = args.filter((a) => !a.startsWith("--"));
if (!files.length) {
  console.error("Usage: node scripts/merge-i18n.mjs <fragment.json>... [--check]");
  process.exit(2);
}

const flat = (o, p = "", out = {}) => {
  for (const [k, v] of Object.entries(o ?? {})) {
    if (v && typeof v === "object") flat(v, `${p}${k}.`, out);
    else out[`${p}${k}`] = v;
  }
  return out;
};
const setDeep = (o, key, value) => {
  const parts = key.split(".");
  let cur = o;
  for (const part of parts.slice(0, -1)) cur = cur[part] ??= {};
  cur[parts.at(-1)] = value;
};

const paths = { en: "app/config/i18n/locales/en.json", ar: "app/config/i18n/locales/ar.json" };
const locales = { en: JSON.parse(readFileSync(paths.en, "utf8")), ar: JSON.parse(readFileSync(paths.ar, "utf8")) };
const current = { en: flat(locales.en), ar: flat(locales.ar) };

const problems = [];
let added = 0;
let skipped = 0;

for (const file of files) {
  let fragment;
  try {
    fragment = JSON.parse(readFileSync(file, "utf8"));
  } catch (e) {
    problems.push(`${file}: not valid JSON (${e.message})`);
    continue;
  }
  const f = { en: flat(fragment.en), ar: flat(fragment.ar) };
  const enKeys = Object.keys(f.en);
  const arKeys = new Set(Object.keys(f.ar));
  for (const k of enKeys) if (!arKeys.has(k)) problems.push(`${file}: "${k}" has English but no Arabic`);
  for (const k of arKeys) if (!(k in f.en)) problems.push(`${file}: "${k}" has Arabic but no English`);

  for (const lang of ["en", "ar"]) {
    for (const [key, value] of Object.entries(f[lang])) {
      if (typeof value !== "string" || !value.trim()) {
        problems.push(`${file}: ${lang} "${key}" is empty or not a string`);
        continue;
      }
      try {
        baseCompile(value, { onError: (e) => { throw e; } });
      } catch (e) {
        problems.push(`${file}: ${lang} "${key}" -> ${String(e.message).split("\n")[0]} [${value.slice(0, 50)}]`);
        continue;
      }
      if (key in current[lang]) {
        if (current[lang][key] === value) skipped++;
        else problems.push(`${file}: ${lang} "${key}" already exists with different text ("${current[lang][key].slice(0, 40)}")`);
        continue;
      }
      current[lang][key] = value;
      setDeep(locales[lang], key, value);
      if (lang === "en") added++;
    }
  }
}

if (problems.length) {
  console.error(`${problems.length} problem(s); nothing was written:\n${problems.join("\n")}`);
  process.exit(1);
}
if (!dry) {
  writeFileSync(paths.en, JSON.stringify(locales.en, null, 2), "utf8");
  writeFileSync(paths.ar, JSON.stringify(locales.ar, null, 2), "utf8");
}
console.log(`${dry ? "Checked" : "Merged"}: ${added} new message(s) per language, ${skipped} already present.`);
