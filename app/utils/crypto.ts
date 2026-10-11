// Password hashing with the browser's Web Crypto API (PBKDF2-SHA256, per-account salt).
// This protects what is saved in localStorage, but the demo accounts still live entirely
// in the browser: real sign-in needs a server.

const enc = new TextEncoder();

const toBase64 = (buf: ArrayBuffer | Uint8Array) => {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  let s = "";
  bytes.forEach((b) => (s += String.fromCharCode(b)));
  return btoa(s);
};

const fromBase64 = (b64: string) => Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));

export const randomSalt = () => toBase64(crypto.getRandomValues(new Uint8Array(16)));

export const randomToken = () => toBase64(crypto.getRandomValues(new Uint8Array(24))).replace(/[+/=]/g, "x");

export const hashPassword = async (password: string, salt: string) => {
  const key = await crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt: fromBase64(salt), iterations: 150_000, hash: "SHA-256" },
    key,
    256,
  );
  return toBase64(bits);
};
