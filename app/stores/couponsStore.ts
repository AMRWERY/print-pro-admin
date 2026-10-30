import type {
  CouponBulkAction,
  CouponInput,
  CouponQuery,
  CouponRow,
  CouponsResponse,
} from "~/types/admin/coupons";

/** The voucher ledger: the listed page, plus every voucher mutation. */
export const useCouponsStore = defineStore("coupons", () => {
  const data = ref<CouponsResponse | null>(null);
  const status = ref<"idle" | "pending" | "success" | "error">("idle");
  const error = ref<unknown>(null);
  const pending = computed(() => status.value === "pending");

  let lastQuery: CouponQuery | null = null;
  let seq = 0;

  const fetchList = async (query: CouponQuery) => {
    lastQuery = { ...query };
    const mine = ++seq;
    status.value = "pending";
    try {
      const res = await api<CouponsResponse>("/api/admin/coupons", { query: lastQuery });
      if (mine !== seq) return;
      data.value = res;
      error.value = null;
      status.value = "success";
    } catch (e) {
      if (mine !== seq) return;
      error.value = e;
      status.value = "error";
    }
  };

  const refresh = async () => {
    if (lastQuery) await fetchList(lastQuery);
  };

  const save = (id: string | null, body: CouponInput) =>
    api<CouponRow>(id ? `/api/admin/coupons/${id}` : "/api/admin/coupons", {
      method: id ? "PATCH" : "POST",
      body,
    });

  const bulk = (ids: string[], action: CouponBulkAction) =>
    api<{ changed: number }>("/api/admin/coupons/bulk", { method: "POST", body: { ids, action } });

  const remove = (ids: string[]) => bulk(ids, "delete");

  return { data, status, error, pending, fetchList, refresh, save, bulk, remove };
});
