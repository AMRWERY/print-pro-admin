<template>
  <div class="space-y-5">
    <LazyVPageHeader
      title="System Parameters & Configuration"
      description="Store identity, money, commerce rules, security and integrations. Edit as many sections as you need, then save them together."
      :breadcrumb="[{ label: 'Dashboard', to: '/' }, { label: 'Settings' }]"
    >
      <template #actions>
        <LazyVMenu label="Export settings">
          <template #trigger="{ attrs, toggle }">
            <LazyVButton
              v-bind="attrs"
              variant="secondary"
              icon="lucide:download"
              icon-end="lucide:chevron-down"
              :disabled="!data"
              @click="toggle"
              >Export settings</LazyVButton
            >
          </template>
          <button
            type="button"
            role="menuitem"
            class="menu-item w-full"
            @click="exportSettings('pdf')"
          >
            <Icon name="lucide:file-text" size="16" aria-hidden="true" /> PDF ·
            saved settings
          </button>
          <button
            type="button"
            role="menuitem"
            class="menu-item w-full"
            @click="exportSettings('excel')"
          >
            <Icon name="lucide:file-spreadsheet" size="16" aria-hidden="true" />
            Excel · saved settings
          </button>
        </LazyVMenu>
      </template>
    </LazyVPageHeader>

    <LazyVErrorBanner
      v-if="error && !form"
      message="The settings could not be loaded. Check your connection and try again."
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
        aria-label="System settings"
        @submit.prevent="save"
      >
        <p class="meta flex flex-wrap items-center gap-x-3 gap-y-1">
          <span class="inline-flex items-center gap-1.5">
            <Icon name="lucide:history" size="14" aria-hidden="true" />
            Last saved {{ savedLabel }} by {{ data?.updatedBy }}
          </span>
        </p>

        <settings-store v-model="form" :changed="changedKeys" />

        <settings-finance v-model="form" :changed="changedKeys" />

        <settings-commerce v-model="form" :changed="changedKeys" />

        <settings-operations v-model="form" :changed="changedKeys" />

        <settings-system
          v-model="form"
          :changed="changedKeys"
          :secret-last4="data?.secretLast4 ?? '----'"
          :secret-rotated-at="data?.secretRotatedAt ?? ''"
          :dns="data?.dns ?? []"
          @rotate="rotateOpen = true"
        />

        <!-- Save bar: stays at the bottom while there are unsaved edits -->
        <Transition name="savebar">
          <div
            v-if="dirty"
            class="sticky bottom-4 z-20 flex flex-wrap items-center justify-between gap-3 rounded-card border border-yellow/60 bg-surface p-3 shadow-lg sm:px-4"
            role="region"
            aria-label="Unsaved changes"
          >
            <p class="flex items-center gap-2 text-sm" aria-live="polite">
              <Icon
                name="lucide:pencil"
                size="16"
                class="text-yellow"
                aria-hidden="true"
              />
              <span>
                Unsaved changes in
                <strong>{{ changedKeys.length }}</strong>
                section{{ changedKeys.length === 1 ? "" : "s" }}:
                <span class="text-mute">{{ changedNames }}</span>
              </span>
            </p>
            <div class="flex items-center gap-2">
              <LazyVButton
                variant="secondary"
                icon="lucide:undo-2"
                :disabled="saving"
                @click="discard"
                >Discard</LazyVButton
              >

              <LazyVButton type="submit" icon="lucide:save" :loading="saving"
                >Save &amp; apply</LazyVButton
              >
            </div>
          </div>
        </Transition>
      </form>
    </div>

    <!-- Rotate secret -->
    <LazyVDialog
      v-model:open="rotateOpen"
      title="Rotate the webhook signing secret?"
      description="The old secret stops working at once."
    >
      <p class="callout">
        <Icon
          name="lucide:triangle-alert"
          size="14"
          class="bullet-icon"
          aria-hidden="true"
        />
        Receivers that still verify with the old secret will reject our events
        until you give them the new one. Your other unsaved edits are kept.
      </p>
      <template #footer>
        <LazyVButton
          variant="secondary"
          :disabled="rotating"
          @click="rotateOpen = false"
          >Cancel</LazyVButton
        >

        <LazyVButton
          :loading="rotating"
          icon="lucide:refresh-cw"
          @click="rotateSecret"
          >Rotate secret</LazyVButton
        >
      </template>
    </LazyVDialog>
  </div>
</template>

<script lang="ts" setup>
import { sectionKeyLabel, sectionList } from "~/data/settings-meta";
import type {
  Settings,
  SettingsKey,
  SettingsResponse,
} from "~/types/admin/settings";

const toast = useToast();

// lazy: the page renders at once and shows a skeleton until the settings arrive.
const { data, error, refresh } = useFetch<SettingsResponse>(
  "/api/admin/settings",
  { lazy: true },
);

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
    toast.error("Some values need fixing", {
      description: "The first problem is highlighted.",
    });
    await focusFirstError();
    return;
  }
  saving.value = true;
  try {
    const res = await $fetch<SettingsResponse>("/api/admin/settings", {
      method: "PUT",
      body: form.value,
    });
    data.value = res;
    form.value = clone(res.settings);
    resetForm();
    toast.success("Settings saved", {
      description: "The new values are live across the platform.",
    });
  } catch {
    toast.error("Couldn't save the settings", {
      description: "Nothing was changed. Check the values and try again.",
    });
  } finally {
    saving.value = false;
  }
};

const discard = () => {
  if (!data.value) return;
  form.value = clone(data.value.settings);
  resetForm();
  toast.info("Changes discarded");
};

// --- Webhook secret: rotating doesn't touch the other edits ---
const rotateOpen = ref(false);
const rotating = ref(false);
const rotateSecret = async () => {
  rotating.value = true;
  try {
    const res = await $fetch<SettingsResponse>(
      "/api/admin/settings/rotate-secret",
      { method: "POST" },
    );
    data.value = res;
    rotateOpen.value = false;
    toast.success("Signing secret rotated", {
      description: `The new secret ends in ${res.secretLast4}.`,
    });
  } catch {
    toast.error("Couldn't rotate the secret", {
      description: "The old secret is still in use. Try again.",
    });
  } finally {
    rotating.value = false;
  }
};

// --- Section navigation: the active link follows the scroll ---
const active = ref(sectionList[0]!.id);
const reduced = usePreferredReducedMotion();

const goTo = (id: string) => {
  active.value = id;
  document.getElementById(id)?.scrollIntoView({
    behavior: reduced.value === "reduce" ? "auto" : "smooth",
    block: "start",
  });
};

let observer: IntersectionObserver | null = null;
const watchSections = async () => {
  await nextTick();
  observer?.disconnect();
  observer = new IntersectionObserver(
    (entries) => {
      const top = entries
        .filter((e) => e.isIntersecting)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
      if (top) active.value = top.target.id;
    },
    { rootMargin: "-96px 0px -65% 0px" },
  );
  for (const s of sectionList) {
    const el = document.getElementById(s.id);
    if (el) observer.observe(el);
  }
};
watch(
  () => !!form.value,
  (ready) => {
    if (ready && import.meta.client) watchSections();
  },
  { immediate: true, flush: "post" },
);
onBeforeUnmount(() => observer?.disconnect());

// --- Don't lose unsaved edits by leaving ---
onBeforeRouteLeave(() => {
  if (!dirty.value) return true;
  return window.confirm(
    "You have unsaved changes. Leave this page and discard them?",
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
            ? "On"
            : "Off"
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
      title: "System settings",
      subtitle: `${body.length} values · saved ${savedLabel.value}`,
      fileName: `system-settings-${new Date().toISOString().slice(0, 10)}`,
      head: ["Section", "Setting", "Value"],
      body,
    });
    toast.success("Settings exported");
  } catch {
    toast.error("Couldn't create the file", {
      description: "Try again in a moment.",
    });
  }
};

definePageMeta({
  layout: "admin",
});

useSeoMeta({
  title: "Settings",
  description: "Store, finance, commerce, security and integration settings.",
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