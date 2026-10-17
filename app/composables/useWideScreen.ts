/**
 * True when the screen matches `query`, but only after the page has mounted.
 * The server can't know the screen size, so rendering from the raw media query would
 * differ from the server HTML on wide screens and cause a hydration mismatch.
 */
export const useWideScreen = (query = "(min-width: 1280px)") => {
  const mounted = useMounted();
  const matches = useMediaQuery(query);
  return computed(() => mounted.value && matches.value);
};
