<script lang="ts">
  export let message: string
  export let cta: string | undefined = undefined
  export let show = true
</script>

{#if show}
  <div class="flex flex-col items-center justify-center gap-1 py-10 text-base-content/50">
    <p class="text-sm">{message}</p>
    {#if cta}
      <p class="text-xs">{cta}</p>
    {/if}
  </div>
{/if}
