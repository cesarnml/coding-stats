<script lang="ts">
  import * as echarts from 'echarts'
  import { afterUpdate, onDestroy, onMount } from 'svelte'
  import ChartTitle from '../ChartTitle.svelte'
  import Container from '../Container.svelte'
  import ChartContainer from '../common/ChartContainer.svelte'
  import { buildAiActivityOption, type AiSeriesEntry } from './AiActivityChartHelpers'

  export let data: AiSeriesEntry[]

  let chartRef: HTMLDivElement
  let chart: echarts.ECharts

  $: option = buildAiActivityOption(data)

  onMount(() => {
    if (data.length === 0) return
    chart = echarts.init(chartRef, 'dark', { renderer: 'svg' })
    const handleResize = () => chart.resize()
    window.addEventListener('resize', handleResize, { passive: true })
    chart.setOption(option)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  })

  afterUpdate(() => {
    if (data.length === 0) return
    if (!chart) {
      chart = echarts.init(chartRef, 'dark', { renderer: 'svg' })
    }
    chart.setOption(option)
  })

  onDestroy(() => {
    chart?.dispose()
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
