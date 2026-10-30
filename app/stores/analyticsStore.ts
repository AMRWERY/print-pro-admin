import type { AnalyticsResponse, TopProductsResponse } from "~/types/admin/analytics";

type Status = "idle" | "pending" | "success" | "error";

/** Analytics report for the chosen period, and the paged top-products table. */
export const useAnalyticsStore = defineStore("analytics", () => {
  // --- report ---
  const report = ref<AnalyticsResponse | null>(null);
  const status = ref<Status>("idle");
  const error = ref<unknown>(null);
  const pending = computed(() => status.value === "idle" || status.value === "pending");
  let lastQuery: Record<string, unknown> = {};
  let seq = 0;

  const fetchReport = async (query: Record<string, unknown> = lastQuery) => {
    lastQuery = query;
    const mine = ++seq;
    status.value = "pending";
    error.value = null;
    try {
      const res = await api<AnalyticsResponse>("/api/admin/analytics", { query });
      if (mine !== seq) return;
      report.value = res;
      status.value = "success";
    } catch (e) {
      if (mine !== seq) return;
      error.value = e;
      status.value = "error";
    }
  };

  const refresh = () => fetchReport(lastQuery);

  // --- top products ---
  const top = ref<TopProductsResponse | null>(null);
  const topStatus = ref<Status>("idle");
  const topError = ref<unknown>(null);
  const topPending = computed(() => topStatus.value === "idle" || topStatus.value === "pending");
  let lastTopQuery: Record<string, unknown> = {};
  let topSeq = 0;

  const fetchTop = async (query: Record<string, unknown> = lastTopQuery) => {
    lastTopQuery = query;
    const mine = ++topSeq;
    topStatus.value = "pending";
    topError.value = null;
    try {
      const res = await api<TopProductsResponse>("/api/admin/analytics/top-products", { query });
      if (mine !== topSeq) return;
      top.value = res;
      topStatus.value = "success";
    } catch (e) {
      if (mine !== topSeq) return;
      topError.value = e;
      topStatus.value = "error";
    }
  };

  const refreshTop = () => fetchTop(lastTopQuery);

  /** One-off fetch for exports; leaves the table's state alone. */
  const loadTopForExport = (query: Record<string, unknown>) =>
    api<TopProductsResponse>("/api/admin/analytics/top-products", { query });

  return {
    report,
    status,
    error,
    pending,
    fetchReport,
    refresh,
    top,
    topStatus,
    topError,
    topPending,
    fetchTop,
    refreshTop,
    loadTopForExport,
  };
});
