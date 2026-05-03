<script lang="ts">
  import type { SupabaseDuration } from '$src/routes/api/supabase/durations/+server'
  import type { DurationsResult, WakaDuration } from '$src/types/wakatime'
  import * as echarts from 'echarts'
  import { afterUpdate, onMount } from 'svelte'
  import DailyChartControls from '../BarChart/DailyChartControls.svelte'
  import DailyTitleContent from '../BarChart/DailyTitleContent.svelte'
  import ChartTitle from '../ChartTitle.svelte'
  import Container from '../Container.svelte'
  import ChartContainer from '../common/ChartContainer.svelte'
  import { createTimelineChartOption } from './timelineChartHelpers'
  import type { ValueOfDurationItemType } from '$lib/helpers/chartHelpers'
  import EmptyState from '../EmptyState.svelte'

  export let durations: SupabaseDuration
  export let title = 'Context Switch'
  export let itemType: ValueOfDurationItemType

  let chartRef: HTMLDivElement
  let chart: echarts.ECharts

  $: hasData = (durations.data?.length ?? 0) > 0
  $: option = createTimelineChartOption(durations, itemType)

  onMount(() => {
    chart = echarts.init(chartRef, 'dark', { renderer: 'svg' })
    const handleResize = () => chart.resize()
    window.addEventListener('resize', handleResize, { passive: true })
    chart.setOption(option)

    return () => {
      chart.dispose()
      window.removeEventListener('resize', handleResize)
    }
  })

  afterUpdate(() => chart.setOption(option))

  const onUpdate = (e: CustomEvent<SupabaseDuration>) => (durations = e.detail)
</script>

<Container>
  <ChartTitle>
    <DailyTitleContent {title} {durations} />
  </ChartTitle>
  {#if hasData}
    <DailyChartControls {durations} {itemType} on:update={onUpdate} />
    <ChartContainer>
      <div class="h-full w-full" bind:this={chartRef} />
    </ChartContainer>
  {:else}
    <EmptyState message="No data for this range" cta="Try a wider date range" />
  {/if}
</Container>
