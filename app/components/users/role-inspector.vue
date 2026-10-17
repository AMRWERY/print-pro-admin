<template>
  <LazyVPanel
    title="Role architect"
    :subtitle="`${role.code} · ${role.operators} operator${role.operators === 1 ? '' : 's'} attached`"
    icon="lucide:shield-user"
  >
    <template #actions>
      <LazyVButton
        variant="icon"
        size="sm"
        icon="lucide:x"
        aria-label="Close"
        @click="emit('close')"
      />
    </template>

    <form id="role-form" class="space-y-4" novalidate @submit.prevent="submit">
      <LazyVInput
        v-model="form.name"
        name="roleName"
        label="Role name"
        required
        rules="required|min:2|max:60"
        maxlength="60"
        :disabled="role.system"
      />
      <div class="grid gap-3 sm:grid-cols-[1fr_auto]">
        <LazyVTextarea
          v-model="form.description"
          name="roleDescription"
          label="What this role is for"
          optional
          rows="2"
          maxlength="240"
          :disabled="role.system"
        />

        <LazyVSelectInput
          v-model="form.scope"
          name="roleScope"
          label="Scope"
          :options="scopeChoices"
          :disabled="role.system"
          class="sm:w-40"
        />
      </div>

      <p v-if="role.system" class="callout">
        <Icon
          name="lucide:lock"
          size="14"
          class="bullet-icon"
          aria-hidden="true"
        />
        <span
          >Root role: every privilege is granted and cannot be changed. Clone it
          to start a custom role from the full set.</span
        >
      </p>
      <p v-else class="callout-accent" role="note">
        <Icon
          name="lucide:shield-alert"
          size="16"
          class="bullet-icon"
          aria-hidden="true"
        />
        <span
          ><strong>Sensitive privileges</strong> (marked with a shield) move
          money, export personal data or change who has access. Grant them
          sparingly.</span
        >
      </p>

      <!-- One group per module -->
      <section
        v-for="m in permissionModules"
        :key="m.id"
        class="rounded-card border border-line bg-ink/40 p-3"
        :aria-labelledby="`mod-${m.id}`"
      >
        <div class="flex flex-wrap items-center justify-between gap-2">
          <h3
            :id="`mod-${m.id}`"
            class="flex items-center gap-2 text-sm font-semibold"
          >
            <Icon
              :name="m.icon"
              size="16"
              class="text-accent"
              aria-hidden="true"
            />
            {{ m.label }}
          </h3>
          <span class="flex items-center gap-2">
            <LazyVStatusBadge :tone="tone(m)"
              >{{ count(m) }} / {{ m.privileges.length }}</LazyVStatusBadge
            >
            <button
              v-if="!role.system"
              type="button"
              class="font-mono text-xs text-mute underline-offset-2 hover:text-paper hover:underline focus-visible:underline"
              @click="setAll(m, count(m) < m.privileges.length)"
            >
              {{ count(m) < m.privileges.length ? "Grant all" : "Clear" }}
              <span class="sr-only">for {{ m.label }}</span>
            </button>
          </span>
        </div>

        <div class="mt-2 grid gap-2 sm:grid-cols-2">
          <LazyVCheckboxImput
            v-for="p in m.privileges"
            :key="p.id"
            v-model="form.permissions"
            :name="`perm-${m.id}-${p.id}`"
            :value="`${m.id}.${p.id}`"
            :label="p.label"
            :description="p.hint"
            :disabled="role.system"
            size="sm"
            boxed
            :tone="p.sensitive ? 'accent' : 'success'"
          />
        </div>
      </section>

      <p v-if="error" class="callout-accent" role="alert">
        <Icon
          name="lucide:circle-alert"
          size="16"
          class="bullet-icon"
          aria-hidden="true"
        />
        {{ error }}
      </p>
    </form>

    <div
      class="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-line pt-4"
    >
      <div class="flex flex-wrap items-center gap-1">
        <LazyVButton
          variant="tertiary"
          icon="lucide:copy"
          :disabled="saving"
          @click="emit('clone')"
          >Clone role</LazyVButton
        >

        <LazyVButton
          v-if="!role.system"
          variant="tertiary"
          icon="lucide:trash-2"
          class="!text-accent"
          :disabled="saving"
          @click="emit('remove')"
          >Delete</LazyVButton
        >
      </div>

      <div v-if="!role.system" class="flex flex-wrap items-center gap-2">
        <LazyVButton
          variant="secondary"
          icon="lucide:undo-2"
          :disabled="!dirty || saving"
          @click="revert"
          >Revert changes</LazyVButton
        >

        <LazyVButton
          type="submit"
          form="role-form"
          icon="lucide:refresh-cw"
          :loading="saving"
          :disabled="!dirty"
          >Apply &amp; propagate</LazyVButton
        >
      </div>
    </div>
    <p
      v-if="dirty && role.operators"
      class="meta mt-2 text-end"
      aria-live="polite"
    >
      Applies to {{ role.operators }} operator{{
        role.operators === 1 ? "" : "s"
      }}
      straight away.
    </p>
  </LazyVPanel>
</template>

<script lang="ts" setup>
import { permissionModules, scopeOptions } from "~/data/users-meta";
import type { PermissionModule } from "~/data/users-meta";
import type { RoleInput, RoleRow } from "~/types/admin/users";

const props = defineProps<{
  role: RoleRow;
  saving?: boolean;
  error?: string;
}>();

const emit = defineEmits<{
  save: [values: RoleInput];
  clone: [];
  remove: [];
  close: [];
}>();

const start = (): RoleInput => ({
  name: props.role.name,
  description: props.role.description,
  scope: props.role.scope,
  permissions: [...props.role.permissions],
});

const form = reactive<RoleInput>(start());

// A custom scope that isn't in the list still shows up as an option.
const scopeChoices = computed(() =>
  scopeOptions.some((o) => o.value === form.scope)
    ? scopeOptions
    : [...scopeOptions, { value: form.scope, label: form.scope }],
);

const dirty = computed(() => {
  const s = start();
  return (
    form.name.trim() !== s.name ||
    form.description.trim() !== s.description ||
    form.scope !== s.scope ||
    form.permissions.length !== s.permissions.length ||
    form.permissions.some((p) => !s.permissions.includes(p))
  );
});

const count = (m: PermissionModule) =>
  m.privileges.filter((p) => form.permissions.includes(`${m.id}.${p.id}`))
    .length;

const tone = (m: PermissionModule) => {
  const n = count(m);
  return n === m.privileges.length ? "success" : n ? "info" : "neutral";
};

const setAll = (m: PermissionModule, on: boolean) => {
  const keys = m.privileges.map((p) => `${m.id}.${p.id}`);
  const rest = form.permissions.filter((p) => !keys.includes(p));
  form.permissions = on ? [...rest, ...keys] : rest;
};

const { validate, resetForm } = useForm();

const revert = () => {
  Object.assign(form, start());
  resetForm();
};

const submit = async () => {
  const { valid } = await validate();
  if (!valid) return;
  emit("save", {
    name: form.name.trim(),
    description: form.description.trim(),
    scope: form.scope,
    permissions: [...form.permissions],
  });
};
</script>