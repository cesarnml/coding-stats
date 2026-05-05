<script lang="ts">
  import { onMount } from 'svelte'
  import * as echarts from 'echarts'
  import dayjs from 'dayjs'
  import advanceFormat from 'dayjs/plugin/advancedFormat.js'
  import type { SummariesResult } from '$src/types/wakatime'
  import { afterUpdate } from 'svelte'
  import Container from '../Container.svelte'
  import ChartTitle from '../ChartTitle.svelte'
  import { createDisciplineGaugeData, createDisciplineGaugeOption } from './gaugeChartHelpers'
  import DailyGaugeControls from './DailyGaugeControls.svelte'
  import ChartContainer from '../common/ChartContainer.svelte'
  import EmptyState from '../EmptyState.svelte'

  dayjs.extend(advanceFormat)

  export let summaries: SummariesResult
  export let title: string

  let chartRef: HTMLDivElement
  let chart: echarts.ECharts

  $: hasData = (summaries.data?.length ?? 0) > 0
  $: selectedDate = summaries.data?.at(-1)?.range.date ?? ''
  $: data = createDisciplineGaugeData(summaries, selectedDate)
  $: option = createDisciplineGaugeOption(data)

  onMount(() => {
    if (!chartRef) return
    chart = echarts.init(chartRef, 'dark', { renderer: 'canvas' })
    const handleResize = () => chart.resize()
    window.addEventListener('resize', handleResize, { passive: true })
    chart.setOption(option)

    return () => {
      chart?.dispose()
      window.removeEventListener('resize', handleResize)
    }
  })

  afterUpdate(() => {
    if (!chartRef) return
    if (!chart) chart = echarts.init(chartRef, 'dark', { renderer: 'canvas' })
    chart.setOption(option)
  })

  const onUpdate = (e: CustomEvent<string>) => (selectedDate = e.detail)
</script>

<Container>
  <ChartTitle>{title}</ChartTitle>
  {#if hasData}
    <DailyGaugeControls {summaries} {selectedDate} on:update={onUpdate} />
    <ChartContainer>
      <div class="h-full w-full" bind:this={chartRef} />
    </ChartContainer>
  {:else}
    <EmptyState message="No data for this range" cta="Try a wider date range" />
  {/if}
</Container>
