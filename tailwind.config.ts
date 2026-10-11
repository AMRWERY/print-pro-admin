import type { Config } from "tailwindcss";
import plugin from "tailwindcss/plugin";

// Colors resolve from CSS variables (app/assets/css/tailwind.css) so the same
// tokens power the dark (default) and light themes.
const token = (name: string) => `rgb(var(--c-${name}) / <alpha-value>)`;

export default {
  content: [
    "./app/components/**/*.{js,vue,ts}",
    "./app/layouts/**/*.vue",
    "./app/pages/**/*.vue",
    "./app/plugins/**/*.{js,ts}",
    "./app/app.vue",
    "./app/error.vue",
  ],
  theme: {
    extend: {
      colors: {
        ink: token("ink"),
        surface: token("surface"),
        raised: token("raised"),
        line: token("line"),
        paper: token("paper"),
        mute: token("mute"),
        sheet: token("sheet"),
        "sheet-ink": token("sheet-ink"),
        onprimary: token("onprimary"),
        accent: {
          DEFAULT: token("accent"),
          soft: "rgb(var(--c-accent) / 0.12)",
        },
        onaccent: token("onaccent"),
        success: {
          DEFAULT: token("success"),
          soft: "rgb(var(--c-success) / 0.12)",
        },
        cyan: { DEFAULT: token("cyan"), soft: "rgb(var(--c-cyan) / 0.1)" },
        magenta: {
          DEFAULT: token("magenta"),
          soft: "rgb(var(--c-magenta) / 0.12)",
        },
        yellow: {
          DEFAULT: token("yellow"),
          soft: "rgb(var(--c-yellow) / 0.12)",
        },
      },
      fontFamily: {
        display: [
          '"Reem Kufi"',
          '"IBM Plex Sans Arabic"',
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
        ],
        sans: [
          '"IBM Plex Sans Arabic"',
          '"IBM Plex Sans"',
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
        ],
      },
      fontSize: {
        // Micro sizes for dense labels/badges (replaces text-[9px] / [10px] / [11px]).
        "3xs": "9px",
        "2xs": "10px",
        "1xs": "11px",
        xs: ["12px", "1.6"],
        sm: ["14px", "1.7"],
        base: ["16px", "1.7"],
        xl: ["20px", "1.5"],
        "2xl": ["24px", "1.25"],
        "3xl": ["30px", "1.25"],
        "5xl": ["48px", "1.15"],
        "6xl": ["60px", "1.1"],
      },
      borderRadius: {
        tight: "4px",
        control: "6px",
        card: "8px",
        panel: "12px",
      },
      keyframes: {
        feed: {
          "0%": { transform: "translateY(-78%)" },
          "100%": { transform: "translateY(0)" },
        },
        rise: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        // Icon motion uses the individual translate/rotate/scale properties so it
        // never fights Tailwind's `transform` utilities (e.g. rtl:-scale-x-100).
        "icon-wiggle": {
          "0%, 100%": { rotate: "0deg" },
          "20%": { rotate: "-14deg" },
          "40%": { rotate: "12deg" },
          "60%": { rotate: "-8deg" },
          "80%": { rotate: "4deg" },
        },
        "icon-bob": {
          "0%, 100%": { translate: "0 0" },
          "40%": { translate: "0 -4px" },
          "70%": { translate: "0 1px" },
        },
        "icon-spin": { from: { rotate: "0deg" }, to: { rotate: "360deg" } },
        // Scroll reveal (see app/plugins/reveal.ts)
        "reveal-up": {
          from: { opacity: "0", translate: "0 24px" },
          to: { opacity: "1", translate: "0 0" },
        },
        "reveal-fade": { from: { opacity: "0" }, to: { opacity: "1" } },
        "reveal-scale": {
          from: { opacity: "0", scale: "0.95" },
          to: { opacity: "1", scale: "1" },
        },
        "reveal-start": {
          from: { opacity: "0", translate: "calc(var(--icon-dir) * -32px) 0" },
          to: { opacity: "1", translate: "0 0" },
        },
        // Infinite carousel: the track holds two identical halves, so sliding by
        // exactly 50% loops seamlessly. Direction follows the reading direction.
        // Skeleton sheen sweeps in the reading direction.
        shimmer: {
          from: { translate: "calc(var(--icon-dir) * -100%) 0" },
          to: { translate: "calc(var(--icon-dir) * 100%) 0" },
        },
        marquee: {
          from: { translate: "0 0" },
          to: { translate: "calc(var(--icon-dir) * -50%) 0" },
        },
        "icon-pop": {
          "0%": { scale: "0.4", opacity: "0" },
          "60%": { scale: "1.25", opacity: "1" },
          "100%": { scale: "1" },
        },
      },
      // Motion scale (design.md §27): fast 150–200ms, normal 200–300ms, page 250–400ms, large 350–500ms.
      transitionDuration: {
        fast: "150ms",
        normal: "250ms",
        page: "300ms",
        large: "450ms",
      },
      animation: {
        // Decorative live-dot pings stop after a few pulses instead of looping forever.
        ping: "ping 1s cubic-bezier(0,0,.2,1) 3",
        feed: "feed .5s cubic-bezier(.22,.8,.3,1) both",
        rise: "rise .25s ease-out both",
        "icon-wiggle": "icon-wiggle .4s ease-in-out",
        "icon-bob": "icon-bob .3s ease-out",
        "icon-spin": "icon-spin .5s cubic-bezier(.22,.8,.3,1)",
        "icon-pop": "icon-pop .3s cubic-bezier(.22,.8,.3,1) both",
        marquee: "marquee 40s linear infinite",
        shimmer: "shimmer 1.6s ease-in-out infinite",
        "reveal-up": "reveal-up .5s cubic-bezier(.22,.8,.3,1) both",
        "reveal-fade": "reveal-fade .5s ease-out both",
        "reveal-scale": "reveal-scale .5s cubic-bezier(.22,.8,.3,1) both",
        "reveal-start": "reveal-start .5s cubic-bezier(.22,.8,.3,1) both",
      },
    },
  },
  plugins: [
    require("@tailwindcss/typography"),
    require("@tailwindcss/forms"),
    require("@tailwindcss/container-queries"),
    require("tailwindcss-rtl"),
    // Icon motion system. Icons react when their nearest interactive host
    // (link, button, .group or [data-icon-host]) is hovered or keyboard-focused.
    //   (no class)      gentle scale-up on links/buttons
    //   .icon-nudge     slides toward the reading direction (arrows, chevrons) — RTL aware
    //   .icon-lift      rises slightly
    //   .icon-wiggle    rings/shakes once (user, phone, mail)
    //   .icon-bob       hops once (cart, bag)
    //   .icon-spin      turns once (globe, settings)
    // State changes use the `animate-icon-pop` utility (give the icon a :key).
    // Reduced motion is handled globally in tailwind.css.
    plugin(({ addBase, addComponents, theme }) => {
      const host =
        ":is(a, button, .group, [data-icon-host]):is(:hover, :focus-visible)";
      addBase({
        ":root": { "--icon-dir": "1" },
        '[dir="rtl"]': { "--icon-dir": "-1" },
      });
      addComponents({
        ".icon": {
          transition:
            "translate .2s ease-out, scale .2s ease-out, rotate .2s ease-out",
        },
        [`:is(a, button):is(:hover, :focus-visible):not(:disabled) .icon`]: {
          scale: "1.1",
        },
        [`${host} .icon-nudge`]: { translate: "calc(var(--icon-dir) * 3px) 0" },
        [`${host} .icon-lift`]: { translate: "0 -2px" },
        [`${host} .icon-wiggle`]: { animation: theme("animation.icon-wiggle") },
        [`${host} .icon-bob`]: { animation: theme("animation.icon-bob") },
        [`${host} .icon-spin`]: { animation: theme("animation.icon-spin") },
      });
      // Scroll reveal: .reveal is added by v-reveal; .is-visible starts the animation.
      // Animations (not transitions) so cards keep their own hover transitions.
      const play = (name: string) => ({
        animation: theme(`animation.${name}`),
        animationDelay: "var(--reveal-delay, 0ms)",
      });
      addComponents({
        ".reveal:not(.is-visible)": { opacity: "0" },
        ".reveal.is-visible": play("reveal-up"),
        '.reveal[data-reveal="fade"].is-visible': play("reveal-fade"),
        '.reveal[data-reveal="scale"].is-visible': play("reveal-scale"),
        '.reveal[data-reveal="start"].is-visible': play("reveal-start"),
      });
    }),
  ],
} satisfies Config;