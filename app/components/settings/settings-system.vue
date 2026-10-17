<template>
  <settings-section
    id="integrations"
    number="10"
    title="Notifications & webhooks"
    description="Where order, stock and security events are sent."
    :changed="changed.includes('integrations')"
  >
    <LazyVInput
      v-model="s.integrations.webhookUrl"
      name="webhookUrl"
      type="url"
      label="Telemetry webhook URL"
      optional
      :rules="httpsUrlRule"
      maxlength="200"
      input-class="font-mono"
      placeholder="https://…"
      dir="ltr"
    />

    <div
      class="flex flex-wrap items-center justify-between gap-3 rounded-card border border-line bg-ink/40 p-3"
    >
      <div class="min-w-0">
        <p class="text-sm font-medium">Webhook signing secret</p>
        <p class="meta mt-0.5 font-mono" dir="ltr">
          ••••••••••••{{ secretLast4 }}
          <span class="font-sans"
            >· rotated {{ dayLabel(secretRotatedAt) }}</span
          >
        </p>
      </div>

      <LazyVButton
        variant="secondary"
        size="sm"
        icon="lucide:refresh-cw"
        @click="emit('rotate')"
        >Rotate secret</LazyVButton
      >
    </div>

    <settings-toggle
      v-model="s.integrations.slackAlerts"
      title="Post critical alerts to the team channel"
      description="Low stock, failed payments and security events appear in the operations channel."
    />
  </settings-section>

  <settings-section
    id="email"
    number="11"
    title="Email infrastructure & signatures"
    description="The outgoing mail server, the sender customers see, and the checks that keep messages out of spam."
    :changed="changed.includes('email')"
  >
    <div class="grid gap-4 md:grid-cols-2">
      <LazyVInput
        v-model="s.email.smtpHost"
        name="smtpHost"
        label="SMTP host"
        required
        :rules="hostRule"
        maxlength="120"
        input-class="font-mono"
        dir="ltr"
      />

      <LazyVInput
        v-model="s.email.smtpPort"
        name="smtpPort"
        type="number"
        label="Port"
        required
        rules="required|integer|min_value:1|max_value:65535"
        min="1"
        max="65535"
      />

      <LazyVInput
        v-model="s.email.fromName"
        name="fromName"
        label="Sender name"
        optional
        maxlength="80"
      />

      <LazyVInput
        v-model="s.email.fromAddress"
        name="fromAddress"
        type="email"
        label="Sender address"
        required
        rules="required|email"
        maxlength="120"
        dir="ltr"
      />
    </div>

    <div class="overflow-x-auto">
      <table class="w-full min-w-[30rem] border-collapse text-sm">
        <caption class="sr-only">
          Mail authentication records
        </caption>
        <thead>
          <tr class="border-b border-line">
            <th scope="col" class="label-caps py-2 pe-3 text-start">Record</th>
            <th scope="col" class="label-caps py-2 pe-3 text-start">Host</th>
            <th scope="col" class="label-caps py-2 pe-3 text-start">Value</th>
            <th scope="col" class="label-caps py-2 text-start">Check</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in dns" :key="r.type" class="border-b border-line">
            <th scope="row" class="py-2 pe-3 text-start font-mono text-xs">
              {{ r.type }}
            </th>
            <td class="py-2 pe-3 font-mono text-xs" dir="ltr">{{ r.host }}</td>
            <td
              class="max-w-64 truncate py-2 pe-3 font-mono text-xs text-mute"
              dir="ltr"
              :title="r.target"
            >
              {{ r.target }}
            </td>
            <td class="py-2">
              <LazyVStatusBadge
                :tone="r.ok ? 'success' : 'accent'"
                :icon="r.ok ? 'lucide:circle-check' : 'lucide:circle-alert'"
                >{{ r.ok ? "Passing" : "Failing" }}</LazyVStatusBadge
              >
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="grid gap-3 md:grid-cols-2">
      <settings-toggle
        v-model="s.email.transmitProofs"
        title="Send calibration proofs with orders"
        description="Attach the signed proof or certificate when a print order ships."
      />

      <settings-toggle
        v-model="s.email.signatoryAlerts"
        title="Email approvers when a release is waiting"
        description="Dual-sign escrow releases notify both signatories."
      />
    </div>
  </settings-section>

  <settings-section
    id="seo"
    number="12"
    title="SEO & structured data"
    description="Defaults for search results and the machine-readable markup on product pages."
    :changed="changed.includes('seo')"
  >
    <LazyVInput
      v-model="s.seo.defaultTitle"
      name="seoTitle"
      label="Default page title"
      required
      rules="required|max:70"
      maxlength="70"
      :hint="`${s.seo.defaultTitle.length} / 70 characters`"
    />

    <LazyVTextarea
      v-model="s.seo.defaultDescription"
      name="seoDescription"
      label="Default description"
      optional
      rows="2"
      maxlength="200"
      :hint="`${s.seo.defaultDescription.length} / 200 characters`"
    />

    <div class="grid gap-3 md:grid-cols-2">
      <settings-toggle
        v-model="s.seo.schemaOrg"
        title="Publish schema.org product data"
        description="Price, availability and ratings in search results."
      />

      <settings-toggle
        v-model="s.seo.sitemap"
        title="Generate the XML sitemap"
        description="Updated automatically when products and content change."
      />
    </div>
  </settings-section>

  <settings-section
    id="ergonomics"
    number="13"
    title="Workstation ergonomics"
    description="Comfort and accessibility for operators on this account."
    :changed="changed.includes('ergonomics')"
  >
    <div class="grid gap-3 md:grid-cols-2">
      <settings-toggle
        v-model="s.ergonomics.haptic"
        title="Haptic key confirmations"
        description="A short vibration on devices that support it when a key is touched."
      />

      <settings-toggle
        v-model="s.ergonomics.highContrast"
        title="High-contrast tables"
        description="Stronger row lines and text in long lists."
      />
    </div>
  </settings-section>
</template>

<script lang="ts" setup>
import { dayLabel } from "~/data/settings-meta";
import type {
  Settings,
  SettingsKey,
  SettingsResponse,
} from "~/types/admin/settings";

const s = defineModel<Settings>({ required: true });

defineProps<{
  changed: SettingsKey[];
  secretLast4: string;
  secretRotatedAt: string;
  dns: SettingsResponse["dns"];
}>();

const emit = defineEmits<{ rotate: [] }>();
</script>