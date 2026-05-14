<script lang="ts">
  import { page } from '$app/stores'
  import type { SummariesResult } from '$src/types/wakatime'
  import * as echarts from 'echarts'
  import { afterUpdate, onMount } from 'svelte'
  import Container from '../Container.svelte'
  import ChartTitle from '../ChartTitle.svelte'
  import {
    createProjectFileToTimeDict,
    createTreemapData,
    createTreemapOption,
  } from './treemapHelpers'
  import ChartContainer from '../common/ChartContainer.svelte'

  export let summaries: SummariesResult
  export let title: string

  let chartRef: HTMLDivElement
  let chart: echarts.ECharts

  $: filesToTimeDict = createProjectFileToTimeDict(summaries, $page.params.projectName)
  $: data = createTreemapData(filesToTimeDict)

  $: option = createTreemapOption(data, $page.params.projectName)

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

  afterUpdate(() => {
    chart.setOption(option)
  })
</script>

<Container>
  <ChartTitle>{title}</ChartTitle>
  <div class="p-6">
    <ChartContainer>
      <div class="h-full w-full" bind:this={chartRef} />
    </ChartContainer>
  </div>
</Container>
