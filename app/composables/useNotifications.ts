import type { AdminNotification } from "~/types/notifications";

// There is no notifications API yet, so the feed starts empty.
const seed = (): AdminNotification[] => [];

/** Shared notification list for the header bell and its dialog. */
export const useNotifications = () => {
  const items = useState<AdminNotification[]>("admin-notifications", seed);

  /** Whether the side panel is open (the bell lives in the header, the panel in the layout). */
  const open = useState("admin-notifications-open", () => false);

  const unread = computed(() => items.value.filter((n) => !n.read).length);

  const markRead = (id: number) => {
    const n = items.value.find((x) => x.id === id);
    if (n) n.read = true;
  };
  const markAllRead = () => {
    items.value.forEach((n) => (n.read = true));
  };
  const clear = () => {
    items.value = [];
  };

  return { items, unread, open, markRead, markAllRead, clear };
};
