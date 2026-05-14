<script>
  import { dropdown } from '$lib/stores/dropdown'
  import 'iconify-icon'
</script>

<div class="relative">
  {#if $dropdown}
    <button type="button" on:click={dropdown.close} aria-label="close nav dropdown">
      <iconify-icon icon="material-symbols:close-rounded" />
    </button>
  {:else}
    <button type="button" on:click={dropdown.open} aria-label="open nav dropdown">
      <iconify-icon icon="ci:hamburger-md" />
    </button>
  {/if}
</div>

<style lang="postcss">
  @reference '../../../app.css';

  button {
    @apply flex items-center;
  }
  iconify-icon {
    @apply text-3xl text-primary;
  }
</style>
