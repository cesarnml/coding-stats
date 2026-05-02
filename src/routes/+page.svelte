<script lang="ts">
  import ActivityChart from '$lib/components/BarChart/ActivityChart.svelte'
  import BreakdownChart from '$lib/components/BarChart/BreakdownChart.svelte'
  import StackedBarChart from '$lib/components/BarChart/StackedBarChart.svelte'
  import WeekdaysBarChart from '$lib/components/BarChart/WeekdaysBarChart.svelte'
  import DateRangeSelect from '$lib/components/DateRangeSelect.svelte'
  import DailyGauge from '$lib/components/GaugeChart/DailyGauge.svelte'
  import PieChart from '$lib/components/PieChart/PieChart.svelte'
  import ProjectList from '$lib/components/ProjectList.svelte'
  import StatsPanel from '$lib/components/Stats/StatsPanel.svelte'
  import TimelineChart from '$lib/components/TimelineChart/TimelineChart.svelte'
  import { ApiEndpoint, WakaApiRange, type ValueOf } from '$lib/constants'
  import { loading } from '$lib/stores/loading'
  import { selectedRange } from '$lib/stores/selectedRange'
  import { onMount } from 'svelte'
  import type { PageData } from './$types'
  import { invalidate } from '$app/navigation'

  export let data: PageData

  $: ({ summaries, durations, durationsByLanguage, profile } = data)

  onMount(() => {
    if (profile && profile.range !== $selectedRange) {
      selectedRange.set(profile.range as ValueOf<WakaApiRange>)
      invalidate('supabase:signin')
    } else if ($selectedRange === 'Pick a range') {
      selectedRange.set(WakaApiRange.Last_30_Days)
    }
  })

  const onWakaRange = async () => {
    loading.on()
    try {
      summaries = await fetch(`${ApiEndpoint.SupabaseSummaries}?range=${$selectedRange}`).then(
        (response) => response.json(),
      )
    } finally {
      loading.off()
    }
  }
</script>

<svelte:head>
  <title>Coding Stats</title>
</svelte:head>

<div class="space-y-4 px-2 md:px-4">
  <div class="flex justify-end">
    <DateRangeSelect on:wakarange={onWakaRange} />
  </div>
  <StatsPanel {summaries} showFullPanel />
  <ActivityChart {durations} itemType="project" />
  <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
    <BreakdownChart {summaries} title="Project Breakdown" />
    {#if $selectedRange !== WakaApiRange.Today && $selectedRange !== WakaApiRange.Yesterday}
      <WeekdaysBarChart {summaries} />
    {/if}
    <StackedBarChart {summaries} itemsType="projects" title="Coding Time By Project" />
    <StackedBarChart {summaries} itemsType="categories" title="Coding Time By Category" />
    <PieChart {summaries} title="Languages" />
    {#if $selectedRange !== WakaApiRange.Today && $selectedRange !== WakaApiRange.Yesterday}
      <DailyGauge {summaries} title="Discipline Gauge" />
    {/if}
    <TimelineChart {durations} itemType="project" />
    <TimelineChart durations={durationsByLanguage} itemType="language" />
  </div>
  <ProjectList {summaries} />
</div>
