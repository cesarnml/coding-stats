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

  export let summaries: SummariesResult
  export let showFullPanel = false

  const NO_TOP_PROJECT_MESSAGE = 'N/A'

  let topProject: string
  let topLanguage: string
  let projectList: ReturnType<typeof createProjectList>

  $: totalSeconds = computeTotalSeconds(summaries)
  $: holidayCount = computeHolidayCount(summaries)
  $: averageSeconds = computeAverageSeconds(summaries)

  $: if (showFullPanel) {
    topLanguage = getTopLanguage(summaries)
    projectList = createProjectList(summaries)
    topProject = first(projectList)?.name ?? NO_TOP_PROJECT_MESSAGE
  }
  // @ts-expect-error tough type
  $: isSingleDay = [WakaApiRange.Today, WakaApiRange.Yesterday].includes($selectedRange)
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
