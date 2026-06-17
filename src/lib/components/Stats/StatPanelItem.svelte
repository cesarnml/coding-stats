<script lang="ts">
  import type { Snippet } from 'svelte'

  let {
    title,
    icon,
    label,
    children,
  }: { title: string; icon: string; label: string; children?: Snippet } = $props()
</script>

<div class="stat shrink">
  <div class="stat-figure">
    <iconify-icon class="text-2xl text-secondary" {icon} aria-label={label} role="img"
    ></iconify-icon>
  </div>
  <div class="stat-title text-sm">{title}</div>
  <div class="stat-value text-lg text-secondary">
    {@render children?.()}
  </div>
</div>
