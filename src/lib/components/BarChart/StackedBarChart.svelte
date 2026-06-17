<script lang="ts">
  import * as echarts from 'echarts'
  import { onMount } from 'svelte'
  import ChartTitle from '../ChartTitle.svelte'
  import Container from '../Container.svelte'
  import {
    createBarChartSeries,
    createStackedBarChartOption,
    createXAxisValues,
    type StackedBarChartOption,
  } from './barChartHelpers'
  import type { SummariesResult } from '$src/types/wakatime'
  import ChartContainer from '../common/ChartContainer.svelte'
  import EmptyState from '../EmptyState.svelte'

  let {
    summaries,
    title,
    itemsType,
  }: { summaries: SummariesResult; title: string; itemsType: 'categories' | 'projects' } = $props()

  let chartRef: HTMLDivElement
  let chart: echarts.ECharts

  const hasData = $derived((summaries.data?.length ?? 0) > 0)
  const xValues = $derived(createXAxisValues(summaries))
  const series = $derived(createBarChartSeries({ summaries, itemsType }))
  const option: StackedBarChartOption = $derived(createStackedBarChartOption(xValues, series))

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
    chart?.dispose()
    chart = echarts.init(chartRef, 'dark', { renderer: 'svg' })
    chart.setOption(option)
  })
</script>

<Container>
  <ChartTitle>{title}</ChartTitle>
  {#if hasData}
    <ChartContainer>
      <div class="h-full w-full" bind:this={chartRef}></div>
    </ChartContainer>
  {:else}
    <EmptyState message="No data for this range" cta="Try a wider date range" />
  {/if}
</Container>
