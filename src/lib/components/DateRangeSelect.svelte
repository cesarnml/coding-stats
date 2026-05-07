<script lang="ts">
  import { ApiEndpoint, WakaApiRange, WakaApiRangePrompt } from '$lib/constants'
  import { customDateRange } from '$lib/stores/customDateRange'
  import { profile } from '$lib/stores/profile'
  import { selectedRange } from '$lib/stores/selectedRange'
  import { createEventDispatcher } from 'svelte'
  import dayjs from 'dayjs'

  const dispatch = createEventDispatcher()

  const today = dayjs().format('YYYY-MM-DD')

  function persistRange(range: string) {
    if (!$profile?.id || range === WakaApiRangePrompt) return
    fetch(ApiEndpoint.SupabaseProfiles, {
      method: 'POST',
      body: JSON.stringify({ id: $profile.id, range }),
    }).catch((err) => console.error('Failed to persist range:', err))
  }

  function onRangeChange() {
    if ($selectedRange !== WakaApiRange.Custom) {
      customDateRange.set({ start: null, end: null })
      dispatch('wakarange')
      persistRange($selectedRange)
    }
  }

  function onCustomDateChange() {
    if ($customDateRange.start && $customDateRange.end) {
      dispatch('wakarange')
    }
  }
</script>

<div class="flex flex-wrap items-center gap-2">
  <select
    class="select-accent select w-full bg-neutral-focus text-accent sm:w-fit"
    bind:value={$selectedRange}
    on:change={onRangeChange}
    title="Select date range"
  >
    <option disabled selected>Pick a range</option>
    {#each Object.values(WakaApiRange) as range (range)}
      <option value={range}>
        {range}
      </option>
    {/each}
  </select>

  {#if $selectedRange === WakaApiRange.Custom}
    <input
      type="date"
      class="input input-bordered input-accent bg-neutral-focus text-accent"
      max={today}
      bind:value={$customDateRange.start}
      on:change={onCustomDateChange}
      aria-label="Start date"
    />
    <input
      type="date"
      class="input input-bordered input-accent bg-neutral-focus text-accent"
      max={today}
      bind:value={$customDateRange.end}
      on:change={onCustomDateChange}
      aria-label="End date"
    />
  {/if}
</div>
