<script lang="ts">
  import { onMount } from 'svelte'
  import * as echarts from 'echarts'
  import type { SummariesResult } from '$src/types/wakatime'
  import Container from '../Container.svelte'
  import ChartTitle from '../ChartTitle.svelte'
  import ChartContainer from '../common/ChartContainer.svelte'
  import EmptyState from '../EmptyState.svelte'
  import { buildAiTokenBarOption, buildAiTokenBarSeries } from './AiTokenBarChartHelpers'

  let { summaries, title = 'AI Token Usage' }: { summaries: SummariesResult; title?: string } =
    $props()

  let chartRef: HTMLDivElement
  let chart: echarts.ECharts

  const series = $derived(buildAiTokenBarSeries(summaries))
  const hasData = $derived(series.hasData)
  const option = $derived(buildAiTokenBarOption(series))

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

  $effect(() => {
    if (!chartRef) return
    if (!chart) chart = echarts.init(chartRef, 'dark', { renderer: 'svg' })
    if (hasData) chart.setOption(option)
  })
</script>

<Container>
  <ChartTitle>{title}</ChartTitle>
  {#if hasData}
    <ChartContainer>
      <div class="h-full w-full" bind:this={chartRef} data-testid="ai-token-chart"></div>
    </ChartContainer>
  {:else}
    <EmptyState message="No AI token data for this range" cta="AI data accumulates daily" />
  {/if}
</Container>
