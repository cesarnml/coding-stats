<svelte:options runes={true} />

<script lang="ts">
  import type { Snippet } from 'svelte'

  let { children }: { children?: Snippet } = $props()
</script>

<div class="aspect-square sm:aspect-panoramic">
  {@render children?.()}
</div>
