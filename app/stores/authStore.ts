import type { Account, LoginResult } from "~/types/auth";

const norm = (email: string) => email.trim().toLowerCase();

const statusOf = (e: unknown): number =>
  (e as { statusCode?: number; status?: number })?.statusCode ?? (e as { status?: number })?.status ?? 0;

/** Seconds to wait, read from a message like "Try again in 30s". */
const retrySeconds = (e: unknown): number => {
  const msg = String(
    (e as { data?: { message?: string } })?.data?.message ?? (e as { message?: string })?.message ?? "",
  );
  const m = /Try again in (\d+)\s*s/i.exec(msg);
  return m ? Number(m[1]) : 30;
};

/**
 * The admin session. The API token lives in an httpOnly cookie handled by this app's server
 * (server/api/auth/*); the browser only knows who is signed in. `ensureLoaded` asks the server
 * once at startup (plugins/auth.ts), so route guards can read `isSignedIn` synchronously.
 */
export const useAuthStore = defineStore("auth", () => {
  const user = ref<Account | null>(null);
  const loaded = ref(false);
  const isSignedIn = computed(() => !!user.value);

  let loading: Promise<void> | null = null;
  const ensureLoaded = () => {
    if (loaded.value) return Promise.resolve();
    loading ??= $fetch<{ user: Account }>("/api/auth/me")
      .then((res) => {
        user.value = res.user;
      })
      .catch(() => {
        user.value = null;
      })
      .finally(() => {
        loaded.value = true;
        loading = null;
      });
    return loading;
  };

  const login = async (emailRaw: string, password: string, remember: boolean): Promise<LoginResult> => {
    try {
      const res = await $fetch<{ user: Account }>("/api/auth/login", {
        method: "POST",
        body: { email: norm(emailRaw), password, remember },
      });
      user.value = res.user;
      loaded.value = true;
      return { ok: true };
    } catch (e) {
      if (statusOf(e) === 429) return { ok: false, reason: "locked", retryInSeconds: retrySeconds(e) };
      return { ok: false, reason: "invalid" };
    }
  };

  const logout = async () => {
    user.value = null;
    try {
      await $fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // the cookie is also dropped by the server on the next rejected request
    }
  };

  /** Always succeeds from the user's side, whether or not the email is registered. */
  const requestReset = async (emailRaw: string): Promise<{ token?: string; expires?: number }> => {
    const res = await $fetch<{ ok: boolean; expires?: number; devToken?: string }>("/api/auth/forgot-password", {
      method: "POST",
      body: { email: norm(emailRaw) },
    });
    return { token: res.devToken, expires: res.expires };
  };

  const tokenState = async (value: string): Promise<{ valid: true; expires: number } | { valid: false }> => {
    try {
      const res = await $fetch<{ valid: boolean; expires?: number }>(
        `/api/auth/reset-token/${encodeURIComponent(value)}`,
      );
      return res.valid ? { valid: true, expires: Number(res.expires ?? 0) } : { valid: false };
    } catch {
      return { valid: false };
    }
  };

  const resetPassword = async (value: string, password: string): Promise<{ ok: boolean }> => {
    try {
      await $fetch("/api/auth/reset-password", { method: "POST", body: { token: value, password } });
      return { ok: true };
    } catch {
      return { ok: false };
    }
  };

  /** Updates the signed-in account's profile fields. The email is the account's identity, so it isn't editable here. */
  const updateProfile = async (
    patch: Partial<Pick<Account, "name" | "studio" | "title" | "phone" | "newsletter">>,
  ): Promise<{ ok: boolean }> => {
    try {
      const res = await $fetch<{ user: Account }>("/api/auth/profile", { method: "PATCH", body: patch });
      user.value = res.user;
      return { ok: true };
    } catch {
      return { ok: false };
    }
  };

  /** Changes the password after the API checks the current one. */
  const changePassword = async (
    current: string,
    next: string,
  ): Promise<{ ok: true } | { ok: false; reason: "wrong-password" }> => {
    try {
      await $fetch("/api/auth/change-password", { method: "POST", body: { current, next } });
      return { ok: true };
    } catch {
      return { ok: false, reason: "wrong-password" };
    }
  };

  /** Called when any request comes back 401: the session is gone, so show the signed-out state. */
  const expire = () => {
    user.value = null;
  };

  return {
    user,
    loaded,
    isSignedIn,
    ensureLoaded,
    login,
    logout,
    requestReset,
    tokenState,
    resetPassword,
    updateProfile,
    changePassword,
    expire,
  };
});
