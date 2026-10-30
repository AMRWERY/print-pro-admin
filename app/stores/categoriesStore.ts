import type { CategoriesResponse, Category, CategoryInput } from "~/types/admin/categories";
import type { RequestStatus } from "~/stores/productsStore";

const BASE = "/api/admin/categories";

/** The category tree and its mutations. */
export const useCategoriesStore = defineStore("categories", () => {
  const data = ref<CategoriesResponse | null>(null);
  const status = ref<RequestStatus>("idle");
  const error = ref<unknown>(null);
  let ticket = 0;

  const fetchAll = async () => {
    const mine = ++ticket;
    status.value = "pending";
    try {
      const res = await api<CategoriesResponse>(BASE);
      if (mine !== ticket) return;
      data.value = res;
      error.value = null;
      status.value = "success";
    } catch (e) {
      if (mine !== ticket) return;
      error.value = e;
      status.value = "error";
    }
  };
  const refresh = fetchAll;

  const create = (body: CategoryInput) => api<Category>(BASE, { method: "POST", body });
  const update = (id: string, body: CategoryInput) => api<Category>(`${BASE}/${id}`, { method: "PATCH", body });

  /** Shows the new visibility at once; restores it and rethrows if the save fails. */
  const setVisibility = async (c: Category, on: boolean, body: CategoryInput) => {
    const previous = c.visibility;
    c.visibility = on ? "active" : "hidden";
    try {
      await api(`${BASE}/${c.id}`, { method: "PATCH", body: { ...body, visibility: c.visibility } });
    } catch (e) {
      c.visibility = previous;
      throw e;
    }
    void refresh();
  };

  /** Shows the new order at once; restores it and rethrows if the save fails. */
  const reorder = async (parentId: string | null, ids: string[]) => {
    const nodes = data.value?.nodes ?? [];
    const before = new Map(nodes.map((n) => [n.id, n.order]));
    ids.forEach((id, order) => {
      const n = nodes.find((x) => x.id === id);
      if (n) n.order = order;
    });
    try {
      await api(`${BASE}/reorder`, { method: "POST", body: { parentId, ids } });
    } catch (e) {
      nodes.forEach((n) => {
        if (before.has(n.id)) n.order = before.get(n.id)!;
      });
      throw e;
    }
  };

  const remove = async (id: string) => {
    await api(`${BASE}/${id}`, { method: "DELETE" });
    await refresh();
  };

  return { data, status, error, fetchAll, refresh, create, update, setVisibility, reorder, remove };
});
