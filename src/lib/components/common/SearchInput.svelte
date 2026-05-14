<script lang="ts">
  import { ApiEndpoint } from '$lib/constants'
  import type { WakaProjectResult } from '$src/types/wakatime'
  import debounce from 'lodash/debounce'
  import { createEventDispatcher } from 'svelte'

  const DELAY = 350

  let search = ''
  let loading = false

  const dispatch = createEventDispatcher()

  const debouncedSearch = debounce(
    async () => {
      loading = true
      const response = await fetch(`${ApiEndpoint.Projects}?q=${search}`)
      const result: WakaProjectResult = await response.json()
      dispatch('search', result)
      loading = false
    },
    DELAY,
    { trailing: true },
  )

  const onChange = () => {
    debouncedSearch()
  }
</script>

<div class="relative flex items-center gap-4 px-4 pt-4 md:max-w-xs">
  <input
    class="input-primary input w-full flex-shrink text-base md:max-w-xs"
    bind:value={search}
    placeholder="Search"
    on:input={onChange}
  />
  {#if loading}
    <button class="loading btn-link btn absolute right-1" />
  {/if}
</div>
