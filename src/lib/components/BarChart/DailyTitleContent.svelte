<svelte:options runes={true} />

<script lang="ts">
  import { DateFormat } from '$lib/helpers/timeHelpers'
  import type { SupabaseDuration } from '$src/routes/api/supabase/durations/+server'
  import dayjs from 'dayjs'
  import advancedFormat from 'dayjs/plugin/advancedFormat'
  import { onMount } from 'svelte'
  import { fade } from 'svelte/transition'

  dayjs.extend(advancedFormat)

  let {
    title,
    durations,
    showCurrentTime = false,
  }: { title: string; durations: SupabaseDuration; showCurrentTime?: boolean } = $props()

  const date = $derived(dayjs(durations.date).format(DateFormat.Shortish))
  const isToday = $derived(dayjs().isSame(durations.date, 'day'))

  let currentTime = $state(dayjs().format(DateFormat.TwelveHour))

  onMount(() => {
    const animationFrame = requestAnimationFrame(updateTime)

    return () => cancelAnimationFrame(animationFrame)
  })

  function updateTime() {
    currentTime = dayjs().format(DateFormat.TwelveHour)
    requestAnimationFrame(updateTime)
  }
</script>

<div class="flex px-2">
  <div class="flex-1 text-left text-orange-500" transition:fade>
    {#if showCurrentTime && isToday}
      <span class="font-mono text-sm">{currentTime}</span>
    {/if}
  </div>
  <div>
    {title}
  </div>
  <div class="flex flex-1 items-center justify-end text-sm text-primary">
    {date}
  </div>
</div>
