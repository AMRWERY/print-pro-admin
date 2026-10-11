// v-reveal: animates an element in the first time it scrolls into view.
//
//   <div v-reveal>                         fade + rise (default)
//   <div v-reveal:fade>                    fade only
//   <div v-reveal:scale>                   fade + slight scale
//   <div v-reveal:start>                   slides in from the reading-start side (RTL aware)
//   <li v-reveal="{ delay: i * 80 }">      stagger lists
//
// The motion itself lives in tailwind.config.ts (.reveal / .is-visible). Nothing
// is hidden on the server, and elements already on screen at load are left alone,
// so there is no flash and no-JS users still see everything.

import type { RevealType, RevealOptions } from "~/types/reveal"

let observer: IntersectionObserver | undefined;

const getObserver = () =>
  (observer ??= new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add("is-visible");
        observer?.unobserve(entry.target);
      }
    },
    { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
  ));

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.directive<HTMLElement, RevealOptions | undefined>("reveal", {
    mounted(el, binding) {
      if (typeof IntersectionObserver === "undefined") return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.92 && rect.bottom > 0) return;

      const type = (binding.arg as RevealType | undefined) ?? binding.value?.type ?? "up";
      el.classList.add("reveal");
      el.dataset.reveal = type;
      el.style.setProperty("--reveal-delay", `${binding.value?.delay ?? 0}ms`);
      getObserver().observe(el);
    },
    unmounted(el) {
      observer?.unobserve(el);
    },
    getSSRProps: () => ({}),
  });
});
