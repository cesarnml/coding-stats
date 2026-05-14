<script lang="ts">
  import SearchInput from '$lib/components/common/SearchInput.svelte'
  import { Url } from '$lib/constants.js'
  import { ChartColor } from '$lib/helpers/chartHelpers.js'
  import { project } from '$lib/stores/project.js'
  import type { WakaProjectResult } from '$src/types/wakatime.js'

  export let data

  $: ({ wakaProjects, supabase } = data)

  const onSearch = (e: CustomEvent<WakaProjectResult>) => {
    wakaProjects = e.detail
  }

  const onTrackProject = async (projectName: string) => {
    const { data } = await supabase.from('projects').select('*').eq('name', projectName).single()
    if (!data) {
      const { data: newProject } = await supabase
        .from('projects')
        .insert({ name: projectName, is_tracked: true })
        .select('*')
        .single()

      if (newProject) {
        project.add(newProject)
      }
    } else {
      const { data: updatedProject } = await supabase
        .from('projects')
        .update({ is_tracked: true })
        .eq('name', projectName)
        .select('*')
        .single()

      if (updatedProject) {
        project.update(updatedProject)
      }
    }
  }
  const onUnTrackProject = async (projectName: string) => {
    const { data: updatedProject } = await supabase
      .from('projects')
      .update({ is_tracked: false })
      .eq('name', projectName)
      .select('*')
      .single()

    if (updatedProject) {
      project.update(updatedProject)
    }
  }

  const onColorChange = async (projectName: string, color: string) => {
    const { data } = await supabase.from('projects').select('*').eq('name', projectName).single()
    if (!data) {
      const { data: newProject } = await supabase
        .from('projects')
        .insert({ name: projectName, color })
        .select('*')
        .single()

      if (newProject) {
        project.add(newProject)
      }
    } else {
      const { data: updatedProject } = await supabase
        .from('projects')
        .update({ color })
        .eq('name', projectName)
        .select('*')
        .single()

      if (updatedProject) {
        project.update(updatedProject)
      }
    }
  }

  const getInputValue = (event: Event) =>
    event.target instanceof HTMLInputElement ? event.target.value : ''
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
        {#if ($project ?? []).find((p) => p?.name?.includes(name))?.is_tracked}
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
