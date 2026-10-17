export type NotificationKind = "order" | "stock" | "customer" | "payment";

export interface AdminNotification {
  id: number;
  kind: NotificationKind;
  title: string;
  body: string;
  ago: string;
  read: boolean;
  to: string;
}

// Demo feed. When the app has a backend this seed goes away and the list comes from the API.
const seed = (): AdminNotification[] => [
  { id: 1, kind: "order", title: "New order #LP-948202", body: "Dr. Elena Vance placed a EGP 14,290 requisition.", ago: "5 min ago", read: false, to: "/orders" },
  { id: 2, kind: "stock", title: "Low stock: Hasselblad XCD 55mm", body: "2 units left, below the minimum of 5.", ago: "42 min ago", read: false, to: "/inventory" },
  { id: 3, kind: "payment", title: "Escrow released", body: "Zurich Kunsthaus Lab settled EGP 8,190.", ago: "2 h ago", read: false, to: "/orders" },
  { id: 4, kind: "customer", title: "New customer", body: "Galerie Max Hetzler verified their account.", ago: "Yesterday", read: true, to: "/customers" },
  { id: 5, kind: "stock", title: "Restock arrived", body: "12 rolls of Hahnemühle Photo Rag are in the depot.", ago: "Yesterday", read: true, to: "/inventory" },
];

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
