import type { Settings, SettingsResponse } from "~/types/admin/settings";

/** System settings: the saved values, save, and webhook-secret rotation. */
export const useSettingsStore = defineStore("settings", () => {
  const data = ref<SettingsResponse | null>(null);
  const status = ref<"idle" | "pending" | "success" | "error">("idle");
  const error = ref<unknown>(null);
  const pending = computed(() => status.value === "pending");

  const fetchSettings = async () => {
    status.value = "pending";
    try {
      data.value = await api<SettingsResponse>("/api/admin/settings");
      error.value = null;
      status.value = "success";
    } catch (e) {
      error.value = e;
      status.value = "error";
    }
  };

  const refresh = fetchSettings;

  const save = async (body: Settings) => {
    const res = await api<SettingsResponse>("/api/admin/settings", { method: "PUT", body });
    data.value = res;
    return res;
  };

  const rotateSecret = async () => {
    const res = await api<SettingsResponse>("/api/admin/settings/rotate-secret", { method: "POST" });
    data.value = res;
    return res;
  };

  return { data, status, error, pending, fetchSettings, refresh, save, rotateSecret };
});
