<template>
  <form class="space-y-4" novalidate @submit.prevent="submit">
    <LazyVInput
      v-model="form.name"
      name="opName"
      label="Full name"
      required
      rules="required|min:2|max:80"
      maxlength="80"
      autocomplete="off"
    />

    <LazyVInput
      v-model="form.email"
      name="opEmail"
      type="email"
      label="Work email"
      required
      rules="required|email"
      maxlength="120"
      autocomplete="off"
      dir="ltr"
    />

    <div class="grid gap-3 sm:grid-cols-2">
      <LazyVSelectInput
        v-model="form.roleId"
        name="opRole"
        label="Assigned role"
        :options="roleChoices"
        :disabled="operator?.isYou"
        :hint="operator?.isYou ? 'You cannot change your own role.' : roleHint"
      />

      <LazyVSelectInput
        v-model="form.status"
        name="opStatus"
        label="Access"
        :options="statusChoices"
        :disabled="operator?.isYou"
      />
    </div>

    <LazyVInput
      v-model="form.node"
      name="opNode"
      label="Node"
      optional
      maxlength="60"
      placeholder="cairo-hq-01"
      input-class="font-mono"
      hint="Where this operator works from. Lowercase letters, numbers and dashes."
      :rules="nodeRule"
    />

    <p v-if="!operator" class="callout">
      <Icon
        name="lucide:key-round"
        size="14"
        class="bullet-icon"
        aria-hidden="true"
      />
      <span>
        The operator gets an invitation to enrol a hardware security key on
        first sign-in. Until then they have no open sessions.
      </span>
    </p>

    <p v-if="error" class="callout-accent" role="alert">
      <Icon
        name="lucide:circle-alert"
        size="16"
        class="bullet-icon"
        aria-hidden="true"
      />
      {{ error }}
    </p>

    <div class="flex flex-wrap justify-end gap-2 border-t border-line pt-4">
      <LazyVButton
        variant="secondary"
        :disabled="saving"
        @click="emit('cancel')"
        >Cancel</LazyVButton
      >

      <LazyVButton
        type="submit"
        :loading="saving"
        :icon="operator ? 'lucide:save' : 'lucide:user-plus'"
        >{{ operator ? "Save changes" : "Provision operator" }}</LazyVButton
      >
    </div>
  </form>
</template>

<script lang="ts" setup>
import { statusChoices } from "~/data/users-meta";
import type { OperatorInput, OperatorRow, RoleRow } from "~/types/admin/users";

const props = defineProps<{
  operator: OperatorRow | null;
  roles: RoleRow[];
  saving?: boolean;
  error?: string;
}>();

const emit = defineEmits<{ save: [values: OperatorInput]; cancel: [] }>();

const form = reactive({
  name: props.operator?.name ?? "",
  email: props.operator?.email ?? "",
  roleId:
    props.operator?.roleId ?? props.roles.find((r) => !r.system)?.id ?? "",
  status: (props.operator?.status === "suspended"
    ? "suspended"
    : "active") as OperatorInput["status"],
  node: props.operator?.node ?? "",
});

const roleChoices = computed(() =>
  props.roles.map((r) => ({ value: r.id, label: r.name })),
);

const roleHint = computed(
  () => props.roles.find((r) => r.id === form.roleId)?.description,
);

const nodeRule = (v: unknown) => {
  const s = String(v ?? "").trim();
  if (!s) return true;
  return /^[a-zA-Z0-9][a-zA-Z0-9 -]{1,59}$/.test(s)
    ? true
    : "Use letters, numbers and dashes only.";
};

const { validate } = useForm();

const submit = async () => {
  const { valid } = await validate();
  if (!valid) return;
  emit("save", {
    name: form.name.trim(),
    email: form.email.trim().toLowerCase(),
    roleId: form.roleId,
    status: form.status,
    node: form.node.trim(),
  });
};
</script>