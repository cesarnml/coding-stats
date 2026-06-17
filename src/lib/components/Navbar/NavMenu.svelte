<script lang="ts">
  import { dropdown } from '$lib/stores/dropdown'
  import 'iconify-icon'
</script>

<div class="relative">
  {#if $dropdown}
    <button type="button" onclick={dropdown.close} aria-label="close nav dropdown">
      <iconify-icon icon="material-symbols:close-rounded"></iconify-icon>
    </button>
  {:else}
    <button type="button" onclick={dropdown.open} aria-label="open nav dropdown">
      <iconify-icon icon="ci:hamburger-md"></iconify-icon>
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
