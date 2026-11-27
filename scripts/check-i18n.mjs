// `npm run check:i18n`: parses every message in the locale files the way vue-i18n does.
// One message with a stray @, { } or | stops its whole language from loading, so find them here first.
// Write a literal @ as {'@'}.
import { readFileSync } from "node:fs";
import { baseCompile } from "@intlify/message-compiler";

const locales = ["en", "ar"];
let total = 0;
const failures = [];

const walk = (lang, node, path) => {
  for (const [key, value] of Object.entries(node)) {
    if (value && typeof value === "object") walk(lang, value, `${path}${key}.`);
    else if (typeof value === "string") {
      total++;
      try {
        baseCompile(value, {
          onError: (e) => {
            throw e;
          },
        });
      } catch (e) {
        failures.push(`${lang}: ${path}${key} -> ${String(e.message).split("\n")[0]}  [${value.slice(0, 60)}]`);
      }
    }
  }
};

for (const lang of locales) {
  walk(lang, JSON.parse(readFileSync(`app/config/i18n/locales/${lang}.json`, "utf8")), "");
}

if (failures.length) {
  console.error(`${failures.length} of ${total} messages are not valid vue-i18n syntax:\n${failures.join("\n")}`);
  process.exit(1);
}
console.log(`All ${total} messages are valid.`);
