<svelte:options runes={true} />

<script lang="ts">
  import type { SupabaseDuration } from '$src/routes/api/supabase/durations/+server'
  import * as echarts from 'echarts'
  import { onMount } from 'svelte'
  import DailyChartControls from '../BarChart/DailyChartControls.svelte'
  import DailyTitleContent from '../BarChart/DailyTitleContent.svelte'
  import ChartTitle from '../ChartTitle.svelte'
  import Container from '../Container.svelte'
  import ChartContainer from '../common/ChartContainer.svelte'
  import { createTimelineChartOption } from './timelineChartHelpers'
  import type { ValueOfDurationItemType } from '$lib/helpers/chartHelpers'
  import EmptyState from '../EmptyState.svelte'

  let {
    durations: durationsProp,
    title = 'Context Switch',
    itemType,
  }: { durations: SupabaseDuration; title?: string; itemType: ValueOfDurationItemType } = $props()

  let durations = $state(durationsProp)

  let chartRef: HTMLDivElement
  let chart: echarts.ECharts

  const hasData = $derived((durations.data?.length ?? 0) > 0)
  const option = $derived(createTimelineChartOption(durations, itemType))

  onMount(() => {
    if (!chartRef) return
    chart = echarts.init(chartRef, 'dark', { renderer: 'svg' })
    const handleResize = () => chart.resize()
    window.addEventListener('resize', handleResize, { passive: true })
    chart.setOption(option)

    return () => {
      chart?.dispose()
      window.removeEventListener('resize', handleResize)
    }
  })

  $effect(() => {
    if (!chartRef) return
    if (!chart) chart = echarts.init(chartRef, 'dark', { renderer: 'svg' })
    chart.setOption(option)
  })

  const onUpdate = (e: CustomEvent<SupabaseDuration>) => (durations = e.detail)
</script>

<Container>
  <ChartTitle>
    <DailyTitleContent {title} {durations} />
  </ChartTitle>
  {#if hasData}
    <DailyChartControls {durations} {itemType} on:update={onUpdate} />
    <ChartContainer>
      <div class="h-full w-full" bind:this={chartRef}></div>
    </ChartContainer>
  {:else}
    <EmptyState message="No data for this range" cta="Try a wider date range" />
  {/if}
</Container>
