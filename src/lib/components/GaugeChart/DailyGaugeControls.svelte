<script lang="ts">
  import type { SummariesResult } from '$src/types/wakatime'
  import dayjs from 'dayjs'
  import { DateFormat } from '$lib/helpers/timeHelpers'
  import { createEventDispatcher } from 'svelte'

  export let summaries: SummariesResult
  export let selectedDate: string

  const dispatch = createEventDispatcher()

  $: dates = summaries.data ? summaries.data.map((summary) => summary.range.date).reverse() : []

  const handleClick = (date: string) => {
    dispatch('update', date)
  }
</script>

<div class="carousel w-full space-x-4 px-4">
  {#each dates as date (date)}
    <div class="carousel-item">
      <button
        class:!btn-outline={date === selectedDate}
        class:btn-accent={date === selectedDate}
        class="btn-primary btn-outline btn-sm btn normal-case"
        type="button"
        on:click={() => handleClick(date)}
      >
        {dayjs(date).format(DateFormat.Short)}
      </button>
    </div>
  {/each}
</div>
