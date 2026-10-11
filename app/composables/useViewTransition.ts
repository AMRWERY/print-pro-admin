// Runs `update` inside a View Transition when the browser supports it and the
// user has not asked for reduced motion. Otherwise it just runs `update`.
export const useViewTransition = () => {
  const run = async (
    update: () => void | Promise<void>,
    options: { kind: "theme" | "locale"; origin?: { x: number; y: number } },
  ) => {
    const canAnimate =
      import.meta.client &&
      typeof document.startViewTransition === "function" &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!canAnimate) {
      await update();
      return;
    }

    const root = document.documentElement;
    root.dataset.vt = options.kind;

    const transition = document.startViewTransition(async () => {
      await update();
      await nextTick();
    });

    if (options.kind === "theme") {
      const { x, y } = options.origin ?? {
        x: window.innerWidth / 2,
        y: 0,
      };
      const radius = Math.hypot(
        Math.max(x, window.innerWidth - x),
        Math.max(y, window.innerHeight - y),
      );
      transition.ready
        .then(() =>
          root.animate(
            {
              clipPath: [
                `circle(0px at ${x}px ${y}px)`,
                `circle(${radius}px at ${x}px ${y}px)`,
              ],
            },
            {
              duration: 450,
              easing: "cubic-bezier(.22,.8,.3,1)",
              pseudoElement: "::view-transition-new(root)",
            },
          ),
        )
        .catch(() => {});
    }

    try {
      await transition.finished;
    } finally {
      delete root.dataset.vt;
    }
  };

  return { run };
};
