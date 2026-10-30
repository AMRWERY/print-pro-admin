import type { BlockInput, BlockQuery, BlockRow, BlockStatus, BlocksResponse } from "~/types/admin/content";

/** Homepage content blocks: the listed page, plus every block mutation. */
export const useContentStore = defineStore("content", () => {
  const data = ref<BlocksResponse | null>(null);
  const status = ref<"idle" | "pending" | "success" | "error">("idle");
  const error = ref<unknown>(null);
  const pending = computed(() => status.value === "pending");

  let lastQuery: BlockQuery | null = null;
  let seq = 0;

  const fetchList = async (query: BlockQuery) => {
    lastQuery = { ...query };
    const mine = ++seq;
    status.value = "pending";
    try {
      const res = await api<BlocksResponse>("/api/admin/content", { query: lastQuery });
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

  const save = (id: string | null, body: BlockInput) =>
    api<BlockRow>(id ? `/api/admin/content/${id}` : "/api/admin/content", {
      method: id ? "PATCH" : "POST",
      body,
    });

  const setStatus = (id: string, next: BlockStatus) =>
    api<BlockRow>(`/api/admin/content/${id}/status`, { method: "POST", body: { status: next } });

  /**
   * Moves the rows on screen at once, then saves. On failure the caller gets the error
   * (and should refresh to put the list back).
   */
  const reorder = async (ids: string[]) => {
    if (data.value) {
      const byId = new Map(data.value.rows.map((r) => [r.id, r]));
      const positions = data.value.rows.map((r) => r.position).sort((a, c) => a - c);
      const next = ids.map((id) => byId.get(id)!);
      next.forEach((r, i) => (r.position = positions[i]!));
      data.value.rows = next;
    }
    await api("/api/admin/content/reorder", { method: "POST", body: { ids } });
  };

  const remove = (id: string) => api(`/api/admin/content/${id}`, { method: "DELETE" });

  const flush = () => api("/api/admin/content/flush", { method: "POST" });

  return { data, status, error, pending, fetchList, refresh, save, setStatus, reorder, remove, flush };
});
