<!-- src/routes/account/+page.svelte -->
<script lang="ts">
  import { enhance } from '$app/forms'
  import { goto } from '$app/navigation'
  import { Url } from '$lib/constants'

  export let data

  let { profile } = data

  let loading = false
  let name: string | null = profile?.name ?? null

  function handleSubmit() {
    loading = true
    return async () => {
      loading = false
      goto(Url.Home, { replaceState: true })
    }
  }
</script>

<div class="space-y-6">
  <form class="flex flex-col gap-4" method="post" action="?/update" use:enhance={handleSubmit}>
    <div>
      <label class="label label-text lowercase" for="name">Name</label>
      <input class="input input-md input-primary" id="name" name="name" type="text" value={name} />
    </div>

    <div>
      <input type="submit" value={loading ? 'Loading...' : 'Update'} disabled={loading} />
    </div>
  </form>

  <form method="post" action="?/signout">
    <button class="btn btn-primary btn-wide" type="submit" disabled={loading}>Sign Out</button>
  </form>
</div>
