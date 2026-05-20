<script lang="ts">
  import { TOP_LEVEL_NAV_URLS, Url } from '$lib/constants'
  import { profile } from '$lib/stores/profile'
  import { session } from '$lib/stores/session'
  import NavLink from './NavLink.svelte'

  $: navUrls = TOP_LEVEL_NAV_URLS.filter((url) => url !== Url.Projects || $session)
</script>

<div class="flex gap-8">
  {#each navUrls as url}
    {#if $profile && url === Url.Login}
      <div class="dropdown-bottom dropdown-end dropdown relative">
        <!-- svelte-ignore a11y-label-has-associated-control -->
        <!-- svelte-ignore a11y-no-noninteractive-tabindex -->
        <label tabindex="0">
          <img src={$profile.avatar_url} alt="avatar" width="46" height="46" class="rounded-full" />
        </label>
        <!-- svelte-ignore a11y-no-noninteractive-tabindex -->
        <ul tabindex="0" class="dropdown-content menu rounded-box !top-16 w-fit bg-base-100 shadow">
          <li>
            <a href={Url.Account} class="link-hover">Account</a>
          </li>
          <li>
            <form method="POST" action="?/signout">
              <button type="submit" class="link-hover">Logout</button>
            </form>
          </li>
        </ul>
      </div>
    {:else}
      <NavLink {url} label={url.split('/')[1]} />
    {/if}
  {/each}
</div>
