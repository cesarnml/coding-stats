<script lang="ts">
  import * as echarts from 'echarts'
  import { onMount } from 'svelte'
  import Container from '../Container.svelte'
  import ChartTitle from '../ChartTitle.svelte'
  import type { SummariesResult } from '$src/types/wakatime'
  import { ApiEndpoint, SHORTCUT_STORY_IDENTIFIER } from '$lib/constants'
  import { getStoryBranches, getStoryIdFromShortName } from '$lib/helpers/chartHelpers'
  import {
    createVerticalBarChartDatasetSource,
    createVerticalBarChartOption,
  } from './verticalBarChartHelpers'
  import BigChartContainer from '../common/BigChartContainer.svelte'

  let { summaries, title = 'Branches vs Time' }: { summaries: SummariesResult; title?: string } =
    $props()

  let chartRef: HTMLDivElement
  let chart: echarts.ECharts

  const available_branches = $derived(
    summaries.data
      ? [
          ...new Set(
            summaries.data.flatMap((summary) => summary.branches.map((branch) => branch.name)),
          ),
        ]
      : [],
  )

  const storyBranches = $derived(getStoryBranches(available_branches))
  const source = $derived(createVerticalBarChartDatasetSource(summaries))
  const option = $derived(createVerticalBarChartOption(source, storyBranches))

  onMount(() => {
    chart = echarts.init(chartRef, 'dark', { renderer: 'svg' })
    const handleResize = () => chart.resize()
    window.addEventListener('resize', handleResize, { passive: true })
    chart.setOption(option)

    // @ts-expect-error tough type
    chart.on('click', async (params) => {
      const data = Array.isArray(params.data) ? params.data : []
      const branch = String(data[0] ?? '')
      if (branch.includes(SHORTCUT_STORY_IDENTIFIER)) {
        const storyId = getStoryIdFromShortName(branch)
        const response = await fetch(`${ApiEndpoint.SearchStories}?query=id:${storyId}`)
        const result = await response.json()
        const storyLink: string = (result.data ?? [''])[0]?.app_url
        window.open(storyLink, '_blank')
      }
    })

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
  <BigChartContainer>
    <div class="h-full w-full" bind:this={chartRef}></div>
  </BigChartContainer>
</Container>
