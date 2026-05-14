<script lang="ts">
  import { Url } from '$lib/constants'
  import { formatHours, formatMinimalWork, formatMinutes } from '$lib/helpers/timeHelpers'
  import type { SummariesResult } from '$src/types/wakatime'
  import { createProjectList } from './Stats/statHelpers'
  export let summaries: SummariesResult

  $: projects = createProjectList(summaries)
</script>

<div class="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
  {#each projects as { name, value } (name)}
    <a class="card glass" href={Url.ProjectDetail(name)}>
      <div class="card-body flex flex-col p-4">
        <h2 class="card-title flex-grow">
          {name}
        </h2>
        <div>
          {formatHours(value)}
          {formatMinutes(value)}
          {formatMinimalWork(value)}
        </div>
      </div>
    </a>
  {/each}
</div>
