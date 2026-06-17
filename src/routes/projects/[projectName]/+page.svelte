<svelte:options runes={true} />

<script lang="ts">
  import { page } from '$app/stores'
  import StackedBarChart from '$lib/components/BarChart/StackedBarChart.svelte'
  import VerticalBarChart from '$lib/components/BarChart/VerticalBarChart.svelte'
  import WeekdaysBarChart from '$lib/components/BarChart/WeekdaysBarChart.svelte'
  import Container from '$lib/components/Container.svelte'
  import ChartTitle from '$lib/components/ChartTitle.svelte'
  import DateRangeSelect from '$lib/components/DateRangeSelect.svelte'
  import LineChart from '$lib/components/LineChart/LineChart.svelte'
  import PieChart from '$lib/components/PieChart/PieChart.svelte'
  import ScatterPlot from '$lib/components/ScatterPlot/ScatterPlot.svelte'
  import StatsPanel from '$lib/components/Stats/StatsPanel.svelte'
  import Treemap from '$lib/components/Treemap/Treemap.svelte'
  import {
    ApiEndpoint,
    WakaApiRange,
    WakaToShortcutApiRange,
    type ValueOf,
  } from '$lib/constants.js'
  import { buildSummariesUrl } from '$lib/helpers/buildSummariesUrl'
  import { DateFormat } from '$lib/helpers/timeHelpers.js'
  import { customDateRange } from '$lib/stores/customDateRange'
  import { loading } from '$lib/stores/loading.js'
  import { selectedRange } from '$lib/stores/selectedRange.js'
  import dayjs from 'dayjs'
  import { onMount } from 'svelte'

  let { data } = $props()

  let summariesOverride = $state<typeof data.summaries | null>(null)
  let storiesOverride = $state<typeof data.stories | null>(null)

  const summaries = $derived(summariesOverride ?? data.summaries)
  const stories = $derived(storiesOverride ?? data.stories)
  const available_branches = $derived(
    summaries.data
      ? [
          ...new Set(
            summaries.data.flatMap((summary) => summary.branches.map((branch) => branch.name)),
          ),
        ]
      : [],
  )

  onMount(() => {
    if (data.profile?.range && data.profile.range !== $selectedRange) {
      selectedRange.set(data.profile.range as ValueOf<WakaApiRange>)
    }
  })

  const onWakaRange = async () => {
    const shortcutRange =
      $selectedRange === WakaApiRange.Custom && $customDateRange.start && $customDateRange.end
        ? dayjs($customDateRange.end).diff(dayjs($customDateRange.start), 'd')
        : WakaToShortcutApiRange[$selectedRange as keyof typeof WakaToShortcutApiRange]
    loading.on()
    try {
      const summariesUrl = buildSummariesUrl(
        $selectedRange,
        $customDateRange.start,
        $customDateRange.end,
        $page.params.projectName,
      )
      const responses = await Promise.all([
        fetch(summariesUrl),
        fetch(
          `${ApiEndpoint.SearchStories}?query=has:branch moved:${dayjs()
            .subtract(shortcutRange, 'd')
            .format(DateFormat.Query)}..*`,
        ),
      ])
      summariesOverride = await responses[0].json()
      storiesOverride = await responses[1].json()
    } catch (err) {
      console.error('Failed to fetch project data:', err)
    } finally {
      loading.off()
    }
  }
</script>

<div class="space-y-4 px-2 md:px-4">
  <div class="flex flex-col items-center justify-between sm:flex-row sm:items-center">
    <h1
      class="my-auto flex h-full items-center self-start pb-6 pt-2 font-mono font-semibold uppercase text-primary-focus sm:items-center sm:pb-0"
    >
      {$page.params.projectName}
    </h1>
    <DateRangeSelect onwakarange={onWakaRange} />
  </div>
  <StatsPanel {summaries} />
  <div class="grid grid-cols-1 gap-8 lg:grid-cols-2">
    {#if $selectedRange !== WakaApiRange.Today && $selectedRange !== WakaApiRange.Yesterday}
      <LineChart {summaries} title="Coding Activity" />
    {/if}
    <PieChart {summaries} title="Languages" />
    {#if $selectedRange !== WakaApiRange.Today && $selectedRange !== WakaApiRange.Yesterday}
      <WeekdaysBarChart {summaries} />
    {/if}
    <StackedBarChart {summaries} itemsType="categories" title="Coding Activity by Category" />
  </div>
  <VerticalBarChart {summaries} title="Branch Completion" />
  <Container>
    <ChartTitle>Preview Branch Deploy</ChartTitle>
    <div class="grid grid-cols-1 gap-2 px-6 pb-6 lg:grid-cols-2">
      {#await data.lazy.aliases}
        <div>Loading ...</div>
      {:then result}
        {#each result.aliases as alias}
          {#if alias.alias.includes(`${data.projectName}-git-cesar-sc`) && available_branches.find( (branch) => branch.includes((alias.alias.match(/sc-(\d+)/g) ?? [''])[0]), )}
            <div>
              <a class="link-hover link-primary link" href={`https://${alias.alias}`}
                >{available_branches
                  .find((branch) => branch.includes((alias.alias.match(/sc-(\d+)/g) ?? [''])[0]))
                  ?.split('cesar/')[1]}</a
              >
            </div>
          {/if}
        {/each}
      {/await}
    </div>
  </Container>
  <ScatterPlot {summaries} {stories} />
  <Treemap {summaries} title="Files In Focus" />
</div>
