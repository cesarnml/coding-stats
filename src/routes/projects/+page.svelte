<script lang="ts">
  import SearchInput from '$lib/components/common/SearchInput.svelte'
  import { Url } from '$lib/constants.js'
  import { ChartColor } from '$lib/helpers/chartHelpers.js'
  import { upsertProject } from '$lib/supabase/projects'
  import { project } from '$lib/stores/project.js'
  import type { WakaProjectResult } from '$src/types/wakatime.js'

  export let data

  $: ({ wakaProjects, supabase } = data)

  const onSearch = (e: CustomEvent<WakaProjectResult>) => {
    wakaProjects = e.detail
  }

  const syncProject = (row: Awaited<ReturnType<typeof upsertProject>>) => {
    if (!row) return
    const existing = ($project ?? []).some((p) => p.name === row.name)
    if (existing) {
      project.update(row)
    } else {
      project.add(row)
    }
  }

  const onTrackProject = async (projectName: string) => {
    syncProject(await upsertProject(supabase, { name: projectName, is_tracked: true }))
  }

  const onUnTrackProject = async (projectName: string) => {
    syncProject(await upsertProject(supabase, { name: projectName, is_tracked: false }))
  }

  const onColorChange = async (projectName: string, color: string) => {
    syncProject(await upsertProject(supabase, { name: projectName, color }))
  }

  const getInputValue = (event: Event) =>
    event.target instanceof HTMLInputElement ? event.target.value : ''

  const isTracked = (name: string) => ($project ?? []).find((p) => p.name === name)?.is_tracked
</script>

<div class="space-y-8">
  <SearchInput on:search={onSearch} />
  <ul class="w-full space-y-4 px-4">
    {#each wakaProjects.data as { name } (name)}
      <li class="flex items-center gap-4">
        <div class="inline-flex flex-col">
          <input
            class="project-color"
            type="color"
            value={$project?.find((p) => p.name === name)?.color ?? ChartColor.Icon}
            on:change={(event) => onColorChange(name, getInputValue(event))}
          />
        </div>
        <a
          class="link-hover link mr-auto line-clamp-1 text-ellipsis font-semibold text-neutral-content"
          href={Url.ProjectDetail(name)}>{name}</a
        >
        {#if isTracked(name)}
          <button class="btn-sm btn" type="button" on:click={() => onUnTrackProject(name)}
            >Tracking</button
          >
        {:else}
          <button
            class="btn-secondary btn-sm btn"
            type="button"
            on:click={() => onTrackProject(name)}>Track</button
          >
        {/if}
      </li>
    {/each}
  </ul>
</div>

<style lang="postcss">
  .project-color {
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
    width: 30px;
    height: 30px;
    background-color: transparent;
    cursor: pointer;
    border-radius: 50%;
  }
  .project-color::-webkit-color-swatch {
    border-radius: 50%;
    border: none;
  }

  .project-color::-webkit-color-swatch-wrapper {
    padding: 0;
  }
  .project-color::-moz-color-swatch,
  .project-color::-moz-focus-inner {
    border-radius: 50%;
    border: none;
  }
  .project-color::-moz-focus-inner {
    padding: 0;
  }
</style>
