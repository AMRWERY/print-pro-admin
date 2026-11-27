import type { CategorySort, CategoryVisibility } from "~/types/admin/categories";
import type { Tone } from "~/types/admin/dashboard";

// Text is read through tr() inside getters so it follows the active language.

export const visibilityMeta: Record<CategoryVisibility, { label: string; tone: Tone; icon: string }> = {
  active: { get label() { return tr("categories_ui.visibility_active"); }, tone: "success", icon: "lucide:eye" },
  staging: { get label() { return tr("categories_ui.visibility_staging"); }, tone: "warning", icon: "lucide:flask-conical" },
  hidden: { get label() { return tr("categories_ui.visibility_hidden"); }, tone: "neutral", icon: "lucide:eye-off" },
};

export const visibilityOptions: { value: CategoryVisibility; label: string }[] = [
  { value: "active", get label() { return tr("categories_ui.visibility_option_active"); } },
  { value: "staging", get label() { return tr("categories_ui.visibility_staging"); } },
  { value: "hidden", get label() { return tr("categories_ui.visibility_option_hidden"); } },
];

export const sortOptions: { value: CategorySort; label: string }[] = [
  { value: "curated", get label() { return tr("categories_ui.sort_curated"); } },
  { value: "newest", get label() { return tr("categories_ui.sort_newest"); } },
  { value: "priceAsc", get label() { return tr("categories_ui.sort_price_asc"); } },
  { value: "priceDesc", get label() { return tr("categories_ui.sort_price_desc"); } },
];

export const facetOptions = [1, 2, 3, 4, 5].map((n) => ({
  value: n,
  get label() {
    return n === 1
      ? tr("categories_ui.facet_rank_highest")
      : n === 5
        ? tr("categories_ui.facet_rank_lowest")
        : tr("categories_ui.facet_rank", { n });
  },
}));
