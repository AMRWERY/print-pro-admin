<template>
  <div class="space-y-5">
    <LazyVPageHeader
      title="Admin Users & Roles"
      description="Who can sign in to the admin, what each role may do, and which privileges are sensitive. Changes to a role reach its operators straight away."
      :breadcrumb="[
        { label: 'Dashboard', to: '/' },
        { label: 'Users & roles' },
      ]"
    >
      <template #actions>
        <LazyVMenu label="Export operators">
          <template #trigger="{ attrs, toggle }">
            <LazyVButton
              v-bind="attrs"
              variant="secondary"
              icon="lucide:download"
              icon-end="lucide:chevron-down"
              @click="toggle"
              >Export operators</LazyVButton
            >
          </template>
          <button
            type="button"
            role="menuitem"
            class="menu-item w-full"
            @click="exportRows('pdf')"
          >
            <Icon name="lucide:file-text" size="16" aria-hidden="true" /> PDF ·
            this page
          </button>
          <button
            type="button"
            role="menuitem"
            class="menu-item w-full"
            @click="exportRows('excel')"
          >
            <Icon name="lucide:file-spreadsheet" size="16" aria-hidden="true" />
            Excel · this page
          </button>
        </LazyVMenu>

        <LazyVButton icon="lucide:user-plus" @click="openOperator(null)"
          >Provision operator</LazyVButton
        >
      </template>
    </LazyVPageHeader>

    <users-kpis :kpis="data?.kpis" />

    <!-- Tabs -->
    <div
      role="tablist"
      aria-label="Users and roles"
      class="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1"
    >
      <button
        v-for="t in tabList"
        :id="`tab-${t.value}`"
        :key="t.value"
        type="button"
        role="tab"
        :aria-selected="tab === t.value"
        :aria-controls="`panel-${t.value}`"
        :tabindex="tab === t.value ? 0 : -1"
        class="flex shrink-0 items-center gap-2 whitespace-nowrap rounded-control border px-3.5 py-2 font-mono text-xs transition duration-fast active:scale-95 focus-visible:ring-2 focus-visible:ring-cyan"
        :class="
          tab === t.value
            ? 'border-accent bg-accent text-onaccent'
            : 'border-line bg-surface text-mute hover:border-accent/60 hover:text-paper'
        "
        @click="tab = t.value"
        @keydown.right.prevent="moveTab(1)"
        @keydown.left.prevent="moveTab(-1)"
      >
        <Icon :name="t.icon" size="14" aria-hidden="true" />
        {{ t.label }}
      </button>
    </div>

    <!-- Operators -->
    <div
      v-show="tab === 'operators'"
      id="panel-operators"
      role="tabpanel"
      aria-labelledby="tab-operators"
      class="space-y-4"
    >
      <div>
        <div class="min-w-0 space-y-4">
          <section class="card min-w-0" aria-label="Operator ledger">
            <div class="border-b border-line p-4 sm:p-5">
              <users-toolbar
                v-model:q="filters.q"
                v-model:role="filters.role"
                v-model:status="filters.status"
                :roles="roles"
              />
            </div>

            <div id="operators" class="scroll-mt-24">
              <div v-if="error" class="p-5">
                <LazyVEmptyState
                  icon="lucide:triangle-alert"
                  title="Operator ledger sync failed"
                  description="The operator list could not be reached. Your filters are kept, so retrying picks up where you left off."
                  eyebrow="ACCESS :: SYNC_ERROR"
                  tag="OFFLINE"
                  tag-tone="accent"
                >
                  <LazyVButton icon="lucide:refresh-cw" @click="() => refresh()"
                    >Retry sync</LazyVButton
                  >
                </LazyVEmptyState>
              </div>

              <div
                v-else-if="!pending && data && !rows.length && hasFilters"
                class="p-5"
              >
                <LazyVEmptyState
                  title="No operators match these filters"
                  description="Try a different name, email or node, another role, or any status."
                  eyebrow="QUERY :: NO_RESULTS"
                  tag="0 RESULTS"
                >
                  <LazyVButton variant="secondary" @click="resetFilters"
                    >Clear all filters</LazyVButton
                  >
                </LazyVEmptyState>
              </div>

              <div v-else-if="!pending && data && !rows.length" class="p-5">
                <LazyVEmptyState
                  icon="lucide:users-round"
                  title="No operators yet"
                  description="Provision an operator to give someone access to the admin."
                  eyebrow="ACCESS :: EMPTY"
                  tag="0 OPERATORS"
                >
                  <LazyVButton
                    icon="lucide:user-plus"
                    @click="openOperator(null)"
                    >Provision operator</LazyVButton
                  >
                </LazyVEmptyState>
              </div>

              <operators-list
                v-else
                v-model:selected="selected"
                :rows="rows"
                :loading="pending && !silent"
                :per-page="perPage"
                :selected-id="drawerOpen ? selectedOpId : null"
                :super-role-id="SUPER_ROLE_ID"
                @select="selectOperator"
                @edit="openOperator"
                @remove="askDeleteOperators([$event.id], $event.name)"
                @suspend="(o) => runBulk([o.id], 'suspend')"
                @restore="(o) => runBulk([o.id], 'restore')"
                @revoke="(o) => runBulk([o.id], 'revoke')"
              />
            </div>

            <div
              v-if="!error && (pending || rows.length)"
              class="border-t border-line p-4 sm:px-5"
            >
              <LazyVPagination
                v-model:page="page"
                v-model:per-page="perPage"
                :total="data?.total ?? 0"
                :per-page-options="[8, 16, 32]"
                show-per-page
                item-label="operators"
                scroll-to="#operators"
              />
            </div>
          </section>

          <section
            class="card flex flex-wrap items-center justify-between gap-3 p-4 sm:p-5"
            aria-label="Session zeroization"
          >
            <div class="flex min-w-0 items-start gap-3">
              <span class="mt-0.5 text-accent" aria-hidden="true">
                <Icon name="lucide:shield-x" size="24" />
              </span>
              <div>
                <h2 class="text-sm font-semibold">End all other sessions</h2>
                <p class="meta">
                  Signs every operator out except you. They sign in again with
                  their hardware key.
                  {{ data ? `${data.kpis.sessions} sessions are open.` : "" }}
                </p>
              </div>
            </div>
            <LazyVButton
              variant="secondary"
              icon="lucide:log-out"
              :disabled="!data || data.kpis.sessions <= 1"
              @click="purgeOpen = true"
              >Force purge sessions</LazyVButton
            >
          </section>
        </div>
      </div>
    </div>

    <!-- Permission matrix -->
    <section
      v-show="tab === 'matrix'"
      id="panel-matrix"
      role="tabpanel"
      aria-labelledby="tab-matrix"
      class="card min-w-0"
      aria-label="Permission matrix"
    >
      <permission-matrix
        :roles="roles"
        :loading="rolesPending && !rolesData"
        @edit="openRole"
      />
    </section>

    <!-- Defined roles -->
    <section
      v-show="tab === 'roles'"
      id="panel-roles"
      role="tabpanel"
      aria-labelledby="tab-roles"
      class="card min-w-0"
      aria-label="Defined roles"
    >
      <LazyVErrorBanner
        v-if="rolesError"
        class="m-4"
        message="The roles could not be loaded. Check your connection and try again."
        @retry="() => refreshRoles()"
      />

      <roles-grid
        v-else
        :roles="roles"
        :loading="rolesPending && !rolesData"
        :active-id="activeRoleId"
        @edit="openRole"
        @clone="cloneRole"
        @remove="askDeleteRole"
        @create="createRole"
      />
    </section>

    <!-- Role architect: slides in from the end edge, like the notifications panel -->
    <Transition name="fade">
      <div
        v-if="drawerOpen"
        class="fixed inset-0 z-40 bg-ink/70 backdrop-blur-sm"
        aria-hidden="true"
        @click="closeRole"
      />
    </Transition>

    <aside
      id="role-drawer"
      role="dialog"
      aria-modal="true"
      aria-label="Role architect"
      class="fixed inset-y-0 end-0 z-50 w-full max-w-2xl overflow-y-auto overscroll-contain border-s border-line bg-surface shadow-2xl shadow-black/50 transition-[transform,visibility] duration-normal ease-out motion-reduce:transition-none [&>section]:min-h-full [&>section]:rounded-none [&>section]:border-0 [&>section]:shadow-none"
      :class="
        drawerOpen
          ? 'visible translate-x-0'
          : 'invisible translate-x-full rtl:-translate-x-full'
      "
      :inert="drawerOpen ? undefined : ''"
      @keydown.esc="closeRole"
    >
      <role-inspector
        v-if="activeRole"
        :key="inspectorKey"
        :role="activeRole"
        :saving="savingRole"
        :error="roleError"
        @save="saveRole"
        @clone="cloneRole(activeRole)"
        @remove="askDeleteRole(activeRole)"
        @close="closeRole"
      />
    </aside>

    <!-- Operator form -->
    <LazyVDialog
      v-model:open="operatorOpen"
      :title="operatorTarget ? 'Edit operator' : 'Provision operator'"
      :description="
        operatorTarget ? operatorTarget.id : 'Give someone access to the admin.'
      "
    >
      <operator-form
        v-if="operatorOpen"
        :key="operatorKey"
        :operator="operatorTarget"
        :roles="roles"
        :saving="savingOperator"
        :error="operatorError"
        @save="saveOperator"
        @cancel="operatorOpen = false"
      />
    </LazyVDialog>

    <LazyVBulkBar :count="selected.length" @clear="selected = []">
      <LazyVButton
        size="sm"
        icon="lucide:lock"
        @click="runBulk(selected, 'suspend')"
        >Suspend</LazyVButton
      >

      <LazyVButton
        size="sm"
        variant="secondary"
        icon="lucide:lock-open"
        @click="runBulk(selected, 'restore')"
        >Restore</LazyVButton
      >

      <LazyVButton
        size="sm"
        variant="secondary"
        icon="lucide:log-out"
        @click="runBulk(selected, 'revoke')"
        >End sessions</LazyVButton
      >

      <LazyVButton
        size="sm"
        variant="secondary"
        icon="lucide:trash-2"
        class="!border-accent !text-accent"
        @click="askDeleteOperators(selected, `${selected.length} operators`)"
        >Delete</LazyVButton
      >
    </LazyVBulkBar>

    <!-- Delete operators -->
    <LazyVDialog
      v-model:open="deleteOpen"
      title="Delete operator?"
      :description="
        pendingDelete ? `${pendingDelete.label} will lose access.` : ''
      "
    >
      <p class="callout">
        <Icon
          name="lucide:triangle-alert"
          size="14"
          class="bullet-icon"
          aria-hidden="true"
        />
        Their sessions end at once and their hardware key is released. Past
        activity stays in the audit trail. To keep the account but block
        sign-in, suspend it instead. This cannot be undone from this screen.
      </p>
      <template #footer>
        <LazyVButton
          variant="secondary"
          :disabled="deleting"
          @click="deleteOpen = false"
          >Keep</LazyVButton
        >

        <LazyVButton
          :loading="deleting"
          icon="lucide:trash-2"
          @click="confirmDelete"
          >Delete</LazyVButton
        >
      </template>
    </LazyVDialog>

    <!-- Delete role -->
    <LazyVDialog
      v-model:open="deleteRoleOpen"
      title="Delete this role?"
      :description="roleToDelete?.name ?? ''"
    >
      <p
        v-if="roleToDelete && roleToDelete.operators"
        class="callout-accent"
        role="alert"
      >
        <Icon
          name="lucide:circle-alert"
          size="16"
          class="bullet-icon"
          aria-hidden="true"
        />
        {{ roleToDelete.operators }} operator{{
          roleToDelete.operators === 1 ? " still holds" : "s still hold"
        }}
        this role. Move them to another role first, then delete it.
      </p>
      <p v-else class="callout">
        <Icon
          name="lucide:triangle-alert"
          size="14"
          class="bullet-icon"
          aria-hidden="true"
        />
        The role and its privilege set are removed. This cannot be undone from
        this screen.
      </p>
      <template #footer>
        <LazyVButton
          variant="secondary"
          :disabled="deletingRole"
          @click="deleteRoleOpen = false"
          >Keep</LazyVButton
        >

        <LazyVButton
          :loading="deletingRole"
          :disabled="!!roleToDelete?.operators"
          icon="lucide:trash-2"
          @click="confirmDeleteRole"
          >Delete role</LazyVButton
        >
      </template>
    </LazyVDialog>

    <!-- Purge sessions -->
    <LazyVDialog
      v-model:open="purgeOpen"
      title="End all other sessions?"
      description="Every operator except you will be signed out."
    >
      <p class="callout">
        <Icon
          name="lucide:triangle-alert"
          size="14"
          class="bullet-icon"
          aria-hidden="true"
        />
        Unsaved work in their open tabs is lost. They can sign in again straight
        away.
      </p>
      <template #footer>
        <LazyVButton
          variant="secondary"
          :disabled="purging"
          @click="purgeOpen = false"
          >Cancel</LazyVButton
        >

        <LazyVButton
          :loading="purging"
          icon="lucide:log-out"
          @click="purgeSessions"
          >End sessions</LazyVButton
        >
      </template>
    </LazyVDialog>
  </div>
</template>

<script lang="ts" setup>
import { permissionModules, statusMeta } from "~/data/users-meta";
import type {
  OperatorBulkAction,
  OperatorInput,
  OperatorRow,
  OperatorStatus,
  OperatorsResponse,
  RoleInput,
  RoleRow,
} from "~/types/admin/users";

// The built-in root role. Its id is fixed by the access store.
const SUPER_ROLE_ID = "role-root";

const toast = useToast();

type Tab = "operators" | "matrix" | "roles";
const tab = ref<Tab>("operators");

// Keep the matrix and role counts live in the tab labels.
const tabList = computed<{ value: Tab; label: string; icon: string }[]>(() => [
  {
    value: "operators",
    label: `Admin operators (${data.value?.kpis.total ?? "…"})`,
    icon: "lucide:users-round",
  },
  {
    value: "matrix",
    label: `Permission matrix (${permissionModules.length} modules)`,
    icon: "lucide:grid-3x3",
  },
  {
    value: "roles",
    label: `Defined roles (${roles.value.length || "…"})`,
    icon: "lucide:shield-user",
  },
]);

const moveTab = async (delta: 1 | -1) => {
  const list = tabList.value;
  const i = list.findIndex((t) => t.value === tab.value);
  const next = list[(i + delta + list.length) % list.length]!;
  tab.value = next.value;
  await nextTick();
  document.getElementById(`tab-${next.value}`)?.focus();
};

// --- Operators ---
const filters = reactive({
  q: "",
  role: "all",
  status: "all" as "all" | OperatorStatus,
});
const page = ref(1);
const perPage = ref(8);
const selected = ref<string[]>([]);

const debouncedQ = refDebounced(toRef(filters, "q"), 300);

const query = computed(() => ({
  ...filters,
  q: debouncedQ.value,
  page: page.value,
  perPage: perPage.value,
}));

// lazy: the screen renders at once; the cards and the ledger show their own skeletons.
const { data, pending, error, refresh } = useFetch<OperatorsResponse>(
  "/api/admin/users",
  { lazy: true, query },
);
const rows = computed(() => data.value?.rows ?? []);

const hasFilters = computed(
  () =>
    !!debouncedQ.value || filters.role !== "all" || filters.status !== "all",
);
const resetFilters = () => {
  filters.q = "";
  filters.role = "all";
  filters.status = "all";
};

watch([debouncedQ, () => filters.role, () => filters.status, perPage], () => {
  page.value = 1;
});
watch([page, query], () => {
  selected.value = [];
});

// After our own changes the rows stay on screen while the lists refresh; no skeleton flash.
const silent = ref(false);
const reloadAll = async () => {
  silent.value = true;
  try {
    await Promise.all([refresh(), refreshRoles()]);
  } finally {
    silent.value = false;
  }
};

// --- Roles ---
const {
  data: rolesData,
  pending: rolesPending,
  error: rolesError,
  refresh: refreshRoles,
} = useFetch<{ rows: RoleRow[] }>("/api/admin/roles", { lazy: true });
const roles = computed(() => rolesData.value?.rows ?? []);

// The role architect is a panel that slides in from the end edge.
const drawerOpen = ref(false);
let opener: HTMLElement | null = null;

const activeRoleId = ref<string | null>(null);
const selectedOpId = ref<string | null>(null);

const activeRole = computed(
  () => roles.value.find((r) => r.id === activeRoleId.value) ?? null,
);

const roleError = ref("");
const savingRole = ref(false);
let nonce = 0;

const inspectorKey = computed(() => `${activeRoleId.value}-${nonce}`);

const showDrawer = async () => {
  if (!drawerOpen.value) opener = document.activeElement as HTMLElement | null;
  drawerOpen.value = true;
  await nextTick();
  document
    .querySelector<HTMLElement>("#role-drawer [aria-label='Close']")
    ?.focus();
};

const openRole = (r: RoleRow) => {
  activeRoleId.value = r.id;
  roleError.value = "";
  nonce++;
  showDrawer();
};

// The form stays in place until the panel has slid out, then the selection is cleared.
const closeRole = () => {
  if (!drawerOpen.value) return;
  drawerOpen.value = false;
  opener?.focus?.();
  opener = null;
  setTimeout(() => {
    if (drawerOpen.value) return;
    activeRoleId.value = null;
    selectedOpId.value = null;
    roleError.value = "";
  }, 300);
};

const selectOperator = (o: OperatorRow) => {
  selectedOpId.value = o.id;
  activeRoleId.value = o.roleId;
  roleError.value = "";
  nonce++;
  showDrawer();
};

// The page shouldn't scroll underneath the open panel, and navigating away closes it.
const scrollLock = useScrollLock(import.meta.client ? document.body : null);
watch(drawerOpen, (isOpen) => {
  scrollLock.value = isOpen;
});
onBeforeUnmount(() => {
  scrollLock.value = false;
});
const route = useRoute();
watch(() => route.fullPath, closeRole);
watch(tab, closeRole);

const reasonOf = (e: unknown) =>
  (e as { data?: { data?: { reason?: string } } }).data?.data?.reason;

const saveRole = async (values: RoleInput) => {
  const role = activeRole.value;
  if (!role) return;
  savingRole.value = true;
  roleError.value = "";
  try {
    await $fetch(`/api/admin/roles/${role.id}`, {
      method: "PATCH",
      body: values,
    });
    toast.success("Role updated", {
      description: role.operators
        ? `${role.operators} operator${role.operators === 1 ? "" : "s"} now follow the new privileges.`
        : values.name,
    });
    await reloadAll();
    nonce++;
  } catch (e) {
    roleError.value =
      reasonOf(e) === "locked"
        ? "The root role is locked and cannot be changed."
        : "The role could not be saved. Check the values and try again.";
  } finally {
    savingRole.value = false;
  }
};

const createRole = async () => {
  try {
    const created = await $fetch<RoleRow>("/api/admin/roles", {
      method: "POST",
      body: {
        name: "New custom role",
        description: "",
        scope: "Warehouse",
        permissions: [],
      },
    });
    await reloadAll();
    toast.success("Role created", {
      description: "Name it and choose its privileges.",
    });
    openRole(created);
  } catch {
    toast.error("Couldn't create the role", { description: "Try again." });
  }
};

const cloneRole = async (r: RoleRow) => {
  try {
    const created = await $fetch<RoleRow>("/api/admin/roles", {
      method: "POST",
      body: {
        name: `${r.name} (copy)`.slice(0, 60),
        description: r.description,
        scope: r.system ? "Global" : r.scope,
        permissions: r.permissions,
      },
    });
    await reloadAll();
    toast.success("Role cloned", { description: created.name });
    openRole(created);
  } catch {
    toast.error("Couldn't clone the role", { description: "Try again." });
  }
};

const deleteRoleOpen = ref(false);
const deletingRole = ref(false);
const roleToDelete = ref<RoleRow | null>(null);
const askDeleteRole = (r: RoleRow) => {
  roleToDelete.value = r;
  deleteRoleOpen.value = true;
};

const confirmDeleteRole = async () => {
  const r = roleToDelete.value;
  if (!r) return;
  deletingRole.value = true;
  try {
    await $fetch(`/api/admin/roles/${r.id}`, { method: "DELETE" });
    toast.success("Role deleted", { description: r.name });
    if (activeRoleId.value === r.id) closeRole();
    if (filters.role === r.id) filters.role = "all";
    deleteRoleOpen.value = false;
    await reloadAll();
  } catch (e) {
    toast.error("Couldn't delete the role", {
      description:
        reasonOf(e) === "role-in-use"
          ? "Operators still hold this role."
          : "Nothing was removed. Try again.",
    });
  } finally {
    deletingRole.value = false;
  }
};

// --- Operator form ---
const operatorOpen = ref(false);
const operatorTarget = ref<OperatorRow | null>(null);
const operatorError = ref("");
const savingOperator = ref(false);
let opNonce = 0;
const operatorKey = computed(
  () => `${operatorTarget.value?.id ?? "new"}-${opNonce}`,
);

const openOperator = (o: OperatorRow | null) => {
  operatorTarget.value = o;
  operatorError.value = "";
  opNonce++;
  operatorOpen.value = true;
};

const saveOperator = async (values: OperatorInput) => {
  const target = operatorTarget.value;
  savingOperator.value = true;
  operatorError.value = "";
  try {
    const saved = await $fetch<OperatorRow>(
      target ? `/api/admin/users/${target.id}` : "/api/admin/users",
      { method: target ? "PATCH" : "POST", body: values },
    );
    toast.success(target ? "Operator updated" : "Operator provisioned", {
      description: saved.name,
    });
    if (!target) {
      resetFilters();
      page.value = 1;
    }
    operatorOpen.value = false;
    await reloadAll();
  } catch (e) {
    const reason = reasonOf(e);
    operatorError.value =
      reason === "email"
        ? "Another operator already uses that email."
        : reason === "self"
          ? "You can't change your own role or lock yourself out."
          : reason === "last-super"
            ? "At least one active Owner must remain."
            : "The operator could not be saved. Check the values and try again.";
  } finally {
    savingOperator.value = false;
  }
};

// --- Suspend, restore, end sessions (one or many) ---
const bulkWords: Record<Exclude<OperatorBulkAction, "delete">, string> = {
  suspend: "suspended",
  restore: "restored",
  revoke: "signed out",
};

const runBulk = async (
  ids: string[],
  action: Exclude<OperatorBulkAction, "delete">,
) => {
  try {
    const { changed, skipped } = await $fetch<{
      changed: number;
      skipped: number;
    }>("/api/admin/users/bulk", { method: "POST", body: { ids, action } });
    if (changed)
      toast.success(
        `${changed} operator${changed > 1 ? "s" : ""} ${bulkWords[action]}`,
        {
          description: skipped
            ? `${skipped} skipped: protected or already in that state.`
            : undefined,
        },
      );
    else
      toast.warning("Nothing changed", {
        description: "Those operators are protected or already in that state.",
      });
    selected.value = [];
    await reloadAll();
  } catch {
    toast.error("Couldn't update the operators", {
      description: "Nothing was changed. Try again.",
    });
  }
};

// --- Delete operators ---
const deleteOpen = ref(false);
const deleting = ref(false);
const pendingDelete = ref<{ ids: string[]; label: string } | null>(null);

const askDeleteOperators = (ids: string[], label: string) => {
  pendingDelete.value = { ids, label };
  deleteOpen.value = true;
};

const confirmDelete = async () => {
  if (!pendingDelete.value) return;
  deleting.value = true;
  try {
    const { ids, label } = pendingDelete.value;
    const { changed, skipped } = await $fetch<{
      changed: number;
      skipped: number;
    }>("/api/admin/users/bulk", {
      method: "POST",
      body: { ids, action: "delete" },
    });
    if (changed)
      toast.success("Operator deleted", {
        description: skipped
          ? `${label} · ${skipped} protected and kept`
          : label,
      });
    else
      toast.warning("Nothing deleted", {
        description:
          "Yourself and the last active Owner can't be deleted.",
      });
    selected.value = [];
    deleteOpen.value = false;
    await reloadAll();
  } catch {
    toast.error("Couldn't delete", {
      description: "Nothing was removed. Try again.",
    });
  } finally {
    deleting.value = false;
  }
};

// --- Purge sessions ---
const purgeOpen = ref(false);
const purging = ref(false);
const purgeSessions = async () => {
  purging.value = true;
  try {
    const { ended } = await $fetch<{ ended: number }>(
      "/api/admin/users/purge-sessions",
      { method: "POST" },
    );
    toast.success("Sessions ended", {
      description: `${ended} session${ended === 1 ? "" : "s"} closed. Yours stays open.`,
    });
    purgeOpen.value = false;
    await reloadAll();
  } catch {
    toast.error("Couldn't end the sessions", { description: "Try again." });
  } finally {
    purging.value = false;
  }
};

// --- Export ---
const exportRows = async (format: "pdf" | "excel") => {
  const list = rows.value;
  if (!list.length) {
    toast.warning("Nothing to export", {
      description: "There are no operators on this page.",
    });
    return;
  }
  try {
    await downloadTable(format, {
      title: "Admin operators",
      subtitle: `${list.length} operator${list.length > 1 ? "s" : ""}`,
      fileName: `admin-operators-${new Date().toISOString().slice(0, 10)}`,
      head: [
        "ID",
        "Name",
        "Email",
        "Role",
        "Node",
        "Status",
        "Hardware key",
        "Sessions",
        "Failed sign-ins",
      ],
      body: list.map((o) => [
        o.id,
        o.name,
        o.email,
        o.roleName,
        o.node,
        statusMeta[o.status].label,
        o.keyEnrolled ? "Yes" : "No",
        o.sessions,
        o.failedAttempts,
      ]),
      numberCols: [7, 8],
    });
    toast.success(
      `Exported ${list.length} operator${list.length > 1 ? "s" : ""}`,
    );
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
  title: "Users & Roles",
  description: "Admin operators, role privileges and the permission matrix.",
});
</script>