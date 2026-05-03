<script lang="ts">
  import { goto } from '$app/navigation'
  import type { SummariesResult } from '$src/types/wakatime'
  import * as echarts from 'echarts'
  import { afterUpdate, onMount } from 'svelte'
  import Container from '../Container.svelte'
  import ChartTitle from '../ChartTitle.svelte'
  import {
    createBreakdownChartData,
    createBreakdownChartOption,
    filterBreakdownChartData,
  } from './horizontalBarChartHelpers'
  import { Url } from '$lib/constants'
  import 'iconify-icon'
  import tippy from 'tippy.js'
  import { secPerHour } from '$lib/helpers/timeHelpers'
  import ChartContainer from '../common/ChartContainer.svelte'
  import EmptyState from '../EmptyState.svelte'

  export let summaries: SummariesResult
  export let title: string
  export let isFiltered = true

  let chartRef: HTMLDivElement
  let chart: echarts.ECharts

  $: hasData = (summaries.data?.length ?? 0) > 0
  $: data = createBreakdownChartData(summaries)
  $: filteredData = filterBreakdownChartData(data)
  $: option = createBreakdownChartOption(
    isFiltered
      ? filteredData
      : Object.entries(data).reduce((acc, [key, value]) => {
          return { ...acc, [key]: value / secPerHour }
        }, {} as Record<string, number>),
  )

  onMount(() => {
    chart = echarts.init(chartRef, 'dark', { renderer: 'svg' })
    const handleResize = () => chart.resize()
    window.addEventListener('resize', handleResize, { passive: true })
    chart.setOption(option)

    tippy(document.querySelectorAll('[data-tippy-content]'), {
      theme: 'light',
      animation: 'scale',
      duration: [500, 0],
    })

    chart.on('click', (params) => {
      goto(Url.ProjectDetail(params.name))
    })

    return () => {
      chart.dispose()
      window.removeEventListener('resize', handleResize)
    }
  })

  afterUpdate(() => {
    tippy(document.querySelectorAll('[data-tippy-content]'), {
      theme: 'light',
      animation: 'scale',
    })
    chart.setOption(option)
  })
</script>

<Container>
  <ChartTitle>
    <div class="relative flex items-center justify-center">
      <span />
      <h2>
        {title}
      </h2>
      <div class="absolute right-0 top-0 flex h-full items-center gap-6">
        <button class="flex items-center" type="button" on:click={() => (isFiltered = !isFiltered)}>
          {#if isFiltered}
            <iconify-icon
              class="h-full text-base"
              icon="bi:filter-circle"
              data-tippy-content="Show all projects"
              role="img"
              aria-label="filter on"
            />
          {:else}
            <iconify-icon
              class="h-full text-base text-zinc-500"
              icon="bi:filter-circle"
              data-tippy-content="Hide small values"
              role="img"
              aria-label="filter off"
            />
          {/if}
        </button>
        <iconify-icon
          icon="solar:info-circle-linear"
          data-tippy-content="Click a bar to view project details"
          role="img"
          aria-label="info"
        />
      </div>
    </div>
  </ChartTitle>
  {#if hasData}
    <ChartContainer>
      <div class="h-full w-full" bind:this={chartRef} />
    </ChartContainer>
  {:else}
    <EmptyState message="No data for this range" cta="Try a wider date range" />
  {/if}
</Container>
