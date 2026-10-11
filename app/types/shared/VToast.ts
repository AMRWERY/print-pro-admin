export type ToastTone = "neutral" | "success" | "error" | "warning" | "info";

export interface ToastAction {
  label: string;
  /** Internal route (locale-aware). */
  to?: string;
  onClick?: () => void;
}

export interface Toast {
  id: number;
  tone: ToastTone;
  title: string;
  description?: string;
  icon?: string;
  /** Milliseconds on screen; 0 keeps it until dismissed. */
  duration: number;
  action?: ToastAction;
}

export type ToastInput = Partial<Omit<Toast, "id" | "title">>;
