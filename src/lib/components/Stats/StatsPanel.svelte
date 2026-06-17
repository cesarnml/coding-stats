<script lang="ts">
  import { formatTime } from '$lib/helpers/timeHelpers'
  import type { SummariesResult } from '$src/types/wakatime'
  import first from 'lodash/first'
  import StatPanelItem from './StatPanelItem.svelte'
  import { createProjectList, getTopLanguage } from './statHelpers'
  import { Url, WakaApiRange } from '$lib/constants'
  import { selectedRange } from '$lib/stores/selectedRange'
  import {
    computeAverageSeconds,
    computeHolidayCount,
    computeTotalSeconds,
  } from './summariesHelpers'

  let {
    summaries,
    showFullPanel = false,
  }: { summaries: SummariesResult; showFullPanel?: boolean } = $props()

  const NO_TOP_PROJECT_MESSAGE = 'N/A'

  const totalSeconds = $derived(computeTotalSeconds(summaries))
  const holidayCount = $derived(computeHolidayCount(summaries))
  const averageSeconds = $derived(computeAverageSeconds(summaries))

  const topLanguage = $derived(showFullPanel ? getTopLanguage(summaries) : '')
  const projectList = $derived(showFullPanel ? createProjectList(summaries) : [])
  const topProject = $derived(
    showFullPanel ? (first(projectList)?.name ?? NO_TOP_PROJECT_MESSAGE) : NO_TOP_PROJECT_MESSAGE,
  )

  const isSingleDay = $derived(
    ([WakaApiRange.Today, WakaApiRange.Yesterday] as string[]).includes($selectedRange),
  )
</script>

<div class="overflow-x-auto">
  <div class="stats bg-chart-dark shadow-lg">
    <StatPanelItem title="Total Hours" icon="mdi:clock-outline" label="clock">
      {formatTime(totalSeconds) || 'N/A'}
    </StatPanelItem>
    {#if !isSingleDay}
      <StatPanelItem title="Daily Average" icon="material-symbols:bar-chart-rounded" label="chart">
        {formatTime(averageSeconds)}
      </StatPanelItem>
      <StatPanelItem
        title="No Code Days"
        icon="material-symbols:code-blocks-outline-rounded"
        label="code"
      >
        {holidayCount} days
      </StatPanelItem>
    {/if}
    {#if showFullPanel}
      <StatPanelItem
        title="Top Project"
        icon="material-symbols:folder-outline-rounded"
        label="folder"
      >
        <a class="link-hover link" href="{Url.ProjectDetail(topProject)}?range={$selectedRange}"
          >{topProject}</a
        >
      </StatPanelItem>
      <StatPanelItem title="Top Language" icon="tabler:world" label="world">
        {topLanguage}
      </StatPanelItem>
    {/if}
  </div>
</div>
