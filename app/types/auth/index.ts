export type Tier = "business" | "reseller" | "home";

/** The signed-in user, as returned by the API. */
export interface Account {
  id: string;
  name: string;
  studio: string;
  email: string;
  role: "admin" | "customer";
  tier: Tier;
  newsletter: boolean;
  /** Job title shown on the profile. */
  title?: string;
  phone?: string;
  createdAt: string;
}

export type LoginResult =
  | { ok: true }
  | { ok: false; reason: "invalid" }
  | { ok: false; reason: "locked"; retryInSeconds: number };

export type Validatable = { validate: () => Promise<{ valid: boolean }> };
