<svelte:options runes={true} />

<script lang="ts">
  import { goto } from '$app/navigation'
  import { page } from '$app/stores'
  import { dropdown } from '$lib/stores/dropdown'

  let { label, url, isLarge = false }: { label: string; url: string; isLarge?: boolean } = $props()
</script>

<button
  class="btn-link btn px-0 text-lg lowercase no-underline"
  class:active={$page.url.pathname === url}
  class:!text-2xl={isLarge}
  class:!capitalize={isLarge}
  class:text-base={!isLarge}
  type="button"
  onclick={async () => {
    await goto(url)
    dropdown.close()
  }}
  >{label}
</button>

<style lang="postcss">
  @reference '../../../app.css';

  .active {
    @apply underline underline-offset-8;
  }
  button:hover {
    @apply text-secondary no-underline;
  }
</style>
