<script lang="ts">
  import type { Snippet } from 'svelte'
  import { fade } from 'svelte/transition'
  import { cubicInOut } from 'svelte/easing'

  let { pathname, children }: { pathname: string; children?: Snippet } = $props()
  const duration = 350 // in ms
</script>

{#key pathname}
  <div
    class="page-transition"
    data-testid="page-transition"
    in:fade={{ duration, delay: duration, easing: cubicInOut }}
    out:fade={{ duration, easing: cubicInOut }}
  >
    {@render children?.()}
  </div>
{/key}
