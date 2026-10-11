import type {
  ToastTone,
  ToastAction,
  Toast,
  ToastInput,
} from "~/types/shared/VToast";

const MAX_VISIBLE = 4;

const DEFAULT_MS: Record<ToastTone, number> = {
  neutral: 3500,
  info: 4000,
  success: 3500,
  warning: 5000,
  error: 6000,
};

let seq = 0;

/**
 * App-wide toasts. Call from any component; <VToast /> (mounted once in app.vue) shows them.
 *
 *   const toast = useToast();
 *   toast.success("Port saved");
 *   toast.error("Payment failed", { description: "Check your card and try again." });
 *   toast.show("Added to cart", { action: { label: "View cart", to: "/cart" } });
 *
 * The same message shown twice restarts instead of stacking; at most 4 are visible.
 */

export const useToast = () => {
  const toasts = useState<Toast[]>("toasts", () => []);

  const dismiss = (id: number) => {
    toasts.value = toasts.value.filter((t) => t.id !== id);
  };
  const clear = () => {
    toasts.value = [];
  };

  const show = (title: string, opts: ToastInput = {}) => {
    const tone = opts.tone ?? "neutral";
    const next: Toast = {
      ...opts,
      id: ++seq,
      tone,
      title,
      duration: opts.duration ?? DEFAULT_MS[tone],
    };
    const rest = toasts.value.filter(
      (t) =>
        !(
          t.tone === tone &&
          t.title === title &&
          t.description === opts.description
        ),
    );
    toasts.value = [...rest, next].slice(-MAX_VISIBLE);
    return next.id;
  };

  const make =
    (tone: ToastTone) =>
    (title: string, opts: Omit<ToastInput, "tone"> = {}) =>
      show(title, { ...opts, tone });

  return {
    toasts,
    show,
    dismiss,
    clear,
    success: make("success"),
    error: make("error"),
    warning: make("warning"),
    info: make("info"),
  };
};