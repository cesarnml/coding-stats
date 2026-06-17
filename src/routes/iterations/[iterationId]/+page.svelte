<script lang="ts">
  import type { PageData } from './$types'

  let { data }: { data: PageData } = $props()
  const { stories } = data
</script>

<pre>{JSON.stringify(stories, null, 2)}</pre>
