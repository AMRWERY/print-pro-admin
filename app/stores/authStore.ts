import { skipHydrate } from "pinia";
import type { Account, LoginResult, ResetToken, Tier } from "~/types/auth";

const MAX_FAILURES = 5;
const LOCK_MS = 30_000;
const TOKEN_TTL_MS = 15 * 60_000;

const norm = (email: string) => email.trim().toLowerCase();

/**
 * Demo accounts, kept in this browser only. Passwords are salted and hashed (see utils/crypto.ts),
 * but a real deployment needs a server for accounts, sessions and password-reset emails.
 */
export const useAuthStore = defineStore("auth", () => {
  // initOnMounted keeps SSR and the first client render identical (both signed out).
  const users = useLocalStorage<Account[]>("auth-users", [], { initOnMounted: true });
  const tokens = useLocalStorage<ResetToken[]>("auth-reset-tokens", [], { initOnMounted: true });
  /** "Remember this terminal" lives in localStorage, otherwise the session ends with the tab. */
  const remembered = useLocalStorage<string | null>("auth-session", null, { initOnMounted: true });
  const tabSession = useSessionStorage<string | null>("auth-session", null, { initOnMounted: true });

  const sessionEmail = computed(() => remembered.value ?? tabSession.value);
  const user = computed(() => users.value.find((u) => u.email === sessionEmail.value) ?? null);
  const isSignedIn = computed(() => !!user.value);

  // Repeated wrong passwords pause sign-in for a short while. In memory: a reload resets it,
  // which is fine for a demo (a server must enforce this for real).
  const failures = reactive<Record<string, { count: number; until: number }>>({});

  const register = async (input: {
    name: string;
    studio: string;
    email: string;
    tier: Tier;
    newsletter: boolean;
    password: string;
  }): Promise<{ ok: true } | { ok: false; reason: "exists" }> => {
    const email = norm(input.email);
    if (users.value.some((u) => u.email === email)) return { ok: false, reason: "exists" };

    const salt = randomSalt();
    users.value.push({
      id: crypto.randomUUID(),
      name: input.name.trim(),
      studio: input.studio.trim(),
      email,
      tier: input.tier,
      newsletter: input.newsletter,
      salt,
      hash: await hashPassword(input.password, salt),
      createdAt: new Date().toISOString(),
    });
    return { ok: true };
  };

  const login = async (emailRaw: string, password: string, remember: boolean): Promise<LoginResult> => {
    const email = norm(emailRaw);
    const f = failures[email];
    if (f && f.until > Date.now()) {
      return { ok: false, reason: "locked", retryInSeconds: Math.ceil((f.until - Date.now()) / 1000) };
    }

    const account = users.value.find((u) => u.email === email);
    // Hash even when the account doesn't exist, so timing doesn't reveal which emails are registered.
    const hash = await hashPassword(password, account?.salt ?? "AAAAAAAAAAAAAAAAAAAAAA==");

    if (!account || account.hash !== hash) {
      const count = (f?.count ?? 0) + 1;
      failures[email] = { count, until: count >= MAX_FAILURES ? Date.now() + LOCK_MS : 0 };
      if (count >= MAX_FAILURES) failures[email] = { count: 0, until: Date.now() + LOCK_MS };
      return { ok: false, reason: "invalid" };
    }

    delete failures[email];
    if (remember) {
      remembered.value = email;
      tabSession.value = null;
    } else {
      tabSession.value = email;
      remembered.value = null;
    }
    return { ok: true };
  };

  const logout = () => {
    remembered.value = null;
    tabSession.value = null;
  };

  /** Always succeeds, whether or not the email is registered, so the form can't be used to probe for accounts. */
  const requestReset = (emailRaw: string) => {
    const token = randomToken();
    tokens.value = [
      { token, email: norm(emailRaw), expires: Date.now() + TOKEN_TTL_MS },
      ...tokens.value.filter((t) => t.expires > Date.now()),
    ];
    return { token, expires: Date.now() + TOKEN_TTL_MS };
  };

  const tokenState = (token: string): { valid: true; expires: number } | { valid: false } => {
    const t = tokens.value.find((x) => x.token === token);
    return t && t.expires > Date.now() ? { valid: true, expires: t.expires } : { valid: false };
  };

  const resetPassword = async (token: string, password: string): Promise<{ ok: boolean }> => {
    const t = tokens.value.find((x) => x.token === token);
    if (!t || t.expires <= Date.now()) return { ok: false };

    const account = users.value.find((u) => u.email === t.email);
    // No account for this email: behave the same as success, so nothing is revealed.
    if (account) {
      account.salt = randomSalt();
      account.hash = await hashPassword(password, account.salt);
    }
    tokens.value = tokens.value.filter((x) => x.token !== token);
    delete failures[t.email];
    return { ok: true };
  };

  /** Updates the signed-in account's profile fields. The email is the account's identity, so it isn't editable here. */
  const updateProfile = (patch: Partial<Pick<Account, "name" | "studio" | "title" | "phone" | "newsletter">>) => {
    const account = user.value;
    if (account) Object.assign(account, patch);
  };

  /** Changes the password after checking the current one. */
  const changePassword = async (current: string, next: string): Promise<{ ok: true } | { ok: false; reason: "wrong-password" }> => {
    const account = user.value;
    if (!account) return { ok: false, reason: "wrong-password" };
    if ((await hashPassword(current, account.salt)) !== account.hash) return { ok: false, reason: "wrong-password" };
    account.salt = randomSalt();
    account.hash = await hashPassword(next, account.salt);
    return { ok: true };
  };

  return {
    users: skipHydrate(users),
    user,
    isSignedIn,
    register,
    login,
    logout,
    requestReset,
    tokenState,
    resetPassword,
    updateProfile,
    changePassword,
  };
});
