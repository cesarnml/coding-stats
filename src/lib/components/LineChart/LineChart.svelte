<svelte:options runes={true} />

<script lang="ts">
  import * as echarts from 'echarts'
  import { onMount } from 'svelte'
  import Container from '../Container.svelte'
  import ChartTitle from '../ChartTitle.svelte'
  import { createLineChartData, createLineChartOption } from './lineChartHelpers'
  import type { SummariesResult } from '$src/types/wakatime'
  import ChartContainer from '../common/ChartContainer.svelte'

  let { summaries, title }: { summaries: SummariesResult; title: string } = $props()

  let chartRef: HTMLDivElement
  let chart: echarts.ECharts

  const data = $derived(createLineChartData(summaries))
  const option = $derived(createLineChartOption(data, summaries.color))

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

  $effect(() => {
    chart?.setOption(option)
  })
</script>

<Container>
  <ChartTitle>{title}</ChartTitle>
  <ChartContainer>
    <div class="h-full w-full" bind:this={chartRef}></div>
  </ChartContainer>
</Container>
