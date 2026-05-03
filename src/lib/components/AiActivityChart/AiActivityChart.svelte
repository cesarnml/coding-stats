<script lang="ts">
  import * as echarts from 'echarts'
  import { afterUpdate, onMount } from 'svelte'
  import ChartTitle from '../ChartTitle.svelte'
  import Container from '../Container.svelte'
  import ChartContainer from '../common/ChartContainer.svelte'
  import {
    buildAiActivityOption,
    type AiActivityOption,
    type AiSeriesEntry,
  } from './AiActivityChartHelpers'

  export let data: AiSeriesEntry[] = []

  let chartRef: HTMLDivElement | undefined
  let chart: echarts.ECharts | null = null
  let handleResize: (() => void) | null = null
  let option: AiActivityOption

  $: option = buildAiActivityOption(data)

  const disposeChart = () => {
    if (handleResize) {
      window.removeEventListener('resize', handleResize)
      handleResize = null
    }
    chart?.dispose()
    chart = null
  }

  const syncChart = () => {
    if (!chartRef || data.length === 0) {
      disposeChart()
      return
    }
    if (!chart) {
      chart = echarts.init(chartRef, 'dark', { renderer: 'svg' })
      handleResize = () => chart?.resize()
      window.addEventListener('resize', handleResize, { passive: true })
    }
    chart.setOption(option, true)
  }

  onMount(() => {
    syncChart()
    return disposeChart
  })

  afterUpdate(() => {
    syncChart()
  })
</script>

<Container>
  <ChartTitle>AI vs Human Additions</ChartTitle>
  {#if data.length === 0}
    <p class="px-4 py-8 text-center text-sm text-base-content/60">
      AI data accumulates daily from your ship date. Check back tomorrow.
    </p>
  {:else}
    <ChartContainer>
      <div class="h-full w-full" data-testid="ai-activity-chart" bind:this={chartRef}></div>
    </ChartContainer>
  {/if}
</Container>
