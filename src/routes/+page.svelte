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
  import AiStatPanel from './AiStatPanel.svelte'
  import AiLinesPieChart from '$lib/components/AiLinesPieChart/AiLinesPieChart.svelte'
  import AiTokenBarChart from '$lib/components/AiTokenBarChart/AiTokenBarChart.svelte'
  import TimelineChart from '$lib/components/TimelineChart/TimelineChart.svelte'
  import { WakaApiRange, type ValueOf } from '$lib/constants'
  import { buildSummariesUrl } from '$lib/helpers/buildSummariesUrl'
  import { customDateRange } from '$lib/stores/customDateRange'
  import { loading } from '$lib/stores/loading'
  import { selectedRange } from '$lib/stores/selectedRange'
  import { fromNow } from '$lib/helpers/timeHelpers'
  import { onMount } from 'svelte'
  import type { PageData } from './$types'
  import { invalidate } from '$app/navigation'

  export let data: PageData

  // eslint-disable-next-line no-useless-assignment
  let { summaries, durations, durationsByLanguage, profile } = data

  $: ({ summaries, durations, durationsByLanguage, profile } = data)

  $: maxDate = summaries.max_date ?? null
  $: maxDateFormatted = maxDate ? fromNow(maxDate) : null

  $: aiStats = summaries.data.reduce(
    (acc, day) => {
      acc.ai_additions += day.grand_total.ai_additions ?? 0
      acc.ai_deletions += day.grand_total.ai_deletions ?? 0
      acc.human_additions += day.grand_total.human_additions ?? 0
      acc.human_deletions += day.grand_total.human_deletions ?? 0
      acc.total_tokens +=
        (day.grand_total.ai_input_tokens ?? 0) + (day.grand_total.ai_output_tokens ?? 0)
      return acc
    },
    {
      ai_additions: 0,
      ai_deletions: 0,
      human_additions: 0,
      human_deletions: 0,
      total_tokens: 0,
    },
  )

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
      const url = buildSummariesUrl($selectedRange, $customDateRange.start, $customDateRange.end)
      summaries = await fetch(url).then((response) => response.json())
    } catch (err) {
      console.error('Failed to fetch summaries:', err)
    } finally {
      loading.off()
    }
  }
</script>

<svelte:head>
  <title>Coding Stats</title>
</svelte:head>

<div class="space-y-4 px-2 md:px-4">
  <div class="flex items-center justify-between">
    <div>
      {#if maxDateFormatted}
        <p class="text-xs text-base-content/50">Updated {maxDateFormatted}</p>
      {/if}
    </div>
    <DateRangeSelect on:wakarange={onWakaRange} />
  </div>
  <StatsPanel {summaries} showFullPanel />
  <AiStatPanel {aiStats} />
  <ActivityChart {durations} itemType="project" />
  <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
    <AiLinesPieChart {summaries} />
    <AiTokenBarChart {summaries} />
  </div>
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
