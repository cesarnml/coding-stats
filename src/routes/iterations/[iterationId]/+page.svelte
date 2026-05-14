<script lang="ts">
  import type { PageData } from './$types'

  export let data: PageData
  const { stories } = data
</script>

<pre>{JSON.stringify(stories, null, 2)}</pre>
