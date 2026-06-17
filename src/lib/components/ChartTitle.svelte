<svelte:options runes={true} />

<script lang="ts">
  import type { Snippet } from 'svelte'

  let { children }: { children?: Snippet } = $props()
</script>

<div class="text-center text-lg font-bold text-accent-focus" data-testid="chart-title">
  {@render children?.()}
</div>
