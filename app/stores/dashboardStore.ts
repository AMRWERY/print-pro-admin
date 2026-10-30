import type { DashboardSummary, RangeKey, RevenueSeries } from "~/types/admin/dashboard";

type Status = "idle" | "pending" | "success" | "error";

/** Dashboard summary plus the revenue series for the chosen range. */
export const useDashboardStore = defineStore("dashboard", () => {
  const summary = ref<DashboardSummary | null>(null);
  const summaryStatus = ref<Status>("idle");
  const summaryError = ref<unknown>(null);
  let summarySeq = 0;

  const fetchSummary = async () => {
    const seq = ++summarySeq;
    summaryStatus.value = "pending";
    summaryError.value = null;
    try {
      const res = await api<DashboardSummary>("/api/admin/dashboard");
      if (seq !== summarySeq) return;
      summary.value = res;
      summaryStatus.value = "success";
    } catch (e) {
      if (seq !== summarySeq) return;
      summaryError.value = e;
      summaryStatus.value = "error";
    }
  };

  const series = ref<RevenueSeries | null>(null);
  const seriesStatus = ref<Status>("idle");
  const seriesError = ref<unknown>(null);
  const seriesPending = computed(() => seriesStatus.value === "idle" || seriesStatus.value === "pending");
  let seriesSeq = 0;
  let lastRange: RangeKey = "month";

  const fetchSeries = async (range: RangeKey = lastRange) => {
    lastRange = range;
    const seq = ++seriesSeq;
    seriesStatus.value = "pending";
    seriesError.value = null;
    try {
      const res = await api<RevenueSeries>("/api/admin/revenue", { query: { range } });
      if (seq !== seriesSeq) return;
      series.value = res;
      seriesStatus.value = "success";
    } catch (e) {
      if (seq !== seriesSeq) return;
      seriesError.value = e;
      seriesStatus.value = "error";
    }
  };

  const refreshSummary = () => fetchSummary();
  const refreshSeries = () => fetchSeries(lastRange);

  return {
    summary,
    summaryStatus,
    summaryError,
    fetchSummary,
    refreshSummary,
    series,
    seriesStatus,
    seriesError,
    seriesPending,
    fetchSeries,
    refreshSeries,
  };
});
