<template>
  <LazyVPanel title="Customer dossier inspector" icon="lucide:contact-round">
    <template #actions>
      <LazyVButton
        variant="icon"
        size="sm"
        icon="lucide:x"
        aria-label="Close inspector"
        @click="emit('close')"
      />
    </template>

    <div v-if="error" class="space-y-3">
      <LazyVErrorBanner
        message="This client could not be loaded."
        @retry="() => refresh()"
      />
    </div>

    <div v-else-if="!detail" class="space-y-3" aria-busy="true">
      <LazyVSkeletonLoader class="h-20" />

      <LazyVSkeletonLoader class="h-28" />

      <LazyVSkeletonLoader class="h-40" />
    </div>

    <div v-else class="space-y-5">
      <!-- Identity -->
      <div class="flex items-start gap-3">
        <LazyVAvatar :initials="detail.initials" shape="square" />
        <div class="min-w-0 flex-1">
          <h3 class="font-display text-xl font-bold leading-tight">
            {{ detail.name }}
          </h3>
          <p class="meta">{{ detail.role }}</p>
          <p class="meta">{{ detail.org }}</p>
          <p class="mt-1.5 flex flex-wrap items-center gap-1.5">
            <LazyVStatusBadge :tone="tierMeta[detail.tier].tone">{{
              tierMeta[detail.tier].label
            }}</LazyVStatusBadge>

            <LazyVStatusBadge
              :tone="statusMeta[detail.status].tone"
              :icon="statusMeta[detail.status].icon"
              >{{ statusMeta[detail.status].label }}</LazyVStatusBadge
            >
          </p>
        </div>
      </div>

      <!-- Numbers -->
      <dl class="grid grid-cols-2 gap-2">
        <div class="rounded-card border border-line bg-ink p-3">
          <dt class="label-caps">Lifetime value</dt>
          <dd class="font-display text-lg font-bold tabular-nums">
            {{ currency(detail.ltv, { maximumFractionDigits: 0 }) }}
          </dd>
        </div>
        <div class="rounded-card border border-line bg-ink p-3">
          <dt class="label-caps">Completed orders</dt>
          <dd class="font-display text-lg font-bold tabular-nums">
            {{ number(detail.orders) }}
          </dd>
        </div>
        <div class="rounded-card border border-line bg-ink p-3">
          <dt class="label-caps">Open orders</dt>
          <dd
            class="font-display text-lg font-bold tabular-nums"
            :class="detail.activeOrders && 'text-yellow'"
          >
            {{ number(detail.activeOrders) }}
          </dd>
        </div>
        <div class="rounded-card border border-line bg-ink p-3">
          <dt class="label-caps">Escrow trust rating</dt>
          <dd class="font-display text-lg font-bold tabular-nums text-success">
            {{ percent(detail.escrowRating) }}
          </dd>
        </div>
      </dl>

      <!-- Contact -->
      <section aria-labelledby="dossier-contact" class="space-y-2">
        <h4 id="dossier-contact" class="label-caps">
          Contact &amp; legal identity
        </h4>
        <dl
          class="space-y-2 rounded-card border border-line bg-ink p-3 text-sm"
        >
          <div>
            <dt class="label-caps">Primary email</dt>
            <dd class="break-all font-mono text-xs">
              <a
                :href="`mailto:${detail.email}`"
                class="hover:text-accent hover:underline"
                >{{ detail.email }}</a
              >
            </dd>
          </div>
          <div>
            <dt class="label-caps">Direct line</dt>
            <dd class="font-mono text-xs" dir="ltr">
              {{ detail.phone || "Not provided" }}
            </dd>
          </div>
          <div>
            <dt class="label-caps">Receiving depot</dt>
            <dd class="text-xs">{{ detail.depot || "Not provided" }}</dd>
          </div>
          <div>
            <dt class="label-caps">Tax / legal ID</dt>
            <dd class="font-mono text-xs" dir="ltr">
              {{ detail.taxId || "Not provided" }}
            </dd>
          </div>
          <div>
            <dt class="label-caps">Escrow settlement terms</dt>
            <dd class="text-xs">{{ detail.escrowTerms }}</dd>
          </div>
        </dl>
      </section>

      <!-- Internal notes: the same panel the order page uses -->
      <order-notes
        ref="notesRef"
        :notes="notes"
        :saving="saving"
        @add="addNote"
      />

      <!-- Recent requisitions -->
      <section aria-labelledby="dossier-orders" class="space-y-2">
        <h4 id="dossier-orders" class="label-caps">Recent requisitions</h4>
        <p
          v-if="!detail.recentOrders.length"
          class="rounded-card border border-dashed border-line p-3 text-sm text-mute"
        >
          No requisitions yet for this client.
        </p>
        <ul class="space-y-2">
          <li v-for="o in detail.recentOrders" :key="o.id">
            <NuxtLinkLocale
              :to="`/orders/${o.id.slice(1)}`"
              class="block rounded-card border border-line bg-ink p-3 text-sm transition duration-fast hover:border-accent/60"
            >
              <span class="flex items-center justify-between gap-2">
                <span
                  class="font-mono text-xs font-semibold text-accent"
                  dir="ltr"
                  >{{ o.id }}</span
                >
                <span class="font-mono text-xs font-semibold tabular-nums">{{
                  currency(o.amount, { maximumFractionDigits: 0 })
                }}</span>
              </span>
              <span class="block leading-snug">{{ o.title }}</span>
              <span class="meta block"
                >{{ o.stageLabel }} · {{ o.placedAt.slice(0, 10) }}</span
              >
            </NuxtLinkLocale>
          </li>
        </ul>
      </section>

      <!-- Actions -->
      <div class="flex flex-wrap items-center gap-2 border-t border-line pt-4">
        <LazyVButton to="/orders?create=1" icon="lucide:circle-plus"
          >Open new requisition</LazyVButton
        >

        <LazyVButton
          variant="secondary"
          icon="lucide:printer"
          :loading="printing"
          @click="print"
          >Print dossier</LazyVButton
        >
        <div class="ms-auto flex items-center gap-1.5">
          <LazyVButton
            variant="secondary"
            icon="lucide:pencil"
            @click="emit('edit', detail)"
            >Edit</LazyVButton
          >

          <LazyVButton
            variant="icon"
            icon="lucide:trash-2"
            :aria-label="`Delete ${detail.name}`"
            class="hover:!border-accent hover:!text-accent"
            @click="emit('remove', detail)"
          />
        </div>
      </div>
    </div>
  </LazyVPanel>
</template>

<script lang="ts" setup>
import { statusMeta, tierMeta } from "~/data/customer-meta";
import type { OrderNote } from "~/types/admin/orders";
import type { Customer, CustomerDetail } from "~/types/admin/customers";

const props = defineProps<{ id: string }>();

const emit = defineEmits<{
  edit: [customer: Customer];
  remove: [customer: Customer];
  close: [];
  changed: [];
}>();

const { number, currency, percent } = useFormatters();
const toast = useToast();

const {
  data: detail,
  error,
  refresh,
} = useFetch<CustomerDetail>(() => `/api/admin/customers/${props.id}`, {
  lazy: true,
  watch: [() => props.id],
});

// The order screen's notes panel expects `ago`; show the note's UTC time there.
const notes = computed<OrderNote[]>(() =>
  (detail.value?.notes ?? []).map((n) => ({
    id: n.id,
    author: n.author,
    ago: formatUtc(n.at),
    text: n.text,
    urgent: n.urgent,
  })),
);

const notesRef = ref<{ reset: () => void } | null>(null);
const saving = ref(false);

const addNote = async (payload: { text: string; urgent: boolean }) => {
  saving.value = true;
  try {
    detail.value = await $fetch<CustomerDetail>(
      `/api/admin/customers/${props.id}/notes`,
      { method: "POST", body: payload },
    );
    notesRef.value?.reset();
    toast.success("Note saved");
  } catch {
    toast.error("Couldn't save the note", {
      description: "Your text is kept. Try again.",
    });
  } finally {
    saving.value = false;
  }
};

const printing = ref(false);
const print = async () => {
  if (!detail.value) return;
  printing.value = true;
  try {
    await downloadCustomerPdf(detail.value);
    toast.success("Dossier PDF downloaded");
  } catch {
    toast.error("Couldn't create the PDF", {
      description: "Try again in a moment.",
    });
  } finally {
    printing.value = false;
  }
};

// The page calls this after an edit so the open dossier shows the new values.
defineExpose({ refresh });
</script>