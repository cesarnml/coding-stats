<svelte:options runes={true} />

<script lang="ts">
  let { message, cta, show = true }: { message: string; cta?: string; show?: boolean } = $props()
</script>

{#if show}
  <div class="flex flex-col items-center justify-center gap-1 py-10 text-base-content/50">
    <p class="text-sm">{message}</p>
    {#if cta}
      <p class="text-xs">{cta}</p>
    {/if}
  </div>
{/if}
