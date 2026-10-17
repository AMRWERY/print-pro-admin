<template>
  <nav aria-label="Settings sections">
    <!-- Narrow screens: one scrolling row. Wide screens: a grouped list that stays in view. -->
    <ul class="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1 xl:hidden">
      <li v-for="s in sections" :key="s.id" class="shrink-0">
        <a
          :href="`#${s.id}`"
          class="flex items-center gap-1.5 whitespace-nowrap rounded-control border px-3 py-1.5 font-mono text-xs transition duration-fast active:scale-95 focus-visible:ring-2 focus-visible:ring-cyan"
          :class="
            active === s.id
              ? 'border-accent bg-accent text-onaccent'
              : 'border-line bg-surface text-mute hover:border-accent/60 hover:text-paper'
          "
          :aria-current="active === s.id ? 'location' : undefined"
          @click.prevent="emit('go', s.id)"
        >
          {{ s.label }}
          <span
            v-if="changed.includes(s.key)"
            class="h-1.5 w-1.5 rounded-full bg-yellow"
            aria-hidden="true"
          />
          <span v-if="changed.includes(s.key)" class="sr-only"
            >(unsaved changes)</span
          >
        </a>
      </li>
    </ul>

    <div class="card hidden p-3 xl:block">
      <div v-for="g in groups" :key="g.name" class="mb-3 last:mb-0">
        <p class="label-caps px-2 pb-1">{{ g.name }}</p>
        <ul>
          <li v-for="s in g.items" :key="s.id">
            <a
              :href="`#${s.id}`"
              class="flex items-center justify-between gap-2 rounded-control px-2 py-1.5 text-sm transition-colors duration-fast focus-visible:ring-2 focus-visible:ring-cyan"
              :class="
                active === s.id
                  ? 'bg-accent-soft font-semibold text-accent'
                  : 'text-mute hover:bg-raised hover:text-paper'
              "
              :aria-current="active === s.id ? 'location' : undefined"
              @click.prevent="emit('go', s.id)"
            >
              {{ s.label }}
              <span
                v-if="changed.includes(s.key)"
                class="h-2 w-2 shrink-0 rounded-full bg-yellow"
                aria-hidden="true"
              />
              <span v-if="changed.includes(s.key)" class="sr-only"
                >(unsaved changes)</span
              >
            </a>
          </li>
        </ul>
      </div>
    </div>
  </nav>
</template>

<script lang="ts" setup>
import type { SettingsSectionMeta } from "~/data/settings-meta";
import type { SettingsKey } from "~/types/admin/settings";

const props = defineProps<{
  sections: SettingsSectionMeta[];
  active: string;
  /** Parts of the settings with unsaved edits. */
  changed: SettingsKey[];
}>();

const emit = defineEmits<{ go: [id: string] }>();

const groups = computed(() => {
  const out: { name: string; items: SettingsSectionMeta[] }[] = [];
  for (const s of props.sections) {
    const last = out[out.length - 1];
    if (last?.name === s.group) last.items.push(s);
    else out.push({ name: s.group, items: [s] });
  }
  return out;
});
</script>