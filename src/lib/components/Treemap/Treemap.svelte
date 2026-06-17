<script lang="ts">
  import { page } from '$app/stores'
  import type { SummariesResult } from '$src/types/wakatime'
  import * as echarts from 'echarts'
  import { onMount } from 'svelte'
  import Container from '../Container.svelte'
  import ChartTitle from '../ChartTitle.svelte'
  import {
    createProjectFileToTimeDict,
    createTreemapData,
    createTreemapOption,
  } from './treemapHelpers'
  import ChartContainer from '../common/ChartContainer.svelte'

  let { summaries, title }: { summaries: SummariesResult; title: string } = $props()

  let chartRef: HTMLDivElement
  let chart: echarts.ECharts

  const filesToTimeDict = $derived(createProjectFileToTimeDict(summaries, $page.params.projectName))
  const data = $derived(createTreemapData(filesToTimeDict))
  const option = $derived(createTreemapOption(data, $page.params.projectName))

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
  <div class="p-6">
    <ChartContainer>
      <div class="h-full w-full" bind:this={chartRef}></div>
    </ChartContainer>
  </div>
</Container>
