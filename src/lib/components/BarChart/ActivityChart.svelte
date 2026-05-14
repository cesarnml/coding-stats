<script lang="ts">
  import DailyChartControls from '$lib/components/BarChart/DailyChartControls.svelte'
  import ChartTitle from '$lib/components/ChartTitle.svelte'
  import Container from '$lib/components/Container.svelte'
  import type { SupabaseDuration } from '$src/routes/api/supabase/durations/+server'
  import * as echarts from 'echarts'
  import { afterUpdate, onMount } from 'svelte'
  import BigChartContainer from '../common/BigChartContainer.svelte'
  import DailyTitleContent from './DailyTitleContent.svelte'
  import { createActiveHoursData, createActiveHoursOption } from './barChartHelpers'

  export let durations: SupabaseDuration
  export let itemType: 'project' | 'language'

  let chartRef: HTMLDivElement
  let chart: echarts.ECharts

  $: data = createActiveHoursData(durations)
  $: option = createActiveHoursOption(data, durations)

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

  afterUpdate(() => chart.setOption(option))

  const onUpdate = (e: CustomEvent<SupabaseDuration>) => (durations = e.detail)
</script>

<Container>
  <ChartTitle>
    <DailyTitleContent showCurrentTime title="Activity" {durations} />
  </ChartTitle>
  <DailyChartControls {durations} {itemType} on:update={onUpdate} />
  <BigChartContainer>
    <div class="h-full w-full" bind:this={chartRef} />
  </BigChartContainer>
</Container>
