import type { Tier } from "~/types/auth";

// Texts are getters so they are translated when read, in the current language.
export const tiers: { id: Tier; tag: string; title: string; body: string }[] = [
  {
    id: "business",
    get tag() { return tr("auth_ui.tier_tag", { n: "01" }); },
    get title() { return tr("auth_ui.tier_business_title"); },
    get body() { return tr("auth_ui.tier_business_body"); },
  },
  {
    id: "reseller",
    get tag() { return tr("auth_ui.tier_tag", { n: "02" }); },
    get title() { return tr("auth_ui.tier_reseller_title"); },
    get body() { return tr("auth_ui.tier_reseller_body"); },
  },
  {
    id: "home",
    get tag() { return tr("auth_ui.tier_tag", { n: "03" }); },
    get title() { return tr("auth_ui.tier_home_title"); },
    get body() { return tr("auth_ui.tier_home_body"); },
  },
];
