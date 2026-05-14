<script lang="ts">
  import { goto } from '$app/navigation'
  import { Url } from '$lib/constants'
  import { dropdown } from '$lib/stores/dropdown'
</script>

<button
  type="button"
  on:click={() => {
    dropdown.close()
    goto(Url.Home)
  }}
>
  <slot />
</button>
