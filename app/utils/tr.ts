/**
 * Translates a message from anywhere, including data files and helpers that are not components.
 *
 *   export const stockMeta = { ok: { get label() { return tr("products_ui.stock_ok"); }, tone: "success" } };
 *
 * Use it when a label is read (inside a getter or a function), never when a file is first imported: at that
 * moment the language is not known yet and the key itself would be returned and kept. Reading it during
 * rendering also makes the text follow the language switch. An unknown key shows as the key.
 */
type Translator = { t: (key: string, params?: Record<string, unknown>) => string };

let bound: Translator | null = null;

/** Called once by the i18n-bridge plugin. */
export const bindI18n = (i18n: Translator) => {
  bound = i18n;
};

export const tr = (key: string, params?: Record<string, unknown>): string => {
  const i18n = (tryUseNuxtApp()?.$i18n as Translator | undefined) ?? bound;
  return i18n ? i18n.t(key, params) : key;
};
