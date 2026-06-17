<script lang="ts">
  import { onMount } from 'svelte'
  import * as echarts from 'echarts'
  import dayjs from 'dayjs'
  import advanceFormat from 'dayjs/plugin/advancedFormat.js'
  import type { SummariesResult } from '$src/types/wakatime'
  import Container from '../Container.svelte'
  import ChartTitle from '../ChartTitle.svelte'
  import { createDisciplineGaugeData, createDisciplineGaugeOption } from './gaugeChartHelpers'
  import DailyGaugeControls from './DailyGaugeControls.svelte'
  import ChartContainer from '../common/ChartContainer.svelte'
  import EmptyState from '../EmptyState.svelte'

  dayjs.extend(advanceFormat)

  let { summaries, title }: { summaries: SummariesResult; title: string } = $props()

  let chartRef: HTMLDivElement
  let chart: echarts.ECharts

  const hasData = $derived((summaries.data?.length ?? 0) > 0)

  let selectedDate = $state('')
  const availableDates = $derived(summaries.data?.map((summary) => summary.range.date) ?? [])
  const defaultDate = $derived(availableDates.at(-1) ?? '')

  $effect(() => {
    if (defaultDate && (!selectedDate || !availableDates.includes(selectedDate))) {
      selectedDate = defaultDate
    }
  })

  const data = $derived(createDisciplineGaugeData(summaries, selectedDate))
  const option = $derived(createDisciplineGaugeOption(data))

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

  $effect(() => {
    if (!chartRef) return
    if (!chart) chart = echarts.init(chartRef, 'dark', { renderer: 'canvas' })
    chart.setOption(option)
  })

  const onUpdate = (detail: string) => {
    selectedDate = detail
  }
</script>

<Container>
  <ChartTitle>{title}</ChartTitle>
  {#if hasData}
    <DailyGaugeControls {summaries} {selectedDate} onupdate={onUpdate} />
    <ChartContainer>
      <div class="h-full w-full" bind:this={chartRef}></div>
    </ChartContainer>
  {:else}
    <EmptyState message="No data for this range" cta="Try a wider date range" />
  {/if}
</Container>
