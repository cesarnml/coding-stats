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
  import StatPanelItem from '$lib/components/Stats/StatPanelItem.svelte'
  import AiLinesPieChart from '$lib/components/AiLinesPieChart/AiLinesPieChart.svelte'
  import AiTokenBarChart from '$lib/components/AiTokenBarChart/AiTokenBarChart.svelte'
  import TimelineChart from '$lib/components/TimelineChart/TimelineChart.svelte'
  import { ApiEndpoint, WakaApiRange, type ValueOf } from '$lib/constants'
  import { loading } from '$lib/stores/loading'
  import { selectedRange } from '$lib/stores/selectedRange'
  import { onMount } from 'svelte'
  import type { PageData } from './$types'
  import { invalidate } from '$app/navigation'

  export let data: PageData

  let { summaries, durations, durationsByLanguage, profile } = data

  $: ({ summaries, durations, durationsByLanguage, profile } = data)

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
  <ActivityChart {durations} itemType="project" />
  <StatsPanel {summaries} showFullPanel />
  <div class="overflow-x-auto">
    <div class="stats bg-chart-dark shadow-lg">
      <StatPanelItem title="AI Additions" icon="mdi:robot-outline" label="ai-additions">
        {#if aiStats.ai_additions === 0}
          <span>—</span>
        {:else}
          {aiStats.ai_additions.toLocaleString()} lines
        {/if}
      </StatPanelItem>
      <StatPanelItem title="AI Deletions" icon="mdi:robot-outline" label="ai-deletions">
        {#if aiStats.ai_deletions === 0}
          <span>—</span>
        {:else}
          {aiStats.ai_deletions.toLocaleString()} lines
        {/if}
      </StatPanelItem>
      <StatPanelItem title="Human Additions" icon="mdi:account-outline" label="human-additions">
        {#if aiStats.human_additions === 0}
          <span>—</span>
        {:else}
          {aiStats.human_additions.toLocaleString()} lines
        {/if}
      </StatPanelItem>
      <StatPanelItem title="Human Deletions" icon="mdi:account-outline" label="human-deletions">
        {#if aiStats.human_deletions === 0}
          <span>—</span>
        {:else}
          {aiStats.human_deletions.toLocaleString()} lines
        {/if}
      </StatPanelItem>
      <StatPanelItem title="Total Tokens" icon="mdi:lightning-bolt-outline" label="total-tokens">
        {#if aiStats.total_tokens === 0}
          <span>—</span>
        {:else}
          {aiStats.total_tokens.toLocaleString()}
        {/if}
      </StatPanelItem>
    </div>
  </div>
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
