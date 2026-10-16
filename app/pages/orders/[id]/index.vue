<template>
  <div class="space-y-5">
    <LazyVPageHeader
      :title="`Requisition ${orderId}`"
      :breadcrumb="[
        { label: 'Dashboard', to: '/' },
        { label: 'Orders', to: '/orders' },
        { label: orderId },
      ]"
    >
      <template #meta>
        <div v-if="detail" class="space-y-2">
          <p class="flex flex-wrap items-center gap-2">
            <LazyVStatusBadge :tone="tierMeta[detail.row.customer.tier].tone">{{
              tierMeta[detail.row.customer.tier].label
            }}</LazyVStatusBadge>

            <LazyVStatusBadge :tone="priorityMeta[detail.row.priority].tone">{{
              priorityMeta[detail.row.priority].label
            }}</LazyVStatusBadge>

            <LazyVStatusBadge
              :tone="stageMeta[detail.row.stage].escrowTone"
              :icon="stageMeta[detail.row.stage].escrowIcon"
              >{{ stageMeta[detail.row.stage].escrow }}</LazyVStatusBadge
            >

            <LazyVStatusBadge
              :tone="stageMeta[detail.row.stage].custodyTone"
              :icon="stageMeta[detail.row.stage].custodyIcon"
              >{{ stageMeta[detail.row.stage].custody }}</LazyVStatusBadge
            >
          </p>
          <p class="font-mono text-xs text-mute" dir="ltr">
            Created {{ formatUtc(detail.row.placedAt) }} · Valuation
            <span class="font-semibold text-paper">{{
              currency(detail.pricing.total, cents)
            }}</span>
            · Hash {{ detail.row.hex }}
          </p>
        </div>

        <LazyVSkeletonLoader v-else variant="line" class="w-72" />
      </template>

      <template #actions>
        <LazyVMenu label="Print and export">
          <template #trigger="{ attrs, toggle }">
            <LazyVButton
              v-bind="attrs"
              variant="secondary"
              icon="lucide:download"
              icon-end="lucide:chevron-down"
              :disabled="!detail"
              @click="toggle"
              >Download invoice</LazyVButton
            >
          </template>
          <button
            type="button"
            role="menuitem"
            class="menu-item w-full"
            :disabled="exporting"
            @click="exportAs('pdf')"
          >
            <Icon name="lucide:file-text" size="16" aria-hidden="true" />
            Download PDF
          </button>
          <button
            type="button"
            role="menuitem"
            class="menu-item w-full"
            :disabled="exporting"
            @click="exportAs('excel')"
          >
            <Icon name="lucide:file-spreadsheet" size="16" aria-hidden="true" />
            Download Excel
          </button>
        </LazyVMenu>

        <LazyVButton
          icon="lucide:shield-check"
          :disabled="!detail || detail.row.stage === 'settled'"
          @click="confirmOpen = true"
          >{{
            detail?.row.stage === "settled"
              ? "Escrow released"
              : "Fulfill & release escrow"
          }}</LazyVButton
        >
      </template>
    </LazyVPageHeader>

    <!-- The order does not exist -->
    <LazyVEmptyState
      v-if="notFound"
      icon="lucide:search-x"
      title="Requisition not found"
      :description="`There is no requisition ${orderId} in the ledger. It may have been mistyped or removed.`"
      eyebrow="LEDGER :: NOT_FOUND"
      tag="404"
      tag-tone="accent"
    >
      <LazyVButton
        to="/orders"
        icon="lucide:arrow-left"
        icon-class="rtl:-scale-x-100"
        >Back to orders</LazyVButton
      >
    </LazyVEmptyState>

    <LazyVErrorBanner
      v-else-if="error"
      message="This requisition could not be loaded. Check your connection and try again."
      @retry="() => refresh()"
    />

    <div
      v-else
      class="grid gap-4 xl:grid-cols-[minmax(0,1fr)_22rem]"
      :aria-busy="!detail || undefined"
    >
      <!-- Loading skeleton keeps the final two-column layout -->
      <template v-if="!detail">
        <div class="min-w-0 space-y-4">
          <LazyVSkeletonLoader class="h-56" />

          <LazyVSkeletonLoader class="h-96" />

          <LazyVSkeletonLoader class="h-60" />
        </div>

        <div class="space-y-4">
          <LazyVSkeletonLoader class="h-64" />

          <LazyVSkeletonLoader class="h-48" />

          <LazyVSkeletonLoader class="h-72" />
        </div>
      </template>

      <template v-else>
        <div class="min-w-0 space-y-4">
          <order-pipeline
            :phases="detail.phases"
            :current="detail.row.stage"
            :busy="moving"
            @override="moveTo"
          />
          <order-line-items
            :lines="detail.lines"
            :pricing="detail.pricing"
            :vault-note="vaultNote"
          />
          <order-shipment :shipment="detail.shipment" />
        </div>

        <div class="space-y-4">
          <order-customer-card
            :customer="detail.row.customer"
            :details="detail.customer"
          />

          <LazyVPanel
            title="Client metrology directives"
            icon="lucide:file-check"
          >
            <blockquote
              class="border-s-2 border-accent ps-3 text-sm italic text-mute"
            >
              “{{ detail.directive.quote }}”
            </blockquote>
            <p class="meta mt-2">{{ detail.directive.recordedAt }}</p>
          </LazyVPanel>

          <order-notes
            ref="notesRef"
            :notes="detail.notes"
            :saving="savingNote"
            @add="addNote"
          />
          <order-ledger
            :events="detail.ledger"
            :chain="`CHAIN ${detail.row.id}`"
          />
        </div>
      </template>
    </div>

    <LazyVDialog
      v-model:open="confirmOpen"
      title="Release escrow and fulfill?"
      :description="`This moves ${orderId} to the final stage and releases ${detail ? currency(detail.pricing.total, cents) : 'the escrow value'} to the vendor. It is recorded in the ledger.`"
    >
      <p class="callout">
        <Icon
          name="lucide:triangle-alert"
          size="14"
          class="bullet-icon"
          aria-hidden="true"
        />
        Make sure cleanroom QA and the conservator handoff are complete.
        Releasing escrow cannot be undone from this screen.
      </p>

      <template #footer>
        <LazyVButton
          variant="secondary"
          :disabled="moving"
          @click="confirmOpen = false"
          >Keep escrow locked</LazyVButton
        >

        <LazyVButton
          :loading="moving"
          icon="lucide:shield-check"
          @click="release"
          >Fulfill & release escrow</LazyVButton
        >
      </template>
    </LazyVDialog>
  </div>
</template>

<script lang="ts" setup>
import { priorityMeta, stageMeta, tierMeta } from "~/data/order-meta";
import type { OrderDetail, OrderStage } from "~/types/admin/orders";

const route = useRoute();
const toast = useToast();
const { currency } = useFormatters();

const cents = { minimumFractionDigits: 2, maximumFractionDigits: 2 };

const slug = computed(() => String(route.params.id));
const orderId = computed(() => `#${slug.value}`);

// lazy: the header shows at once and the panels show their skeleton.
const {
  data: detail,
  error,
  refresh,
} = useFetch<OrderDetail>(() => `/api/admin/orders/${slug.value}`, {
  lazy: true,
});

const notFound = computed(() => error.value?.statusCode === 404);

const vaultNote = computed(() =>
  detail.value?.row.stage === "settled"
    ? "Vault status: escrow released"
    : "Vault status: escrow secured (Deutsche Bank Luxembourg)",
);

// --- Moving the order along its pipeline ---
const moving = ref(false);
const confirmOpen = ref(false);

const moveTo = async (stage: OrderStage) => {
  moving.value = true;
  try {
    detail.value = await $fetch<OrderDetail>(
      `/api/admin/orders/${slug.value}`,
      {
        method: "PATCH",
        body: { stage },
      },
    );
    toast.success(
      stage === "settled" ? "Escrow released" : "Pipeline updated",
      { description: `${orderId.value} is now at: ${stageMeta[stage].tab}.` },
    );
  } catch {
    toast.error("Couldn't update the requisition", {
      description: "Try again in a moment.",
    });
  } finally {
    moving.value = false;
  }
};

const release = async () => {
  await moveTo("settled");
  confirmOpen.value = false;
};

// --- Internal notes ---
const notesRef = ref<{ reset: () => void } | null>(null);
const savingNote = ref(false);

const addNote = async (payload: { text: string; urgent: boolean }) => {
  savingNote.value = true;
  try {
    detail.value = await $fetch<OrderDetail>(
      `/api/admin/orders/${slug.value}/notes`,
      {
        method: "POST",
        body: payload,
      },
    );
    notesRef.value?.reset();
    toast.success("Note saved");
  } catch {
    toast.error("Couldn't save the note", {
      description: "Your text is kept. Try again.",
    });
  } finally {
    savingNote.value = false;
  }
};

// --- Download invoice (PDF / Excel) ---
const exporting = ref(false);

const exportAs = async (format: "pdf" | "excel") => {
  if (!detail.value || exporting.value) return;
  exporting.value = true;
  try {
    await (format === "pdf" ? downloadOrderPdf : downloadOrderExcel)(
      detail.value,
    );
    toast.success(
      format === "pdf" ? "PDF downloaded" : "Excel file downloaded",
    );
  } catch {
    toast.error("Couldn't create the file", {
      description: "Try again in a moment.",
    });
  } finally {
    exporting.value = false;
  }
};

definePageMeta({ layout: "admin" });

useSeoMeta({
  title: () => `PrintPro — Requisition ${orderId.value}`,
  description:
    "Custody pipeline, allocated equipment, shipment telemetry and escrow ledger for a requisition.",
});
</script>