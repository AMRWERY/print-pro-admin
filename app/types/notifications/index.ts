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