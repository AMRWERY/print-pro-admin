<template>
  <div class="space-y-1.5" v-bind="wrapperAttrs()">
    <label
      v-if="label"
      :for="inputId"
      class="label"
      :class="hideLabel && 'sr-only'"
    >
      {{ label }}
      <span v-if="required" class="text-accent" aria-hidden="true">*</span>
      <span v-else-if="optional" class="font-normal text-mute">(optional)</span>
    </label>

    <!-- Trigger: a button that looks like a field and shows the chosen date -->
    <div class="relative">
      <button
        :id="inputId"
        ref="triggerEl"
        type="button"
        class="field flex items-center gap-2 text-start"
        :class="errorMessage && '!border-accent'"
        :disabled="disabled"
        aria-haspopup="dialog"
        :aria-expanded="open"
        :aria-controls="open ? panelId : undefined"
        :aria-invalid="errorMessage ? 'true' : undefined"
        :aria-describedby="describedBy"
        :aria-required="required || undefined"
        @click="toggle"
        @keydown.down.prevent="show"
      >
        <Icon
          name="lucide:calendar-days"
          size="16"
          class="shrink-0 text-mute"
          aria-hidden="true"
        />
        <span class="min-w-0 flex-1 truncate" :class="!selected && 'text-mute'">
          {{ selected ? longLabel(selected) : placeholder }}
        </span>
        <Icon
          name="lucide:chevron-down"
          size="16"
          class="shrink-0 text-mute transition-transform duration-200"
          :class="open && 'rotate-180'"
          aria-hidden="true"
        />
      </button>
      <LazyVButton
        v-if="clearable && selected && !disabled"
        variant="plain"
        class="absolute end-9 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-control text-mute transition-colors duration-200 hover:text-paper"
        aria-label="Clear date"
        @click="clear"
      >
        <Icon name="lucide:x" size="14" aria-hidden="true" />
      </LazyVButton>
    </div>

    <p
      v-if="hint && !errorMessage"
      :id="`${inputId}-hint`"
      class="text-xs text-mute"
    >
      {{ hint }}
    </p>
    <p
      v-if="errorMessage"
      :id="`${inputId}-error`"
      class="flex items-start gap-1.5 text-xs text-accent"
      role="alert"
    >
      <Icon
        name="lucide:circle-alert"
        size="14"
        class="mt-px shrink-0"
        aria-hidden="true"
      />{{ errorMessage }}
    </p>

    <!-- Popover (teleported so dialogs and scroll areas never clip it) -->
    <Teleport to="body">
      <Transition name="picker">
        <div v-if="open" class="fixed inset-0 z-[60] sm:pointer-events-none">
          <div
            class="absolute inset-0 bg-ink/60 backdrop-blur-[2px] sm:hidden"
            aria-hidden="true"
            @click="close()"
          />
          <div
            :id="panelId"
            ref="panelEl"
            role="dialog"
            aria-modal="true"
            :aria-label="label ? `Choose ${label}` : 'Choose a date'"
            class="picker-panel pointer-events-auto absolute inset-x-0 bottom-0 overflow-hidden rounded-t-panel border border-line bg-surface shadow-2xl shadow-black/60 sm:inset-x-auto sm:bottom-auto sm:w-80 sm:rounded-panel"
            :style="popStyle"
            @keydown="onKeydown"
          >
            <!-- Header -->
            <div
              class="flex items-center justify-between gap-2 border-b border-line bg-ink px-3 py-2.5"
            >
              <LazyVButton
                variant="icon"
                size="sm"
                :aria-label="prevLabel"
                :disabled="!canStep(-1)"
                @click="step(-1)"
              >
                <Icon
                  name="lucide:chevron-left"
                  size="16"
                  class="rtl:-scale-x-100"
                  aria-hidden="true"
                />
              </LazyVButton>

              <div
                class="flex items-center gap-1 font-display text-sm font-bold"
              >
                <button
                  v-if="view === 'days'"
                  type="button"
                  class="rounded-control px-2 py-1 transition-colors duration-200 hover:bg-raised"
                  aria-label="Choose month"
                  @click="setView('months')"
                >
                  {{ monthName(cursorM) }}
                </button>
                <button
                  v-if="view !== 'years'"
                  type="button"
                  class="rounded-control px-2 py-1 transition-colors duration-200 hover:bg-raised"
                  aria-label="Choose year"
                  @click="setView('years')"
                >
                  {{ num(cursorY) }}
                </button>
                <span v-else class="px-2 py-1"
                  >{{ num(yearPage) }} – {{ num(yearPage + 11) }}</span
                >
              </div>

              <LazyVButton
                variant="icon"
                size="sm"
                :aria-label="nextLabel"
                :disabled="!canStep(1)"
                @click="step(1)"
              >
                <Icon
                  name="lucide:chevron-right"
                  size="16"
                  class="rtl:-scale-x-100"
                  aria-hidden="true"
                />
              </LazyVButton>
            </div>

            <!-- Body -->
            <div class="relative overflow-hidden p-3">
              <Transition :name="`slide-${dir}`" mode="out-in">
                <!-- Days -->
                <div v-if="view === 'days'" :key="`d-${cursorY}-${cursorM}`">
                  <div
                    class="mb-1 grid grid-cols-7 text-center font-mono text-2xs tracking-wider text-mute"
                    aria-hidden="true"
                  >
                    <span v-for="w in weekdays" :key="w.long" class="py-1.5">{{
                      w.short
                    }}</span>
                  </div>
                  <div
                    class="grid grid-cols-7 gap-y-0.5"
                    role="grid"
                    :aria-label="`${monthName(cursorM)} ${num(cursorY)}`"
                  >
                    <button
                      v-for="c in cells"
                      :key="c.iso"
                      type="button"
                      role="gridcell"
                      :data-date="c.iso"
                      :tabindex="c.iso === focusIso ? 0 : -1"
                      :disabled="c.disabled"
                      :aria-selected="c.iso === selected"
                      :aria-current="c.today ? 'date' : undefined"
                      :aria-label="longLabel(c.iso)"
                      class="relative mx-auto grid h-9 w-9 place-items-center rounded-control text-sm transition-colors duration-150 disabled:cursor-not-allowed"
                      :class="cellClass(c)"
                      @click="pick(c.iso)"
                    >
                      {{ num(c.day) }}
                      <span
                        v-if="c.today && c.iso !== selected"
                        class="absolute bottom-1 h-0.5 w-3 rounded-full bg-accent"
                        aria-hidden="true"
                      />
                    </button>
                  </div>
                </div>

                <!-- Months -->
                <div
                  v-else-if="view === 'months'"
                  :key="`m-${cursorY}`"
                  class="grid grid-cols-3 gap-2 py-1"
                >
                  <button
                    v-for="m in 12"
                    :key="m"
                    type="button"
                    :disabled="monthDisabled(cursorY, m - 1)"
                    class="rounded-control border py-2.5 text-sm transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-30"
                    :class="
                      m - 1 === cursorM
                        ? 'border-accent bg-accent-soft font-semibold text-accent'
                        : 'border-transparent hover:bg-raised'
                    "
                    @click="pickMonth(m - 1)"
                  >
                    {{ monthName(m - 1, "short") }}
                  </button>
                </div>

                <!-- Years -->
                <div
                  v-else
                  :key="`y-${yearPage}`"
                  class="grid grid-cols-3 gap-2 py-1"
                >
                  <button
                    v-for="y in 12"
                    :key="y"
                    type="button"
                    :disabled="yearDisabled(yearPage + y - 1)"
                    class="rounded-control border py-2.5 text-sm transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-30"
                    :class="
                      yearPage + y - 1 === cursorY
                        ? 'border-accent bg-accent-soft font-semibold text-accent'
                        : 'border-transparent hover:bg-raised'
                    "
                    @click="pickYear(yearPage + y - 1)"
                  >
                    {{ num(yearPage + y - 1) }}
                  </button>
                </div>
              </Transition>
            </div>

            <!-- Shortcuts + footer -->
            <div class="space-y-2 border-t border-line bg-ink/60 px-3 py-2.5">
              <div v-if="presets.length" class="flex flex-wrap gap-1.5">
                <button
                  v-for="p in presets"
                  :key="p.label"
                  type="button"
                  class="chip transition-colors duration-150 hover:border-accent hover:text-paper"
                  @click="pick(p.iso)"
                >
                  {{ p.label }}
                </button>
              </div>
              <div class="flex items-center justify-between">
                <LazyVButton
                  variant="tertiary"
                  size="sm"
                  :disabled="todayDisabled"
                  @click="pick(todayIso)"
                  >Today</LazyVButton
                >
                <LazyVButton
                  v-if="clearable"
                  variant="tertiary"
                  size="sm"
                  @click="clear"
                  >Clear</LazyVButton
                >
                <LazyVButton variant="tertiary" size="sm" @click="close()"
                  >Close</LazyVButton
                >
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script lang="ts" setup>
/**
 * Date picker with the same vee-validate behaviour as <LazyVInput>. The value is an ISO
 * date string ("2026-10-12"), or "" when empty, so it round-trips with plain `ref("")`.
 *
 *   <LazyVDatePicker v-model="date" name="date" label="Session date" required
 *     :min="tomorrow" :rules="requiredText('Pick a date.')" />
 *
 * - Month, year and decade views; slide animation that follows the reading direction.
 * - Full keyboard support: arrows, PageUp/PageDown (Shift = year), Home/End, Enter, Esc.
 * - `min` / `max` / `isDateDisabled` grey out days; quick shortcuts (Tomorrow, +1 week…).
 * - Opens as a bottom sheet on phones and a popover (flipping above when needed) elsewhere.
 * - Follows the site locale (month names, digits, first day of the week).
 */
import type { Cell } from "~/types/shared/VDatePicker";

defineOptions({ inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    modelValue?: string | null;
    name?: string;
    label?: string;
    hideLabel?: boolean;
    rules?: unknown;
    hint?: string;
    required?: boolean;
    optional?: boolean;
    disabled?: boolean;
    placeholder?: string;
    /** Earliest selectable date (ISO). */
    min?: string;
    /** Latest selectable date (ISO). */
    max?: string;
    /** Extra rule for unavailable days, e.g. weekends or fully booked dates. */
    isDateDisabled?: (iso: string) => boolean;
    /** Show quick picks (Tomorrow, In a week, In a month). */
    shortcuts?: boolean;
    clearable?: boolean;
    /** 0 = Sunday … 6 = Saturday. Defaults to the locale's first day. */
    weekStart?: number;
  }>(),
  { placeholder: "Select a date", shortcuts: true },
);

const emit = defineEmits<{ "update:modelValue": [value: string] }>();

const { locale } = useI18n();

const {
  inputId,
  value,
  errorMessage,
  validate,
  describedBy,
  wrapperAttrs,
  commit,
  recheck,
  onBlur,
} = useFormField(props as never, (v) => emit("update:modelValue", v as string));

// ---------- date helpers (always local time, never UTC) ----------
const pad = (n: number) => String(n).padStart(2, "0");

const toIso = (y: number, m: number, d: number) =>
  `${y}-${pad(m + 1)}-${pad(d)}`;

const fromIso = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number) as [number, number, number];
  return new Date(y, m - 1, d);
};

const dateIso = (d: Date) => toIso(d.getFullYear(), d.getMonth(), d.getDate());

const addDays = (iso: string, n: number) => {
  const d = fromIso(iso);
  d.setDate(d.getDate() + n);
  return dateIso(d);
};

const addMonths = (iso: string, n: number) => {
  const d = fromIso(iso);
  const day = d.getDate();
  d.setDate(1);
  d.setMonth(d.getMonth() + n);
  d.setDate(
    Math.min(day, new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate()),
  );
  return dateIso(d);
};

const todayIso = dateIso(new Date());

const selected = computed(() => {
  const v = value.value;
  return typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : "";
});

const isDisabled = (iso: string) =>
  (!!props.min && iso < props.min) ||
  (!!props.max && iso > props.max) ||
  !!props.isDateDisabled?.(iso);
const todayDisabled = computed(() => isDisabled(todayIso));

// ---------- locale formatting ----------
const fmtLong = computed(
  () =>
    new Intl.DateTimeFormat(locale.value, {
      weekday: "short",
      day: "numeric",
      month: "long",
      year: "numeric",
    }),
);
const fmtNum = computed(
  () => new Intl.NumberFormat(locale.value, { useGrouping: false }),
);
const num = (n: number) => fmtNum.value.format(n);
const longLabel = (iso: string) => fmtLong.value.format(fromIso(iso));
const monthName = (m: number, style: "long" | "short" = "long") =>
  new Intl.DateTimeFormat(locale.value, { month: style }).format(
    new Date(2024, m, 1),
  );

const firstDay = computed(() => {
  if (props.weekStart !== undefined) return props.weekStart;
  try {
    const info = new Intl.Locale(locale.value) as unknown as {
      getWeekInfo?: () => { firstDay: number };
      weekInfo?: { firstDay: number };
    };
    const fd = (info.getWeekInfo?.() ?? info.weekInfo)?.firstDay; // 1 = Monday … 7 = Sunday
    if (fd) return fd % 7;
  } catch {
    /* fall through */
  }
  return locale.value.startsWith("ar") ? 6 : 0;
});
const weekdays = computed(() =>
  Array.from({ length: 7 }, (_, i) => {
    const d = new Date(2024, 0, 7 + ((firstDay.value + i) % 7)); // 2024-01-07 is a Sunday
    return {
      short: new Intl.DateTimeFormat(locale.value, {
        weekday: "narrow",
      }).format(d),
      long: new Intl.DateTimeFormat(locale.value, { weekday: "long" }).format(
        d,
      ),
    };
  }),
);

// ---------- popover state ----------
const open = ref(false);
const view = ref<"days" | "months" | "years">("days");
const dir = ref<"next" | "prev">("next");
const cursorY = ref(0);
const cursorM = ref(0);
const focusIso = ref("");
const yearPage = ref(0);

const triggerEl = ref<HTMLElement>();
const panelEl = ref<HTMLElement>();
const panelId = `${useId()}-picker`;

const syncCursor = (iso: string) => {
  const d = fromIso(iso);
  cursorY.value = d.getFullYear();
  cursorM.value = d.getMonth();
  focusIso.value = iso;
};

const clampToRange = (iso: string) =>
  props.min && iso < props.min
    ? props.min
    : props.max && iso > props.max
      ? props.max
      : iso;

const show = async () => {
  if (props.disabled || open.value) return;
  view.value = "days";
  syncCursor(clampToRange(selected.value || todayIso));
  open.value = true;
  await nextTick();
  place();
  focusCell();
};
const close = (refocus = true) => {
  if (!open.value) return;
  open.value = false;
  onBlur();
  if (refocus) triggerEl.value?.focus();
};
const toggle = () => (open.value ? close() : show());

onClickOutside(panelEl, () => close(false), { ignore: [triggerEl] });

// ---------- positioning ----------
const popStyle = ref<Record<string, string>>({});
const place = () => {
  const t = triggerEl.value;
  const p = panelEl.value;
  if (!t || !p || window.innerWidth < 640) {
    popStyle.value = {};
    return;
  }
  const r = t.getBoundingClientRect();
  const h = p.offsetHeight;
  const w = p.offsetWidth;
  const below = window.innerHeight - r.bottom;
  const top = below >= h + 12 || below >= r.top ? r.bottom + 8 : r.top - h - 8;
  const rtl = document.documentElement.dir === "rtl";
  let left = rtl ? r.right - w : r.left;
  left = Math.max(8, Math.min(left, window.innerWidth - w - 8));
  popStyle.value = { top: `${Math.max(8, top)}px`, left: `${left}px` };
};
useEventListener(window, "resize", () => open.value && place());
useEventListener(window, "scroll", () => open.value && place(), {
  capture: true,
  passive: true,
});

// ---------- grid ----------
const cells = computed<Cell[]>(() => {
  const first = new Date(cursorY.value, cursorM.value, 1);
  const lead = (first.getDay() - firstDay.value + 7) % 7;
  const start = new Date(cursorY.value, cursorM.value, 1 - lead);
  return Array.from({ length: 42 }, (_, i) => {
    const d = new Date(
      start.getFullYear(),
      start.getMonth(),
      start.getDate() + i,
    );
    const iso = dateIso(d);
    return {
      iso,
      day: d.getDate(),
      inMonth: d.getMonth() === cursorM.value,
      today: iso === todayIso,
      disabled: isDisabled(iso),
    };
  });
});

const cellClass = (c: Cell) => {
  if (c.iso === selected.value)
    return "bg-accent font-bold text-onaccent hover:brightness-110";
  if (c.disabled) return "text-mute/40 line-through decoration-mute/30";
  return [
    "hover:bg-raised",
    c.inMonth ? "text-paper" : "text-mute/60",
    c.iso === focusIso.value && "ring-1 ring-accent/60",
  ];
};

const presets = computed(() => {
  if (!props.shortcuts) return [];
  return [
    { label: "Tomorrow", iso: addDays(todayIso, 1) },
    { label: "In a week", iso: addDays(todayIso, 7) },
    { label: "In a month", iso: addMonths(todayIso, 1) },
  ].filter((p) => !isDisabled(p.iso));
});

// ---------- navigation ----------
const monthDisabled = (y: number, m: number) => {
  const first = toIso(y, m, 1);
  const last = toIso(y, m, new Date(y, m + 1, 0).getDate());
  return (
    (!!props.min && last < props.min) || (!!props.max && first > props.max)
  );
};
const yearDisabled = (y: number) =>
  (!!props.min && toIso(y, 11, 31) < props.min) ||
  (!!props.max && toIso(y, 0, 1) > props.max);

const canStep = (n: number) => {
  if (view.value === "days") {
    const m = cursorM.value + n;
    return !monthDisabled(
      cursorY.value + Math.floor(m / 12),
      ((m % 12) + 12) % 12,
    );
  }
  if (view.value === "months") return !yearDisabled(cursorY.value + n);
  return !yearDisabled(n < 0 ? yearPage.value - 1 : yearPage.value + 12);
};

const step = (n: 1 | -1) => {
  if (!canStep(n)) return;
  dir.value = n > 0 ? "next" : "prev";
  if (view.value === "days") {
    const d = new Date(cursorY.value, cursorM.value + n, 1);
    cursorY.value = d.getFullYear();
    cursorM.value = d.getMonth();
    focusIso.value = clampToRange(
      toIso(
        cursorY.value,
        cursorM.value,
        Math.min(
          fromIso(focusIso.value).getDate(),
          new Date(cursorY.value, cursorM.value + 1, 0).getDate(),
        ),
      ),
    );
  } else if (view.value === "months") cursorY.value += n;
  else yearPage.value += n * 12;
};

const setView = (v: "months" | "years") => {
  dir.value = "next";
  if (v === "years") yearPage.value = cursorY.value - (cursorY.value % 12);
  view.value = v;
};
const pickMonth = (m: number) => {
  dir.value = "prev";
  cursorM.value = m;
  focusIso.value = clampToRange(toIso(cursorY.value, m, 1));
  view.value = "days";
  nextTick(focusCell);
};
const pickYear = (y: number) => {
  dir.value = "prev";
  cursorY.value = y;
  view.value = "months";
};

const pick = (iso: string) => {
  if (isDisabled(iso)) return;
  commit(iso);
  recheck();
  close();
};
const clear = () => {
  commit("");
  recheck();
  close();
};

// ---------- keyboard ----------
const focusCell = () => {
  nextTick(() =>
    panelEl.value
      ?.querySelector<HTMLElement>(`[data-date="${focusIso.value}"]`)
      ?.focus(),
  );
};

const moveFocus = (iso: string) => {
  if (!iso || (props.min && iso < props.min) || (props.max && iso > props.max))
    return;
  const d = fromIso(iso);
  if (d.getFullYear() !== cursorY.value || d.getMonth() !== cursorM.value) {
    dir.value = iso > focusIso.value ? "next" : "prev";
    cursorY.value = d.getFullYear();
    cursorM.value = d.getMonth();
  }
  focusIso.value = iso;
  focusCell();
};

const onKeydown = (e: KeyboardEvent) => {
  if (e.key === "Escape") {
    e.stopPropagation(); // don't close the dialog behind the picker
    e.preventDefault();
    if (view.value !== "days") view.value = "days";
    else close();
    return;
  }
  if (e.key === "Tab") {
    // keep focus inside the picker
    const f = [
      ...(panelEl.value?.querySelectorAll<HTMLElement>(
        "button:not(:disabled):not([tabindex='-1'])",
      ) ?? []),
    ];
    if (!f.length) return;
    const first = f[0]!;
    const last = f[f.length - 1]!;
    if (e.shiftKey && document.activeElement === first)
      (e.preventDefault(), last.focus());
    else if (!e.shiftKey && document.activeElement === last)
      (e.preventDefault(), first.focus());
    return;
  }
  if (view.value !== "days" || !(e.target as HTMLElement).dataset.date) return;
  const rtl = document.documentElement.dir === "rtl";
  const map: Record<string, string> = {
    ArrowLeft: addDays(focusIso.value, rtl ? 1 : -1),
    ArrowRight: addDays(focusIso.value, rtl ? -1 : 1),
    ArrowUp: addDays(focusIso.value, -7),
    ArrowDown: addDays(focusIso.value, 7),
    PageUp: e.shiftKey
      ? addMonths(focusIso.value, -12)
      : addMonths(focusIso.value, -1),
    PageDown: e.shiftKey
      ? addMonths(focusIso.value, 12)
      : addMonths(focusIso.value, 1),
    Home: addDays(
      focusIso.value,
      -((fromIso(focusIso.value).getDay() - firstDay.value + 7) % 7),
    ),
    End: addDays(
      focusIso.value,
      6 - ((fromIso(focusIso.value).getDay() - firstDay.value + 7) % 7),
    ),
  };
  if (e.key in map) {
    e.preventDefault();
    moveFocus(map[e.key]!);
  }
};

const prevLabel = computed(
  () =>
    ({
      days: "Previous month",
      months: "Previous year",
      years: "Previous years",
    })[view.value],
);
const nextLabel = computed(
  () =>
    ({ days: "Next month", months: "Next year", years: "Next years" })[
      view.value
    ],
);

// Parent changes while open keep the calendar in step.
watch(selected, (iso) => iso && open.value && syncCursor(iso));

defineExpose({
  focus: () => triggerEl.value?.focus(),
  validate,
  open: show,
  close,
});
</script>

<style scoped>
/* Popover: fade + small rise (sheet slides up on phones). */
.picker-enter-active,
.picker-leave-active {
  transition: opacity 0.2s ease-out;
}

.picker-enter-active .picker-panel,
.picker-leave-active .picker-panel {
  transition:
    transform 0.2s ease-out,
    opacity 0.2s ease-out;
}

.picker-enter-from,
.picker-leave-to {
  opacity: 0;
}

.picker-enter-from .picker-panel,
.picker-leave-to .picker-panel {
  opacity: 0;
  transform: translateY(8px);
}

/* Month / view change: slide in the reading direction. */
.slide-next-enter-active,
.slide-next-leave-active,
.slide-prev-enter-active,
.slide-prev-leave-active {
  transition:
    opacity 0.15s ease-out,
    transform 0.2s ease-out;
}

.slide-next-enter-from,
.slide-prev-leave-to {
  opacity: 0;
  transform: translateX(calc(var(--icon-dir) * 16px));
}

.slide-next-leave-to,
.slide-prev-enter-from {
  opacity: 0;
  transform: translateX(calc(var(--icon-dir) * -16px));
}
</style>