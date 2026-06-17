<svelte:options runes={true} />

<script lang="ts">
  import { onMount } from 'svelte'
  import * as echarts from 'echarts'
  import type { SummariesResult } from '$src/types/wakatime'
  import Container from '../Container.svelte'
  import ChartTitle from '../ChartTitle.svelte'
  import ChartContainer from '../common/ChartContainer.svelte'
  import EmptyState from '../EmptyState.svelte'
  import { buildAiLinesPieOption, computeAiLinesSlices } from './AiLinesPieChartHelpers'

  let { summaries, title = 'AI vs Human Lines' }: { summaries: SummariesResult; title?: string } =
    $props()

  let chartRef: HTMLDivElement
  let chart: echarts.ECharts

  const slices = $derived(computeAiLinesSlices(summaries))
  const hasData = $derived(slices !== null)
  const option = $derived(hasData ? buildAiLinesPieOption(slices!) : null)

  onMount(() => {
    if (!chartRef) return
    chart = echarts.init(chartRef, 'dark', { renderer: 'svg' })
    const handleResize = () => chart.resize()
    window.addEventListener('resize', handleResize, { passive: true })
    if (option) chart.setOption(option)

    return () => {
      chart?.dispose()
      window.removeEventListener('resize', handleResize)
    }
  })

  $effect(() => {
    if (!chartRef) return
    if (!chart) chart = echarts.init(chartRef, 'dark', { renderer: 'svg' })
    if (option) chart.setOption(option)
  })
</script>

<Container>
  <ChartTitle>{title}</ChartTitle>
  {#if hasData}
    <ChartContainer>
      <div class="h-full w-full" bind:this={chartRef} data-testid="ai-lines-chart"></div>
    </ChartContainer>
  {:else}
    <EmptyState message="No AI line data for this range" cta="AI data accumulates daily" />
  {/if}
</Container>
