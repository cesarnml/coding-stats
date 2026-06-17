<script lang="ts">
  import { goto } from '$app/navigation'
  import { Url } from '$lib/constants'
  import { dropdown } from '$lib/stores/dropdown'
  import type { Snippet } from 'svelte'

  let { children }: { children?: Snippet } = $props()
</script>

<button
  type="button"
  onclick={() => {
    dropdown.close()
    goto(Url.Home)
  }}
>
  {@render children?.()}
</button>
