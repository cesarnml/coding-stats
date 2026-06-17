<script lang="ts">
  import DailyChartControls from '$lib/components/BarChart/DailyChartControls.svelte'
  import ChartTitle from '$lib/components/ChartTitle.svelte'
  import Container from '$lib/components/Container.svelte'
  import type { SupabaseDuration } from '$src/routes/api/supabase/durations/+server'
  import * as echarts from 'echarts'
  import { onMount } from 'svelte'
  import BigChartContainer from '../common/BigChartContainer.svelte'
  import DailyTitleContent from './DailyTitleContent.svelte'
  import { createActiveHoursData, createActiveHoursOption } from './barChartHelpers'

  let {
    durations: durationsProp,
    itemType,
  }: { durations: SupabaseDuration; itemType: 'project' | 'language' } = $props()

  let durations = $state(durationsProp)

  let chartRef: HTMLDivElement
  let chart: echarts.ECharts

  const data = $derived(createActiveHoursData(durations))
  const option = $derived(createActiveHoursOption(data, durations))

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

  const onUpdate = (detail: SupabaseDuration) => (durations = detail)
</script>

<Container>
  <ChartTitle>
    <DailyTitleContent showCurrentTime title="Activity" {durations} />
  </ChartTitle>
  <DailyChartControls {durations} {itemType} onupdate={onUpdate} />
  <BigChartContainer>
    <div class="h-full w-full" bind:this={chartRef}></div>
  </BigChartContainer>
</Container>
