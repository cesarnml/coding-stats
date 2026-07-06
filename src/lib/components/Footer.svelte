<script lang="ts">
  import DarkModeToggle from '$lib/components/DarkModeToggle.svelte'
  import 'iconify-icon'
</script>

<footer class="mx-auto flex max-w-screen-2xl flex-col items-center gap-4">
  <nav aria-label="footer" class="flex items-center gap-6">
    <a href="https://github.com/cesarnml/coding-stats" target="_blank" rel="noopener noreferrer">
      <iconify-icon icon="mdi:github"></iconify-icon>
      GitHub
    </a>
    <a href="https://codingstatsfordummies.vercel.app" target="_blank" rel="noopener noreferrer">
      <iconify-icon icon="material-symbols:menu-book-outline-rounded"></iconify-icon>
      Dev Guide
    </a>
  </nav>
  <DarkModeToggle />
</footer>

<style lang="postcss">
  @reference '../../app.css';

  a {
    @apply flex items-center gap-1.5 text-sm transition-colors hover:text-primary;
  }
  iconify-icon {
    @apply text-lg;
  }
</style>
