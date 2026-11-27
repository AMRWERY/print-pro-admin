<template>
  <LazyVPanel
    :title="$t('orders_ui.shipment_title')"
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
            <dt class="label-caps">{{ $t('orders_ui.shipment_carrier') }}</dt>
            <dd class="font-medium">{{ shipment.carrier }}</dd>
          </div>
          <div>
            <dt class="label-caps">{{ $t('orders_ui.shipment_waybill') }}</dt>
            <dd class="flex items-center gap-2 font-mono text-xs" dir="ltr">
              {{ shipment.waybill }}
              <LazyVButton
                variant="icon"
                size="sm"
                icon="lucide:copy"
                :aria-label="$t('orders_ui.shipment_copy_aria')"
                @click="copy"
              />
            </dd>
          </div>
          <div>
            <dt class="label-caps">{{ $t('orders_ui.shipment_origin') }}</dt>
            <dd>{{ shipment.origin }}</dd>
          </div>
          <div>
            <dt class="label-caps">{{ $t('orders_ui.shipment_destination') }}</dt>
            <dd>{{ shipment.destination }}</dd>
          </div>
        </dl>
      </div>

      <div class="space-y-3 rounded-card border border-line bg-ink p-4">
        <p class="label-caps">{{ $t('orders_ui.shipment_parcel_details') }}</p>
        <dl class="grid grid-cols-3 gap-2 text-center">
          <div class="rounded-control border border-line bg-surface p-2">
            <dt class="label-caps">{{ $t('orders_ui.shipment_parcels') }}</dt>
            <dd class="font-mono text-sm font-semibold">
              {{ shipment.parcel.parcels }}
            </dd>
          </div>
          <div class="rounded-control border border-line bg-surface p-2">
            <dt class="label-caps">{{ $t('orders_ui.shipment_weight') }}</dt>
            <dd class="font-mono text-sm font-semibold">
              {{ shipment.parcel.weight }}
            </dd>
          </div>
          <div class="rounded-control border border-line bg-surface p-2">
            <dt class="label-caps">{{ $t('orders_ui.shipment_signature') }}</dt>
            <dd class="font-mono text-sm font-semibold">
              {{ shipment.parcel.signature }}
            </dd>
          </div>
        </dl>
        <div>
          <p class="label-caps mb-1">{{ $t('orders_ui.shipment_progress_label') }}</p>

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
const { t } = useI18n();

const copy = async () => {
  try {
    await navigator.clipboard.writeText(props.shipment.waybill);
    toast.success(t('orders_ui.shipment_copied'));
  } catch {
    toast.error(t('orders_ui.shipment_copy_error'), {
      description: t('orders_ui.shipment_copy_error_desc'),
    });
  }
};
</script>