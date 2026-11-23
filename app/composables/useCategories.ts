/**
 * The live category list for any screen: `label(key)`, `icon(key)` and `options()` for a select.
 * Loads once, on first use. An unknown key shows as the raw key with a neutral icon, never an error.
 */
export const useCategories = () => {
  const store = useCategoriesStore();
  void store.load();
  return {
    items: computed(() => store.items),
    label: store.label,
    icon: store.icon,
    options: store.options,
    refresh: store.refresh,
  };
};
