<template>
  <LazyVPanel
    :title="$t('analytics_ui.funnel_title')"
    :subtitle="$t('analytics_ui.funnel_subtitle')"
    icon="lucide:funnel"
  >
    <template v-if="funnel" #actions>
      <LazyVStatusBadge tone="success" icon="lucide:trending-up"
        >{{ $t('analytics_ui.yield_value', { value: percent(funnel.conversion, 2) }) }}</LazyVStatusBadge
      >
    </template>

    <div v-if="!funnel" class="space-y-3" aria-busy="true">
      <LazyVSkeletonLoader v-for="n in 5" :key="n" class="h-10" />
    </div>

    <template v-else>
      <ol class="space-y-3">
        <li v-for="(s, i) in funnel.stages" :key="s.key">
          <p
            class="flex flex-wrap items-baseline justify-between gap-x-3 text-sm"
          >
            <span>
              <span class="font-mono text-xs text-mute">{{ i + 1 }}.</span>
              {{ $t('analytics_ui.stage_' + s.key) }}
            </span>
            <span class="font-mono text-xs tabular-nums"
              >{{ number(s.count) }}
              <span class="text-mute"
                >({{ percent(s.pct, s.pct < 10 ? 2 : 1) }})</span
              ></span
            >
          </p>
          <LazyVMeter
            class="mt-1"
            :value="Math.max(s.pct, 1.5)"
            :tone="tones[i]!"
            :label="$t('analytics_ui.stage_session_share', { name: $t('analytics_ui.stage_' + s.key), value: percent(s.pct, 1) })"
          />
          <p class="meta mt-0.5">
            {{ $t('analytics_ui.stage_' + s.key + '_hint')
            }}<template v-if="s.drop !== null">
              ·
              <span class="text-accent"
                >{{ $t('analytics_ui.drop_off_value', { value: percent(s.drop, 1) }) }}</span
              ></template
            >
          </p>
        </li>
      </ol>

      <p
        class="mt-4 flex items-center justify-between gap-2 rounded-card border border-line bg-ink px-3 py-2 font-mono text-xs"
      >
        <span class="flex items-center gap-1.5 text-mute"
          ><Icon name="lucide:clock" size="14" aria-hidden="true" />
          {{ $t('analytics_ui.b2b_velocity') }}</span
        >
        <span class="font-semibold text-success"
          >{{ $t('analytics_ui.median_hours', { n: funnel.velocityHours }) }}</span
        >
      </p>
    </template>
  </LazyVPanel>
</template>

<script lang="ts" setup>
import type { AnalyticsResponse } from "~/types/admin/analytics";
import type { Tone } from "~/types/admin/dashboard";

defineProps<{ funnel?: AnalyticsResponse["funnel"] | null }>();

const { number, percent } = useFormatters();

// Colour moves from neutral at the top of the funnel to accent at the end.
const tones: Tone[] = ["neutral", "info", "warning", "warning", "accent"];
</script>