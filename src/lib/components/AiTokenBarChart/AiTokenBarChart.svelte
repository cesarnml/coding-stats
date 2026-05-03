<script lang="ts">
  import { afterUpdate, onMount } from 'svelte'
  import * as echarts from 'echarts'
  import type { SummariesResult } from '$src/types/wakatime'
  import Container from '../Container.svelte'
  import ChartTitle from '../ChartTitle.svelte'
  import ChartContainer from '../common/ChartContainer.svelte'
  import EmptyState from '../EmptyState.svelte'
  import { buildAiTokenBarOption, buildAiTokenBarSeries } from './AiTokenBarChartHelpers'

  export let summaries: SummariesResult
  export let title = 'AI Token Usage'

  let chartRef: HTMLDivElement
  let chart: echarts.ECharts

  $: series = buildAiTokenBarSeries(summaries)
  $: hasData = series.hasData
  $: option = buildAiTokenBarOption(series)

  onMount(() => {
    if (!chartRef) return
    chart = echarts.init(chartRef, 'dark', { renderer: 'svg' })
    const handleResize = () => chart.resize()
    window.addEventListener('resize', handleResize, { passive: true })
    if (hasData) chart.setOption(option)

    return () => {
      chart?.dispose()
      window.removeEventListener('resize', handleResize)
    }
  })

  afterUpdate(() => {
    if (!chartRef) return
    if (!chart) chart = echarts.init(chartRef, 'dark', { renderer: 'svg' })
    if (hasData) chart.setOption(option)
  })
</script>

<Container>
  <ChartTitle>{title}</ChartTitle>
  {#if hasData}
    <ChartContainer>
      <div class="h-full w-full" bind:this={chartRef} data-testid="ai-token-chart" />
    </ChartContainer>
  {:else}
    <EmptyState message="No AI token data for this range" cta="AI data accumulates daily" />
  {/if}
</Container>
