<template>
  <LazyVPanel
    title="Shipment tracking & logistics telemetry"
    icon="lucide:truck"
  >
    <template #actions>
      <LazyVStatusBadge tone="warning" icon="lucide:truck">{{
        shipment.status
      }}</LazyVStatusBadge>
    </template>

    <div class="grid gap-4 lg:grid-cols-2">
      <div class="space-y-3 rounded-card border border-line bg-ink p-4">
        <dl class="space-y-3 text-sm">
          <div>
            <dt class="label-caps">Carrier logistics</dt>
            <dd class="font-medium">{{ shipment.carrier }}</dd>
          </div>
          <div>
            <dt class="label-caps">Waybill</dt>
            <dd class="flex items-center gap-2 font-mono text-xs" dir="ltr">
              {{ shipment.waybill }}
              <LazyVButton
                variant="icon"
                size="sm"
                icon="lucide:copy"
                aria-label="Copy waybill number"
                @click="copy"
              />
            </dd>
          </div>
          <div>
            <dt class="label-caps">Dispatch origin</dt>
            <dd>{{ shipment.origin }}</dd>
          </div>
          <div>
            <dt class="label-caps">Receiving dock</dt>
            <dd>{{ shipment.destination }}</dd>
          </div>
        </dl>
      </div>

      <div class="space-y-3 rounded-card border border-line bg-ink p-4">
        <p class="label-caps">Crate sensor pod</p>
        <dl class="grid grid-cols-3 gap-2 text-center">
          <div class="rounded-control border border-line bg-surface p-2">
            <dt class="label-caps">Chamber temp</dt>
            <dd class="font-mono text-sm font-semibold">
              {{ shipment.sensors.temp }}
            </dd>
          </div>
          <div class="rounded-control border border-line bg-surface p-2">
            <dt class="label-caps">Humidity</dt>
            <dd class="font-mono text-sm font-semibold">
              {{ shipment.sensors.humidity }}
            </dd>
          </div>
          <div class="rounded-control border border-line bg-surface p-2">
            <dt class="label-caps">Shock</dt>
            <dd class="font-mono text-sm font-semibold">
              {{ shipment.sensors.shock }}
            </dd>
          </div>
        </dl>
        <div>
          <p class="label-caps mb-1">24-hour telemetry · nominal integrity</p>

          <dashboard-sparkline :values="shipment.trace" />
        </div>
      </div>
    </div>
  </LazyVPanel>
</template>

<script lang="ts" setup>
import type { OrderDetail } from "~/types/admin/orders";

const props = defineProps<{ shipment: OrderDetail["shipment"] }>();

const toast = useToast();

const copy = async () => {
  try {
    await navigator.clipboard.writeText(props.shipment.waybill);
    toast.success("Waybill copied");
  } catch {
    toast.error("Couldn't copy", {
      description: "Select the waybill and copy it manually.",
    });
  }
};
</script>