<svelte:options runes={true} />

<script lang="ts">
  import type { Snippet } from 'svelte'

  let { children }: { children?: Snippet } = $props()
</script>

<div class="space-y-4 rounded-2xl bg-chart-dark p-4" data-testid="container">
  {@render children?.()}
</div>
