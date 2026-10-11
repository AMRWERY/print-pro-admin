// vee-validate rule functions: return `true` when valid, otherwise a message that says
// what is wrong and how to fix it (design.md §14). Use them as `:rules="..."` on VInput.

type Rule = (value: unknown) => true | string;

const text = (v: unknown) => (typeof v === "string" ? v.trim() : "");
const digits = (v: unknown) => String(v ?? "").replace(/\D/g, "");

/** A required text field with your own message. */
export const requiredText =
  (message: string): Rule =>
  (v) =>
    text(v) ? true : message;

export const emailRule: Rule = (v) => {
  const s = text(v);
  if (!s) return "Enter your email so we can send the order confirmation.";
  return /^\S+@\S+\.\S+$/.test(s)
    ? true
    : "That email looks incomplete. Use the format studio@example.com.";
};

export const phoneRule: Rule = (v) =>
  digits(v).length >= 7
    ? true
    : "Enter a phone number the carrier can reach (at least 7 digits).";

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
  if (!n) return "Enter the card number.";
  return n.length >= 13 && n.length <= 19 && luhn(n)
    ? true
    : "That card number doesn't look right. Check each digit.";
};

export const cardExpiryRule: Rule = (v) => {
  const m = /^(0[1-9]|1[0-2])\/(\d{2})$/.exec(String(v ?? ""));
  if (!m) return "Enter the expiry as MM/YY, for example 08/28.";
  const end = new Date(2000 + Number(m[2]), Number(m[1]), 0, 23, 59, 59);
  return end.getTime() < Date.now()
    ? "This card has expired. Use a different card."
    : true;
};

export const cardCvcRule: Rule = (v) =>
  /^\d{3,4}$/.test(String(v ?? ""))
    ? true
    : "Enter the 3 or 4 digit security code.";

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

export interface PasswordCheck {
  key: string;
  label: string;
  passed: boolean;
}

/** The rules a new password has to meet. Used for both the checklist and the rule. */
export const passwordChecks = (v: unknown): PasswordCheck[] => {
  const s = String(v ?? "");
  return [
    { key: "length", label: "At least 12 characters", passed: s.length >= 12 },
    { key: "case", label: "Upper and lower case letters", passed: /[a-z]/.test(s) && /[A-Z]/.test(s) },
    { key: "digit", label: "At least one number", passed: /\d/.test(s) },
    { key: "symbol", label: "At least one symbol (!@#$%^&*)", passed: /[^A-Za-z0-9]/.test(s) },
  ];
};

export const strongPasswordRule: Rule = (v) => {
  if (!String(v ?? "")) return "Create a password.";
  const missing = passwordChecks(v).filter((c) => !c.passed);
  return missing.length ? `Still needed: ${missing.map((c) => c.label.toLowerCase()).join(", ")}.` : true;
};

/** Must equal another field's value (read lazily, so it follows what the user types). */
export const matchesRule =
  (other: () => unknown, message = "The two passwords don't match."): Rule =>
  (v) =>
    !!v && v === other() ? true : message;
