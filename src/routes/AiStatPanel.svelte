<svelte:options runes={true} />

<script lang="ts">
  import StatPanelItem from '$lib/components/Stats/StatPanelItem.svelte'

  let {
    aiStats,
  }: {
    aiStats: {
      ai_additions: number
      ai_deletions: number
      human_additions: number
      human_deletions: number
      total_tokens: number
    }
  } = $props()
</script>

<div class="overflow-x-auto">
  <div class="stats bg-chart-dark shadow-lg">
    <StatPanelItem title="AI Additions" icon="mdi:robot-outline" label="ai-additions">
      {#if aiStats.ai_additions === 0}
        <span>—</span>
      {:else}
        {aiStats.ai_additions.toLocaleString()} lines
      {/if}
    </StatPanelItem>
    <StatPanelItem title="AI Deletions" icon="mdi:robot-outline" label="ai-deletions">
      {#if aiStats.ai_deletions === 0}
        <span>—</span>
      {:else}
        {aiStats.ai_deletions.toLocaleString()} lines
      {/if}
    </StatPanelItem>
    <StatPanelItem title="Human Additions" icon="mdi:account-outline" label="human-additions">
      {#if aiStats.human_additions === 0}
        <span>—</span>
      {:else}
        {aiStats.human_additions.toLocaleString()} lines
      {/if}
    </StatPanelItem>
    <StatPanelItem title="Human Deletions" icon="mdi:account-outline" label="human-deletions">
      {#if aiStats.human_deletions === 0}
        <span>—</span>
      {:else}
        {aiStats.human_deletions.toLocaleString()} lines
      {/if}
    </StatPanelItem>
    <StatPanelItem title="Total Tokens" icon="mdi:lightning-bolt-outline" label="total-tokens">
      {#if aiStats.total_tokens === 0}
        <span>—</span>
      {:else}
        {aiStats.total_tokens.toLocaleString()}
      {/if}
    </StatPanelItem>
  </div>
</div>
