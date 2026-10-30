import type { CreateOrderInput, OrderDetail, OrderRow, OrderStage, OrdersResponse } from "~/types/admin/orders";

type Status = "idle" | "pending" | "success" | "error";

/** Orders ledger (paged list) and the single open order (detail, stage moves, notes). */
export const useOrdersStore = defineStore("orders", () => {
  // --- list ---
  const list = ref<OrdersResponse | null>(null);
  const status = ref<Status>("idle");
  const error = ref<unknown>(null);
  const pending = computed(() => status.value === "idle" || status.value === "pending");

  let lastQuery: Record<string, unknown> = {};
  let listSeq = 0;

  const fetchList = async (query: Record<string, unknown> = lastQuery) => {
    lastQuery = query;
    const seq = ++listSeq;
    status.value = "pending";
    error.value = null;
    try {
      const res = await api<OrdersResponse>("/api/admin/orders", { query });
      if (seq !== listSeq) return;
      list.value = res;
      status.value = "success";
    } catch (e) {
      if (seq !== listSeq) return;
      error.value = e;
      status.value = "error";
    }
  };

  const refresh = () => fetchList(lastQuery);

  // --- detail ---
  const detail = ref<OrderDetail | null>(null);
  const detailStatus = ref<Status>("idle");
  const detailError = ref<unknown>(null);
  let detailSeq = 0;
  let detailSlug = "";

  const fetchDetail = async (slug: string) => {
    if (slug !== detailSlug) detail.value = null;
    detailSlug = slug;
    const seq = ++detailSeq;
    detailStatus.value = "pending";
    detailError.value = null;
    try {
      const res = await api<OrderDetail>(`/api/admin/orders/${slug}`);
      if (seq !== detailSeq) return;
      detail.value = res;
      detailStatus.value = "success";
    } catch (e) {
      if (seq !== detailSeq) return;
      detailError.value = e;
      detailStatus.value = "error";
    }
  };

  const refreshDetail = () => fetchDetail(detailSlug);

  // --- mutations (throw on failure; callers toast) ---
  const moveStage = async (slug: string, stage: OrderStage) => {
    detail.value = await api<OrderDetail>(`/api/admin/orders/${slug}`, { method: "PATCH", body: { stage } });
    return detail.value;
  };

  const addNote = async (slug: string, payload: { text: string; urgent: boolean }) => {
    detail.value = await api<OrderDetail>(`/api/admin/orders/${slug}/notes`, { method: "POST", body: payload });
    return detail.value;
  };

  const create = (input: CreateOrderInput) =>
    api<OrderRow>("/api/admin/orders", { method: "POST", body: input });

  return {
    list,
    status,
    error,
    pending,
    fetchList,
    refresh,
    detail,
    detailStatus,
    detailError,
    fetchDetail,
    refreshDetail,
    moveStage,
    addNote,
    create,
  };
});
