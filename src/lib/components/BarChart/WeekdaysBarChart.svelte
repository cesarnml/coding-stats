<svelte:options runes={true} />

<script lang="ts">
  import * as echarts from 'echarts'
  import Container from '../Container.svelte'
  import ChartTitle from '../ChartTitle.svelte'
  import { createSimpleBarChartOption, type SimpleBarChartOption } from './barChartHelpers'
  import type { SummariesResult } from '$src/types/wakatime'
  import { onMount } from 'svelte'
  import ChartContainer from '../common/ChartContainer.svelte'
  import EmptyState from '../EmptyState.svelte'

  let { summaries, title = 'Weekly Breakdown' }: { summaries: SummariesResult; title?: string } =
    $props()

  let chartRef: HTMLDivElement
  let chart: echarts.ECharts

  const hasData = $derived((summaries.data?.length ?? 0) > 0)
  const option: SimpleBarChartOption = $derived(createSimpleBarChartOption(summaries))

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
