<script lang="ts">
  export let title: string
  export let icon: string
  export let label: string
</script>

<div class="stat shrink">
  <div class="stat-figure">
    <iconify-icon class="text-2xl text-secondary" {icon} aria-label={label} role="img" />
  </div>
  <div class="stat-title text-sm">{title}</div>
  <div class="stat-value text-lg text-secondary">
    <slot />
  </div>
</div>
