import type { Theme } from "~/types/themes";

// Dark is the default theme. The cookie keeps SSR and client in sync.
export const useTheme = () => {
  const theme = useCookie<Theme>("theme", {
    default: () => "dark",
    sameSite: "lax",
  });
  const { run } = useViewTransition();

  // Pass the click event so the new theme expands from the button.
  const toggle = (event?: MouseEvent) => {
    const next: Theme = theme.value === "dark" ? "light" : "dark";
    const rect = (event?.currentTarget as HTMLElement | null)?.getBoundingClientRect();

    return run(
      () => {
        theme.value = next;
        // Apply synchronously so the View Transition captures the new state.
        document.documentElement.dataset.theme = next;
      },
      {
        kind: "theme",
        origin: rect
          ? { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
          : undefined,
      },
    );
  };
  return { theme, toggle };
};
