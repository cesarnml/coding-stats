<svelte:options runes={true} />

<script lang="ts">
  import { ApiEndpoint, Step } from '$lib/constants'
  import { DurationItemType, type ValueOfDurationItemType } from '$lib/helpers/chartHelpers'
  import { DateFormat, formatTime } from '$lib/helpers/timeHelpers'
  import type { SupabaseDuration } from '$src/routes/api/supabase/durations/+server'
  import dayjs from 'dayjs'
  import isToday from 'dayjs/plugin/isToday'
  import 'iconify-icon'
  import { onMount } from 'svelte'

  dayjs.extend(isToday)

  let {
    durations: durationsProp,
    itemType,
    onupdate,
  }: {
    durations: SupabaseDuration
    itemType: ValueOfDurationItemType
    onupdate?: (detail: SupabaseDuration) => void
  } = $props()

  let durations = $state(durationsProp)
  let loading = $state(false)

  const PREV_DAYS_LIMIT = 13
  const INCREMENT_UNIT = 'days'
  const EMPTY_COPY = 'No Data'

  const totalDuration = $derived(durations.data.reduce((acc, cur) => cur.duration + acc, 0))
  const totalTime = $derived(formatTime(totalDuration).trim() || EMPTY_COPY)
  const isNextDisabled = $derived(dayjs(durations.date).isToday() || loading)
  const isPrevDisabled = $derived(
    dayjs(durations.date).isSame(dayjs().subtract(PREV_DAYS_LIMIT, INCREMENT_UNIT), 'day') ||
      loading,
  )

  onMount(() => {
    const interval = setInterval(async () => {
      loading = true

      if (itemType === DurationItemType.Project) {
        try {
          const response = await fetch(`${ApiEndpoint.SupabaseDurations}?date=${durations.date}`)
          durations = await response.json()
          onupdate?.(durations)
        } catch (error) {
          console.log('error:', error)
        }
      } else {
        try {
          const response = await fetch(
            `${ApiEndpoint.SupabaseDurationsByLanguage}?date=${durations.date}`,
          )
          durations = await response.json()
          onupdate?.(durations)
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
    try {
      const date = dayjs(durations.date).add(step, INCREMENT_UNIT).format(DateFormat.Query)
      const response =
        itemType === DurationItemType.Project
          ? await fetch(`${ApiEndpoint.SupabaseDurations}?date=${date}`)
          : await fetch(`${ApiEndpoint.SupabaseDurationsByLanguage}?date=${date}`)
      durations = await response.json()
      onupdate?.(durations)
    } catch (error) {
      console.log('error:', error)
    } finally {
      loading = false
    }
  }

  const getPrevDate = () => onClick(Step.Prev)
  const getNextDate = () => onClick(Step.Next)
</script>

<div class="flex items-center justify-center gap-4">
  <button
    class="btn-outline btn-square btn-sm btn flex items-center"
    type="button"
    onclick={getPrevDate}
    disabled={isPrevDisabled}
    aria-label="left arrow"
  >
    <iconify-icon class="text-2xl" icon="ic:baseline-chevron-left"></iconify-icon>
  </button>
  <div class="w-24 text-center font-mono text-base text-base-content">
    {#if loading}
      <iconify-icon
        class="text-2xl"
        icon="eos-icons:three-dots-loading"
        aria-label="loading spinner"
        role="img"
      ></iconify-icon>
    {:else}
      {totalTime}
    {/if}
  </div>
  <button
    class="btn-outline btn-square btn-sm btn flex items-center"
    type="button"
    onclick={getNextDate}
    disabled={isNextDisabled}
    aria-label="right arrow"
  >
    <iconify-icon class="text-2xl" icon="ic:baseline-chevron-right"></iconify-icon>
  </button>
</div>
