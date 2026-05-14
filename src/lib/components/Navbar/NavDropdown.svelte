<script lang="ts">
  import DarkModeToggle from '$lib/components/DarkModeToggle.svelte'
  import { DROPDOWN_NAV_URLS, Url } from '$lib/constants'
  import { dropdown } from '$lib/stores/dropdown'
  import { session } from '$lib/stores/session'
  import NavLink from './NavLink.svelte'
</script>

{#if $dropdown}
  <div class="z-50 flex h-full flex-col items-center gap-8 pt-16">
    {#each DROPDOWN_NAV_URLS as url}
      {#if url === Url.Login && $session}
        <NavLink url={Url.Account} label="Account" isLarge />
        <form method="POST" action="?/signout">
          <button
            type="submit"
            class="link-hover btn-link btn px-0 text-2xl capitalize no-underline">Logout</button
          >
        </form>
      {:else}
        <NavLink {url} label={url.split('/')[1] || 'Home'} isLarge />
      {/if}
    {/each}
    <div class="mb-12 mt-auto">
      <DarkModeToggle />
    </div>
  </div>
{/if}
