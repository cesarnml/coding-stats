<svelte:options runes={true} />

<script lang="ts">
  import { onMount } from 'svelte'
  import * as echarts from 'echarts'
  import Container from '../Container.svelte'
  import ChartTitle from '../ChartTitle.svelte'
  import { createPieChartOption, createPieChartData } from './pieChartHelpers'
  import type { SummariesResult } from '$src/types/wakatime'
  import ChartContainer from '../common/ChartContainer.svelte'
  import EmptyState from '../EmptyState.svelte'

  let { summaries, title }: { summaries: SummariesResult; title: string } = $props()

  let chartRef: HTMLDivElement
  let chart: echarts.ECharts

  const hasData = $derived((summaries.data?.length ?? 0) > 0)
  const data = $derived(createPieChartData(summaries))
  const option = $derived(createPieChartOption(data))

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
      <div class="h-full w-full" bind:this={chartRef} data-testid="chart"></div>
    </ChartContainer>
  {:else}
    <EmptyState message="No data for this range" cta="Try a wider date range" />
  {/if}
</Container>
