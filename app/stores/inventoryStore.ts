import type {
  AdjustInput,
  InventoryItem,
  InventoryQuery,
  InventoryResponse,
  ItemInput,
  Movement,
  ReceiveInput,
  TransferInput,
} from "~/types/admin/inventory";
import type { RequestStatus } from "~/stores/productsStore";

const BASE = "/api/admin/inventory";

/** The stock ledger, the recent movements feed and the stock-changing actions. */
export const useInventoryStore = defineStore("inventory", () => {
  const list = ref<InventoryResponse | null>(null);
  const status = ref<RequestStatus>("idle");
  const error = ref<unknown>(null);
  let lastQuery: Partial<InventoryQuery> = {};
  let ticket = 0;

  const fetchList = async (query: Partial<InventoryQuery> = lastQuery) => {
    lastQuery = query;
    const mine = ++ticket;
    status.value = "pending";
    try {
      const res = await api<InventoryResponse>(BASE, { query });
      if (mine !== ticket) return;
      list.value = res;
      error.value = null;
      status.value = "success";
    } catch (e) {
      if (mine !== ticket) return;
      error.value = e;
      status.value = "error";
    }
  };
  const refresh = () => fetchList(lastQuery);

  const movements = ref<Movement[] | null>(null);
  const fetchMovements = async (limit = 8) => {
    try {
      movements.value = await api<Movement[]>(`${BASE}/movements`, { query: { limit } });
    } catch {
      // the feed keeps what it had
    }
  };

  /** Reloads the ledger and the feed after any stock change. */
  const refreshAll = () => Promise.all([refresh(), fetchMovements()]);

  const adjust = (body: AdjustInput) => api<InventoryItem>(`${BASE}/adjust`, { method: "POST", body });
  const transfer = (body: TransferInput) => api<InventoryItem>(`${BASE}/transfer`, { method: "POST", body });
  const receive = (body: ReceiveInput) => api<InventoryItem>(`${BASE}/receive`, { method: "POST", body });
  const createItem = (body: ItemInput) => api<InventoryItem>(`${BASE}/items`, { method: "POST", body });
  const updateItem = (id: string, body: ItemInput) =>
    api<InventoryItem>(`${BASE}/items/${id}`, { method: "PATCH", body });
  const removeItem = (id: string) => api(`${BASE}/items/${id}`, { method: "DELETE" });

  return {
    list,
    status,
    error,
    fetchList,
    refresh,
    movements,
    fetchMovements,
    refreshAll,
    adjust,
    transfer,
    receive,
    createItem,
    updateItem,
    removeItem,
  };
});
