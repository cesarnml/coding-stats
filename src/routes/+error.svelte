<script lang="ts">
  import { page } from '$app/stores'
</script>

<h1>Oh snap!</h1>
{#if import.meta.env.DEV}
  <p style="font-family: monospace; white-space: pre-wrap;">
    {JSON.stringify($page.error?.stack, null, 2)}
  </p>
{:else}
  <p>An error has occurred. I have spoken.</p>
{/if}
