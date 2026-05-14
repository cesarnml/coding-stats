<script lang="ts">
  import { Url } from '$lib/constants'
  import { DateFormat } from '$lib/helpers/timeHelpers'
  import type { PageData } from './$types'
  import dayjs from 'dayjs'
  import 'iconify-icon'

  export let data: PageData

  $: ({ iterations, lazy } = data)
</script>

<div class="iterations-container w-full overflow-x-auto rounded-lg bg-chart-dark px-2 md:px-4">
  <div class="iterations-inner flex w-fit gap-4">
    {#each iterations as iteration (iteration.id)}
      <div class="card glass card-body flex h-full min-w-[400px] flex-col overflow-y-auto p-4">
        <div class="mb-6">
          <div class="mb-2">
            <a class="text-lg font-bold text-primary" href={Url.IterationDetail(iteration.id)}
              >{iteration.name}</a
            >
          </div>
          <div class="flex justify-between text-xs">
            <div class="space-x-2">
              <span class="font-mono text-[11px] capitalize">{iteration.status}</span>
              <div class="inline-block">
                <span>{dayjs(iteration.start_date).format(DateFormat.Long)}</span>
                <span> to </span>
                <span>{dayjs(iteration.end_date).format(DateFormat.Long)}</span>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <div class="flex items-center gap-1">
                <iconify-icon
                  icon="material-symbols:menu-book-outline-sharp"
                  role="img"
                  aria-label="book"
                />
                {iteration.stats.num_stories_unstarted +
                  iteration.stats.num_stories_started +
                  iteration.stats.num_stories_done +
                  iteration.stats.num_stories_backlog}
              </div>
              <div class="flex items-center gap-1">
                <iconify-icon
                  icon="material-symbols:bar-chart-rounded"
                  role="img"
                  aria-label="stats"
                />
                {iteration.stats.num_points}
              </div>
              <div class="flex items-center gap-1">
                <iconify-icon icon="gg:loadbar-doc" role="img" aria-label="docs" />
                {iteration.stats.num_related_documents}
              </div>
            </div>
          </div>
        </div>
        <div class="overflow-y-auto overflow-x-hidden">
          <div class="flex flex-col gap-4">
            {#await lazy.iterationStoriesDict[iteration.id] then stories}
              {#if !stories.length}
                <div class="btn-outline btn-secondary btn h-32 p-2">EMPTY</div>
              {:else}
                {#each stories as story}
                  <button class="btn-outline btn-accent btn h-32 p-2" type="button"
                    >{story.name}</button
                  >
                {/each}
              {/if}
            {/await}
          </div>
        </div>
      </div>
    {/each}
  </div>
</div>

<style lang="postcss">
  .iterations-container {
    height: calc(100vh - 90px);
  }
  .iterations-inner {
    height: stretch;
  }
</style>
