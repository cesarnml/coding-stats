<script lang="ts">
  import NavLinks from '$lib/components/Navbar/NavLinks.svelte'
  import NavMenu from '$lib/components/Navbar/NavMenu.svelte'
  import { media } from '$lib/stores/media'
</script>

{#if $media.sm}
  <NavLinks />
{:else}
  <NavMenu />
{/if}
