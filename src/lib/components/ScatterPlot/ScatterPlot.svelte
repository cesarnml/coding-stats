<svelte:options runes={true} />

<script lang="ts">
  import type { StorySearchResults } from '$lib/generated/openapi/shortcut'
  import { getStoryBranches } from '$lib/helpers/chartHelpers'
  import type { SummariesResult } from '$src/types/wakatime'
  import * as echarts from 'echarts'
  import { onMount } from 'svelte'
  import Container from '../Container.svelte'
  import ChartTitle from '../ChartTitle.svelte'
  import {
    createBranchToEstimateDict,
    createBranchToTimeDict,
    createBranchesByEstimateDict,
    createScatterPlotOption,
  } from './scatterPlotHelpers'
  import BigChartContainer from '../common/BigChartContainer.svelte'

  let {
    summaries,
    stories,
    title = 'Estimation Accuracy',
  }: { summaries: SummariesResult; stories: StorySearchResults; title?: string } = $props()

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
  const branchToEstimateDict = $derived(createBranchToEstimateDict(stories))
  const branchToTimeDict = $derived(createBranchToTimeDict(summaries, available_branches))
  const branchesByEstimateDict = $derived(
    createBranchesByEstimateDict(branchToEstimateDict, branchToTimeDict),
  )

  const option = $derived(
    createScatterPlotOption(
      storyBranches,
      branchToEstimateDict,
      branchToTimeDict,
      branchesByEstimateDict,
    ),
  )

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
  <BigChartContainer>
    <div class="h-full w-full" bind:this={chartRef}></div>
  </BigChartContainer>
</Container>
