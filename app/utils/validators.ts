import type { PasswordCheck, Rule } from "~/types/validators";

// vee-validate rule functions: return `true` when valid, otherwise a message that says
// what is wrong and how to fix it (design.md §14). Use them as `:rules="..."` on VInput.
const text = (v: unknown) => (typeof v === "string" ? v.trim() : "");
const digits = (v: unknown) => String(v ?? "").replace(/\D/g, "");

/** A required text field with your own message. */
export const requiredText =
  (message: string): Rule =>
    (v) =>
      text(v) ? true : message;

export const emailRule: Rule = (v) => {
  const s = text(v);
  if (!s) return tr("common_ui.val_email_required");
  return /^\S+@\S+\.\S+$/.test(s)
    ? true
    : tr("common_ui.val_email_invalid");
};

export const phoneRule: Rule = (v) =>
  digits(v).length >= 7
    ? true
    : tr("common_ui.val_phone_invalid");

export const minLengthText =
  (min: number, message: string): Rule =>
    (v) =>
      text(v).length >= min ? true : message;

// Luhn check: catches most mistyped card numbers before they go anywhere.
const luhn = (num: string) => {
  let sum = 0;
  let alt = false;
  for (let i = num.length - 1; i >= 0; i--) {
    let n = Number(num[i]);
    if (alt) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    alt = !alt;
  }
  return sum % 10 === 0;
};

export const cardNumberRule: Rule = (v) => {
  const n = digits(v);
  if (!n) return tr("common_ui.val_card_required");
  return n.length >= 13 && n.length <= 19 && luhn(n)
    ? true
    : tr("common_ui.val_card_invalid");
};

export const cardExpiryRule: Rule = (v) => {
  const m = /^(0[1-9]|1[0-2])\/(\d{2})$/.exec(String(v ?? ""));
  if (!m) return tr("common_ui.val_expiry_format");
  const end = new Date(2000 + Number(m[2]), Number(m[1]), 0, 23, 59, 59);
  return end.getTime() < Date.now()
    ? tr("common_ui.val_card_expired")
    : true;
};

export const cardCvcRule: Rule = (v) =>
  /^\d{3,4}$/.test(String(v ?? ""))
    ? true
    : tr("common_ui.val_cvc_invalid");

export const mustAccept =
  (message: string): Rule =>
    (v) =>
      v ? true : message;

export const formatCardNumber = (v: string) =>
  digits(v)
    .slice(0, 19)
    .replace(/(.{4})/g, "$1 ")
    .trim();

export const formatExpiry = (v: string) => {
  const d = digits(v).slice(0, 4);
  return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
};

// ---- passwords ----
/** The rules a new password has to meet. Used for both the checklist and the rule. */
export const passwordChecks = (v: unknown): PasswordCheck[] => {
  const s = String(v ?? "");
  return [
    { key: "length", label: tr("auth_ui.check_length", { n: 12 }), passed: s.length >= 12 },
    { key: "case", label: tr("auth_ui.check_case"), passed: /[a-z]/.test(s) && /[A-Z]/.test(s) },
    { key: "digit", label: tr("auth_ui.check_digit"), passed: /\d/.test(s) },
    { key: "symbol", label: tr("auth_ui.check_symbol", { symbols: "!@#$%^&*" }), passed: /[^A-Za-z0-9]/.test(s) },
  ];
};

export const strongPasswordRule: Rule = (v) => {
  if (!String(v ?? "")) return tr("auth_ui.password_create");
  const missing = passwordChecks(v).filter((c) => !c.passed);
  return missing.length
    ? tr("auth_ui.password_still_needed", { items: missing.map((c) => c.label.toLowerCase()).join(tr("common_ui.list_sep")) })
    : true;
};

/** Must equal another field's value (read lazily, so it follows what the user types). */
export const matchesRule =
  (other: () => unknown, message?: string): Rule =>
    (v) =>
      !!v && v === other() ? true : (message ?? tr("auth_ui.passwords_dont_match"));
