<script lang="ts">
  import { fade } from 'svelte/transition'
  import { cubicInOut } from 'svelte/easing'

  export let pathname: string
  const duration = 350 // in ms
</script>

{#key pathname}
  <div
    class="page-transition"
    data-testid="page-transition"
    in:fade={{ duration, delay: duration, easing: cubicInOut }}
    out:fade={{ duration, easing: cubicInOut }}
  >
    <slot />
  </div>
{/key}
