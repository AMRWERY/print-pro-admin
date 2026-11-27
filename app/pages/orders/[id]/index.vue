<template>
  <div class="space-y-5">
    <LazyVPageHeader
      :title="`${$t('orders_ui.title')} ${orderId}`"
      :breadcrumb="[
        { label: $t('nav.dashboard'), to: '/' },
        { label: $t('orders_ui.title'), to: '/orders' },
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
              :tone="stageMeta[detail.row.stage].paymentTone"
              :icon="stageMeta[detail.row.stage].paymentIcon"
              >{{ stageMeta[detail.row.stage].payment }}</LazyVStatusBadge
            >

            <LazyVStatusBadge
              :tone="stageMeta[detail.row.stage].statusTone"
              :icon="stageMeta[detail.row.stage].statusIcon"
              >{{ stageMeta[detail.row.stage].status }}</LazyVStatusBadge
            >
          </p>
          <p class="font-mono text-xs text-mute">
            <span>
              <i18n-t keypath="orders_ui.created_summary">
                <template #date>{{ formatUtc(detail.row.placedAt) }}</template>
                <template #value
                  ><span class="font-semibold text-paper">{{
                    currency(detail.pricing.total, cents)
                  }}</span></template
                >
                <template #hash>{{ detail.row.hex }}</template>
              </i18n-t>
            </span>
          </p>
        </div>

        <LazyVSkeletonLoader v-else variant="line" class="w-72" />
      </template>

      <template #actions>
        <LazyVMenu :label="$t('btn.download_invoice')">
          <template #trigger="{ attrs, toggle }">
            <LazyVButton
              v-bind="attrs"
              variant="secondary"
              icon="lucide:download"
              icon-end="lucide:chevron-down"
              :disabled="!detail"
              @click="toggle"
              >{{ $t('btn.download_invoice') }}</LazyVButton
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
            {{ $t('common_ui.export_pdf') }}
          </button>
          <button
            type="button"
            role="menuitem"
            class="menu-item w-full"
            :disabled="exporting"
            @click="exportAs('excel')"
          >
            <Icon name="lucide:file-spreadsheet" size="16" aria-hidden="true" />
            {{ $t('common_ui.export_excel') }}
          </button>
        </LazyVMenu>

        <LazyVButton
          icon="lucide:shield-check"
          :disabled="!detail || detail.row.stage === 'completed'"
          @click="confirmOpen = true"
          >{{
            detail?.row.stage === "completed"
              ? $t('orders_ui.stage_completed')
              : $t('orders_ui.stage_completed')
          }}</LazyVButton
        >
      </template>
    </LazyVPageHeader>

    <!-- The order does not exist -->
    <LazyVEmptyState
      v-if="notFound"
      icon="lucide:search-x"
      :title="$t('error_ui.not_found_title')"
      :description="$t('orders_ui.not_found_desc', { id: orderId })"
      :eyebrow="$t('orders_ui.not_found_eyebrow')"
      tag="404"
      tag-tone="accent"
    >
      <LazyVButton
        to="/orders"
        icon="lucide:arrow-left"
        icon-class="rtl:-scale-x-100"
        >{{ $t('btn.all_orders') }}</LazyVButton
      >
    </LazyVEmptyState>

    <LazyVErrorBanner
      v-else-if="error"
      :message="$t('common_ui.connection_error')"
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
            :delivery-note="deliveryNote"
          />
          <order-shipment :shipment="detail.shipment" />
        </div>

        <div class="space-y-4">
          <order-customer-card
            :customer="detail.row.customer"
            :details="detail.customer"
          />

          <LazyVPanel
            :title="$t('orders_ui.customer_instructions')"
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
            :chain="$t('orders_ui.chain_label', { id: detail.row.id })"
          />
        </div>
      </template>
    </div>

    <LazyVDialog
      v-model:open="confirmOpen"
      :title="$t('orders_ui.complete_confirm_title')"
      :description="
        detail
          ? $t('orders_ui.complete_confirm_desc', { id: orderId, value: currency(detail.pricing.total, cents) })
          : $t('orders_ui.complete_confirm_desc_no_value', { id: orderId })
      "
    >
      <p class="callout">
        <Icon
          name="lucide:triangle-alert"
          size="14"
          class="bullet-icon"
          aria-hidden="true"
        />
        {{ $t('orders_ui.complete_confirm_callout') }}
      </p>

      <template #footer>
        <LazyVButton
          variant="secondary"
          :disabled="moving"
          @click="confirmOpen = false"
          >{{ $t('btn.cancel') }}</LazyVButton
        >

        <LazyVButton
          :loading="moving"
          icon="lucide:shield-check"
          @click="release"
          >{{ $t('orders_ui.stage_completed') }}</LazyVButton
        >
      </template>
    </LazyVDialog>
  </div>
</template>

<script lang="ts" setup>
import { priorityMeta, stageMeta, tierMeta } from "~/data/order-meta";
import type { OrderDetail, OrderStage } from "~/types/admin/orders";

const { t } = useI18n();
const route = useRoute();
const toast = useToast();
const { currency } = useFormatters();

const cents = { minimumFractionDigits: 2, maximumFractionDigits: 2 };

const slug = computed(() => String(route.params.id));
const orderId = computed(() => `#${slug.value}`);

// The header shows at once and the panels show their skeleton.
const store = useOrdersStore();
const { detail, detailError: error } = storeToRefs(store);
const refresh = () => store.refreshDetail();
watch(slug, (s) => store.fetchDetail(s), { immediate: true });

const notFound = computed(() => statusOf(error.value) === 404);

const deliveryNote = computed(() =>
  detail.value?.row.stage === "completed"
    ? t('orders_ui.delivery_status_completed')
    : t('orders_ui.delivery_status_progress'),
);

// --- Moving the order along its pipeline ---
const moving = ref(false);
const confirmOpen = ref(false);

const moveTo = async (stage: OrderStage) => {
  moving.value = true;
  try {
    await store.moveStage(slug.value, stage);
    toast.success(
      stage === "completed" ? t('orders_ui.toast_completed') : t('orders_ui.toast_progress_updated'),
      { description: t('orders_ui.toast_stage_moved', { id: orderId.value, stage: stageMeta[stage].tab }) },
    );
  } catch {
    toast.error(t('orders_ui.toast_update_error'), {
      description: t('orders_ui.toast_try_moment'),
    });
  } finally {
    moving.value = false;
  }
};

const release = async () => {
  await moveTo("completed");
  confirmOpen.value = false;
};

// --- Internal notes ---
const notesRef = ref<{ reset: () => void } | null>(null);
const savingNote = ref(false);

const addNote = async (payload: { text: string; urgent: boolean }) => {
  savingNote.value = true;
  try {
    await store.addNote(slug.value, payload);
    notesRef.value?.reset();
    toast.success(t('orders_ui.toast_note_saved'));
  } catch {
    toast.error(t('orders_ui.toast_note_error'), {
      description: t('orders_ui.toast_note_error_desc'),
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
      format === "pdf" ? t('orders_ui.toast_pdf_downloaded') : t('orders_ui.toast_excel_downloaded'),
    );
  } catch {
    toast.error(t('orders_ui.toast_export_error'), {
      description: t('orders_ui.toast_try_moment'),
    });
  } finally {
    exporting.value = false;
  }
};

definePageMeta({
  layout: "admin",
});

useSeoMeta({
  title: () => `${t('orders_ui.title')} ${orderId.value}`,
  description: () => t('orders_ui.seo_description'),
});
</script>