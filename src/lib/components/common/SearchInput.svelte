<script lang="ts">
  import { goto } from '$app/navigation'
  import { page } from '$app/stores'
  import debounce from 'lodash/debounce'

  const DELAY = 350

  let { query = '' }: { query?: string } = $props()

  // eslint-disable-next-line svelte/prefer-writable-derived
  let search = $state('')
  let loading = $state(false)

  $effect(() => {
    search = query
  })

  const debouncedSearch = debounce(async () => {
    loading = true
    const url = new URL($page.url.href)
    const trimmed = search.trim()
    if (trimmed) url.searchParams.set('q', trimmed)
    else url.searchParams.delete('q')

    await goto(`${url.pathname}${url.search}`, {
      keepFocus: true,
      noScroll: true,
      invalidateAll: true,
    })
    loading = false
  }, DELAY)

  const onChange = () => {
    debouncedSearch()
  }
</script>

<div class="relative flex items-center gap-4 px-4 pt-4 md:max-w-xs">
  <input
    class="input-primary input w-full flex-shrink text-base md:max-w-xs"
    bind:value={search}
    placeholder="Search projects..."
    oninput={onChange}
  />
  {#if loading}
    <button
      class="loading btn-link btn absolute right-1"
      type="button"
      tabindex="-1"
      aria-label="Loading search results"
    ></button>
  {/if}
</div>
