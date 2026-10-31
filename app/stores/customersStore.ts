import type { Customer, CustomerDetail, CustomerInput, CustomersResponse } from "~/types/admin/customers";

type Status = "idle" | "pending" | "success" | "error";

/** Customer registry (paged list) and the open customer's dossier. */
export const useCustomersStore = defineStore("customers", () => {
  // --- list ---
  const list = ref<CustomersResponse | null>(null);
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
      const res = await api<CustomersResponse>("/api/admin/customers", { query });
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
  const detail = ref<CustomerDetail | null>(null);
  const detailStatus = ref<Status>("idle");
  const detailError = ref<unknown>(null);
  let detailSeq = 0;
  let detailId = "";

  const fetchDetail = async (id: string) => {
    if (id !== detailId) detail.value = null;
    detailId = id;
    const seq = ++detailSeq;
    detailStatus.value = "pending";
    detailError.value = null;
    try {
      const res = await api<CustomerDetail>(`/api/admin/customers/${id}`);
      if (seq !== detailSeq) return;
      detail.value = res;
      detailStatus.value = "success";
    } catch (e) {
      if (seq !== detailSeq) return;
      detailError.value = e;
      detailStatus.value = "error";
    }
  };

  const refreshDetail = () => fetchDetail(detailId);

  const addNote = async (id: string, payload: { text: string; urgent: boolean }) => {
    detail.value = await api<CustomerDetail>(`/api/admin/customers/${id}/notes`, { method: "POST", body: payload });
    return detail.value;
  };

  /** Customers to choose from in other screens (the order dialog). Returns [] on failure. */
  const fetchPicker = async (): Promise<Customer[]> => {
    try {
      return (await api<CustomersResponse>("/api/admin/customers", { query: { sort: "name", perPage: 50 } })).rows;
    } catch {
      return [];
    }
  };

  // --- mutations (throw on failure; callers toast / map 409 via statusOf) ---
  const create = (input: CustomerInput) => api<Customer>("/api/admin/customers", { method: "POST", body: input });

  const update = (id: string, input: CustomerInput) =>
    api<Customer>(`/api/admin/customers/${id}`, { method: "PATCH", body: input });

  const bulkDelete = (ids: string[]) => api("/api/admin/customers/bulk-delete", { method: "POST", body: { ids } });

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
    addNote,
    fetchPicker,
    create,
    update,
    bulkDelete,
  };
});
