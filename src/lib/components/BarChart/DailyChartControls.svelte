<script lang="ts">
  import { ApiEndpoint, Step } from '$lib/constants'
  import { DurationItemType, type ValueOfDurationItemType } from '$lib/helpers/chartHelpers'
  import { DateFormat, formatTime } from '$lib/helpers/timeHelpers'
  import type { SupabaseDuration } from '$src/routes/api/supabase/durations/+server'
  import dayjs from 'dayjs'
  import isToday from 'dayjs/plugin/isToday'
  import 'iconify-icon'
  import { createEventDispatcher, onMount } from 'svelte'

  dayjs.extend(isToday)

  export let durations: SupabaseDuration
  export let itemType: ValueOfDurationItemType
  let loading = false

  const PREV_DAYS_LIMIT = 13
  const INCREMENT_UNIT = 'days'
  const EMPTY_COPY = 'No Data'
  const dispatch = createEventDispatcher()

  $: totalDuration = durations.data.reduce((acc, cur) => cur.duration + acc, 0)
  $: totalTime = formatTime(totalDuration).trim() || EMPTY_COPY
  $: isNextDisabled = dayjs(durations.date).isToday() || loading
  $: isPrevDisabled =
    dayjs(durations.date).isSame(dayjs().subtract(PREV_DAYS_LIMIT, INCREMENT_UNIT), 'day') ||
    loading

  onMount(() => {
    const interval = setInterval(async () => {
      loading = true

      if (itemType === DurationItemType.Project) {
        try {
          const response = await fetch(`${ApiEndpoint.SupabaseDurations}?date=${durations.date}`)
          durations = await response.json()
          dispatch('update', durations)
        } catch (error) {
          console.log('error:', error)
        }
      } else {
        try {
          const response = await fetch(
            `${ApiEndpoint.SupabaseDurationsByLanguage}?date=${durations.date}`,
          )
          durations = await response.json()
          dispatch('update', durations)
        } catch (error) {
          console.log('error:', error)
        }
      }
      loading = false
    }, 1000 * 60)

    return () => clearInterval(interval)
  })

  const onClick = async (step: Step) => {
    loading = true
    const date = dayjs(durations.date).add(step, INCREMENT_UNIT).format(DateFormat.Query)
    const response =
      itemType === DurationItemType.Project
        ? await fetch(`${ApiEndpoint.SupabaseDurations}?date=${date}`)
        : await fetch(`${ApiEndpoint.SupabaseDurationsByLanguage}?date=${date}`)
    durations = await response.json()
    dispatch('update', durations)
    loading = false
  }

  const getPrevDate = () => onClick(Step.Prev)
  const getNextDate = () => onClick(Step.Next)
</script>

<div class="flex items-center justify-center gap-4">
  <button
    class="btn-outline btn-square btn-sm btn flex items-center"
    type="button"
    on:click={getPrevDate}
    disabled={isPrevDisabled}
    aria-label="left arrow"
  >
    <iconify-icon class="text-2xl" icon="ic:baseline-chevron-left" />
  </button>
  <div class="w-24 text-center font-mono text-base text-base-content">
    {#if loading}
      <iconify-icon
        class="text-2xl"
        icon="eos-icons:three-dots-loading"
        aria-label="loading spinner"
        role="img"
      />
    {:else}
      {totalTime}
    {/if}
  </div>
  <button
    class="btn-outline btn-square btn-sm btn flex items-center"
    type="button"
    on:click={getNextDate}
    disabled={isNextDisabled}
    aria-label="right arrow"
  >
    <iconify-icon class="text-2xl" icon="ic:baseline-chevron-right" />
  </button>
</div>
