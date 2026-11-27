<template>
  <div class="space-y-5">
    <LazyVPageHeader
      :title="$t('settings_ui.title')"
      :description="$t('settings_ui.description')"
      :breadcrumb="[{ label: $t('nav.dashboard'), to: '/' }, { label: $t('nav.settings') }]"
    >
      <template #actions>
        <LazyVMenu :label="$t('common_ui.export_settings')">
          <template #trigger="{ attrs, toggle }">
            <LazyVButton
              v-bind="attrs"
              variant="secondary"
              icon="lucide:download"
              icon-end="lucide:chevron-down"
              :disabled="!data"
              @click="toggle"
              >{{ $t('common_ui.export_settings') }}</LazyVButton
            >
          </template>
          <button
            type="button"
            role="menuitem"
            class="menu-item w-full"
            @click="exportSettings('pdf')"
          >
            <Icon name="lucide:file-text" size="16" aria-hidden="true" /> PDF ·
            {{ $t('common_ui.saved') }}
          </button>
          <button
            type="button"
            role="menuitem"
            class="menu-item w-full"
            @click="exportSettings('excel')"
          >
            <Icon name="lucide:file-spreadsheet" size="16" aria-hidden="true" />
            Excel · {{ $t('common_ui.saved') }}
          </button>
        </LazyVMenu>
      </template>
    </LazyVPageHeader>

    <LazyVErrorBanner
      v-if="error && !form"
      :message="$t('common_ui.connection_error')"
      @retry="() => refresh()"
    />

    <!-- Loading: the navigation and a few sections, shaped like the real page -->
    <div
      v-else-if="!form"
      class="grid items-start gap-4 xl:grid-cols-[15rem_minmax(0,1fr)]"
      aria-busy="true"
    >
      <LazyVSkeletonLoader class="hidden h-96 xl:block" />

      <div class="space-y-4">
        <LazyVSkeletonLoader v-for="n in 4" :key="n" class="h-64" />
      </div>
    </div>

    <div
      v-else
      class="grid items-start gap-4 xl:grid-cols-[15rem_minmax(0,1fr)]"
    >
      <div
        class="min-w-0 xl:sticky xl:top-24 xl:max-h-[calc(100vh-7rem)] xl:overflow-y-auto"
      >
        <settings-nav
          :sections="sectionList"
          :active="active"
          :changed="changedKeys"
          @go="goTo"
        />
      </div>

      <form
        class="min-w-0 space-y-4"
        novalidate
        :aria-label="$t('settings_ui.system_settings')"
        @submit.prevent="save"
      >
        <p class="meta flex flex-wrap items-center gap-x-3 gap-y-1">
          <span class="inline-flex items-center gap-1.5">
            <Icon name="lucide:history" size="14" aria-hidden="true" />
            {{ $t('settings_ui.last_saved_by', { time: savedLabel, user: data?.updatedBy }) }}
          </span>
        </p>

        <settings-store v-model="form" :changed="changedKeys" />


        <settings-commerce v-model="form" :changed="changedKeys" />

        <settings-inventory v-model="form" :changed="changedKeys" />

        <!-- Save bar: stays at the bottom while there are unsaved edits -->
        <Transition name="savebar">
          <div
            v-if="dirty"
            class="sticky bottom-4 z-20 flex flex-wrap items-center justify-between gap-3 rounded-card border border-yellow/60 bg-surface p-3 shadow-lg sm:px-4"
            role="region"
            :aria-label="$t('common_ui.unsaved_changes')"
          >
            <p class="flex items-center gap-2 text-sm" aria-live="polite">
              <Icon
                name="lucide:pencil"
                size="16"
                class="text-yellow"
                aria-hidden="true"
              />
              <span>
                {{ $t('settings_ui.unsaved_changes_msg', {
                  count: changedKeys.length,
                  s: changedKeys.length === 1 ? '' : 's',
                  names: changedNames
                }) }}
              </span>
            </p>
            <div class="flex items-center gap-2">
              <LazyVButton
                variant="secondary"
                icon="lucide:undo-2"
                :disabled="saving"
                @click="discard"
                >{{ $t('btn.discard') }}</LazyVButton
              >

              <LazyVButton type="submit" icon="lucide:save" :loading="saving"
                >{{ $t('settings_ui.save_apply') }}</LazyVButton
              >
            </div>
          </div>
        </Transition>
      </form>
    </div>

  </div>
</template>

<script lang="ts" setup>
import { sectionKeyLabel, sectionList } from "~/data/settings-meta";
import type {
  Settings,
  SettingsKey,
} from "~/types/admin/settings";

const toast = useToast();
const { t } = useI18n();

// The page renders at once and shows a skeleton until the settings arrive.
const store = useSettingsStore();
const { data, error } = storeToRefs(store);
data.value = null; // never build the form from a previous visit's copy
const refresh = () => store.refresh();
onMounted(() => store.fetchSettings());

// The form is a copy, so edits never touch the saved values until they are saved.
const form = ref<Settings | null>(null);
const clone = (s: Settings): Settings => JSON.parse(JSON.stringify(s));

// The form is only built after the page has mounted. The server always renders the skeleton,
// while the browser may already hold the fetched data, so building it earlier would not match.
const mounted = useMounted();
watch(
  [data, mounted],
  ([res, ready]) => {
    if (res && ready && !form.value) form.value = clone(res.settings);
  },
  { immediate: true },
);

const changedKeys = computed<SettingsKey[]>(() => {
  const saved = data.value?.settings;
  if (!saved || !form.value) return [];
  return (Object.keys(saved) as SettingsKey[]).filter(
    (k) => JSON.stringify(saved[k]) !== JSON.stringify(form.value![k]),
  );
});
const dirty = computed(() => changedKeys.value.length > 0);
const changedNames = computed(() =>
  changedKeys.value.map((k) => sectionKeyLabel[k]).join(", "),
);

const savedLabel = computed(() =>
  data.value
    ? new Date(data.value.updatedAt).toLocaleString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "UTC",
        timeZoneName: "short",
      })
    : "",
);

// --- Save ---
const { validate, resetForm } = useForm();
const saving = ref(false);

const focusFirstError = async () => {
  await nextTick();
  const el = document.querySelector<HTMLElement>("[aria-invalid='true']");
  el?.scrollIntoView({ block: "center" });
  el?.focus({ preventScroll: true });
};

const save = async () => {
  if (!form.value || saving.value) return;
  const { valid } = await validate();
  if (!valid) {
    toast.error(t('settings_ui.toast_validation_error'), {
      description: t('settings_ui.toast_validation_error_desc'),
    });
    await focusFirstError();
    return;
  }
  saving.value = true;
  try {
    const res = await store.save(form.value);
    form.value = clone(res.settings);
    resetForm();
    toast.success(t('settings_ui.toast_saved'), {
      description: t('settings_ui.toast_saved_desc'),
    });
  } catch {
    toast.error(t('settings_ui.toast_save_error'), {
      description: t('common_ui.try_again'),
    });
  } finally {
    saving.value = false;
  }
};

const discard = () => {
  if (!data.value) return;
  form.value = clone(data.value.settings);
  resetForm();
  toast.info(t('settings_ui.toast_discarded'));
};

// --- Section navigation: the active link follows the scroll ---
const active = ref(sectionList[0]!.id);
const reduced = usePreferredReducedMotion();

// A section the visitor clicked stays selected until they scroll by hand: a short last section can never reach the
// top of the page, so the scroll position alone would pick the one before it.
let pinned = false;

const goTo = (id: string) => {
  active.value = id;
  pinned = true;
  document.getElementById(id)?.scrollIntoView({
    behavior: reduced.value === "reduce" ? "auto" : "smooth",
    block: "start",
  });
};

/** The current section: the last one whose top has passed a line near the top, or the last one at the page bottom. */
const syncActive = () => {
  if (pinned || !form.value) return;
  const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
  if (atBottom) {
    active.value = sectionList[sectionList.length - 1]!.id;
    return;
  }
  const line = 96 + window.innerHeight * 0.25;
  let current = sectionList[0]!.id;
  for (const s of sectionList) {
    const el = document.getElementById(s.id);
    if (el && el.getBoundingClientRect().top <= line) current = s.id;
  }
  active.value = current;
};
if (import.meta.client) {
  useEventListener(window, "scroll", syncActive, { passive: true });
  // Scrolling by hand (wheel, touch or keys) hands control back to the scroll position.
  const release = () => {
    pinned = false;
  };
  useEventListener(window, "wheel", release, { passive: true });
  useEventListener(window, "touchmove", release, { passive: true });
  useEventListener(window, "keydown", (e: KeyboardEvent) => {
    if (["ArrowDown", "ArrowUp", "PageDown", "PageUp", "Home", "End", " "].includes(e.key)) release();
  });
}
watch(
  () => !!form.value,
  async (ready) => {
    if (!ready) return;
    await nextTick();
    syncActive();
  },
  { immediate: true, flush: "post" },
);

// --- Don't lose unsaved edits by leaving ---
onBeforeRouteLeave(() => {
  if (!dirty.value) return true;
  return window.confirm(
    t('settings_ui.leave_confirm'),
  );
});
useEventListener("beforeunload", (e: BeforeUnloadEvent) => {
  if (dirty.value) e.preventDefault();
});

// --- Export: the saved settings as a Setting / Value table ---
const flatten = (value: unknown, path: string, out: [string, string][]) => {
  if (Array.isArray(value) && value.some((v) => typeof v === "object")) {
    value.forEach((v, i) => flatten(v, `${path}[${i + 1}]`, out));
  } else if (value && typeof value === "object") {
    for (const [k, v] of Object.entries(value)) flatten(v, `${path}.${k}`, out);
  } else {
    out.push([
      path,
      Array.isArray(value)
        ? value.join(", ")
        : typeof value === "boolean"
          ? value
            ? t('settings_ui.value_on')
            : t('settings_ui.value_off')
          : String(value ?? ""),
    ]);
  }
};

const exportSettings = async (format: "pdf" | "excel") => {
  const saved = data.value?.settings;
  if (!saved) return;
  const body: (string | number)[][] = [];
  for (const key of Object.keys(saved) as SettingsKey[]) {
    const rows: [string, string][] = [];
    flatten(saved[key], key, rows);
    for (const [path, value] of rows)
      body.push([sectionKeyLabel[key], path.replace(`${key}.`, ""), value]);
  }
  try {
    await downloadTable(format, {
      title: t('settings_ui.system_settings'),
      subtitle: t('settings_ui.export_subtitle', {
        count: body.length,
        time: savedLabel.value,
      }),
      fileName: `system-settings-${new Date().toISOString().slice(0, 10)}`,
      head: [
        t('settings_ui.export_col_section'),
        t('settings_ui.export_col_setting'),
        t('settings_ui.export_col_value'),
      ],
      body,
    });
    toast.success(t('settings_ui.toast_exported'));
  } catch {
    toast.error(t('settings_ui.toast_export_error'), {
      description: t('common_ui.try_again'),
    });
  }
};

definePageMeta({
  layout: "admin",
});

useSeoMeta({
  title: () => t('settings_ui.seo_title'),
  description: () => t('settings_ui.seo_description'),
});
</script>

<style scoped>
.savebar-enter-active,
.savebar-leave-active {
  transition:
    opacity 200ms ease,
    transform 200ms ease;
}

.savebar-enter-from,
.savebar-leave-to {
  opacity: 0;
  transform: translateY(8px);
}
@media (prefers-reduced-motion: reduce) {
  .savebar-enter-active,
  .savebar-leave-active {
    transition: opacity 150ms ease;
  }

  .savebar-enter-from,
  .savebar-leave-to {
    transform: none;
  }
}
</style>