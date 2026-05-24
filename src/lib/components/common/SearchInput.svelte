<script lang="ts">
  import { goto } from '$app/navigation'
  import { page } from '$app/stores'
  import debounce from 'lodash/debounce'

  const DELAY = 350

  export let query = ''

  let search = query
  let loading = false

  $: search = query

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
    on:input={onChange}
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
