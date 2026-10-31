import type { InventoryItem } from "~/types/admin/inventory";
import type {
  Product,
  ProductCategory,
  ProductDetail,
  ProductsQuery,
  ProductsResponse,
  RequestStatus,
} from "~/types/admin/products";

const BASE = "/api/admin/products";

/** The product register: the list, one product's detail, and the product reads other screens need. */
export const useProductsStore = defineStore("products", () => {
  // --- List ---
  const list = ref<ProductsResponse | null>(null);
  const status = ref<RequestStatus>("idle");
  const error = ref<unknown>(null);
  let lastQuery: Partial<ProductsQuery> = {};
  let listTicket = 0;

  const fetchList = async (query: Partial<ProductsQuery> = lastQuery) => {
    lastQuery = query;
    const ticket = ++listTicket;
    status.value = "pending";
    try {
      const res = await api<ProductsResponse>(BASE, { query });
      if (ticket !== listTicket) return;
      list.value = res;
      error.value = null;
      status.value = "success";
    } catch (e) {
      if (ticket !== listTicket) return;
      error.value = e;
      status.value = "error";
    }
  };
  const refresh = () => fetchList(lastQuery);

  // --- Detail ---
  const detail = ref<ProductDetail | null>(null);
  const detailStatus = ref<RequestStatus>("idle");
  const detailError = ref<unknown>(null);
  let detailTicket = 0;

  const fetchDetail = async (id: string) => {
    const ticket = ++detailTicket;
    if (detail.value && detail.value.id !== id) detail.value = null;
    detailStatus.value = "pending";
    try {
      const res = await api<ProductDetail>(`${BASE}/${id}`);
      if (ticket !== detailTicket) return;
      detail.value = res;
      detailError.value = null;
      detailStatus.value = "success";
    } catch (e) {
      if (ticket !== detailTicket) return;
      detail.value = null;
      detailError.value = e;
      detailStatus.value = "error";
    }
  };
  const refreshDetail = () =>
    detail.value ? fetchDetail(detail.value.id) : Promise.resolve();

  /** One product's detail without touching the page state (used to duplicate a product). Throws on failure. */
  const loadDetail = (id: string) => api<ProductDetail>(`${BASE}/${id}`);

  // --- Reads for other screens ---
  /** A few products of one category the editor can pair with (bundles). Returns [] on failure. */
  const fetchPairable = async (
    category: ProductCategory,
    perPage = 10,
  ): Promise<Product[]> => {
    try {
      const res = await api<{ rows: Product[] }>(BASE, {
        query: { category, perPage },
      });
      return res.rows;
    } catch {
      return [];
    }
  };

  /** Stock-item search for the inventory product picker. */
  const searchStock = (q: string) =>
    api<InventoryItem[]>("/api/admin/inventory/search", { query: { q } });

  // --- Mutations ---
  const create = (body: unknown) =>
    api<Product>(BASE, { method: "POST", body });
  const update = (id: string, body: unknown) =>
    api<Product>(`${BASE}/${id}`, { method: "PATCH", body });

  /** Changes the stock shown at once, restoring it and rethrowing if the save fails. */
  const adjustStock = async (p: Product, next: number) => {
    const previous = p.stock;
    p.stock = next;
    try {
      await api(`${BASE}/${p.id}`, { method: "PATCH", body: { stock: next } });
    } catch (e) {
      p.stock = previous;
      throw e;
    }
  };

  const removeMany = async (ids: string[]) => {
    await api(`${BASE}/bulk-delete`, { method: "POST", body: { ids } });
    await refresh();
  };

  return {
    list,
    status,
    error,
    fetchList,
    refresh,
    detail,
    detailStatus,
    detailError,
    fetchDetail,
    refreshDetail,
    loadDetail,
    fetchPairable,
    searchStock,
    create,
    update,
    adjustStock,
    removeMany,
  };
});
