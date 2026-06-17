<svelte:options runes={true} />

<script lang="ts">
  import { dev } from '$app/environment'
  import { goto, invalidate } from '$app/navigation'
  import { page } from '$app/stores'
  import Footer from '$lib/components/Footer.svelte'
  import Navbar from '$lib/components/Navbar/Navbar.svelte'
  import PageTransition from '$lib/components/PageTransition.svelte'
  import { WakaApiRangePrompt } from '$lib/constants'
  import { selectedRange } from '$lib/stores/selectedRange'
  import { profile } from '$lib/stores/profile'
  import { inject } from '@vercel/analytics'
  import { onMount } from 'svelte'
  import type { Snippet } from 'svelte'
  import 'tippy.js/animations/scale.css'
  import 'tippy.js/dist/tippy.css'
  import 'tippy.js/themes/light.css'
  import '../app.css'
  import { project } from '$lib/stores/project'
  import { session } from '$lib/stores/session'

  // Initiate Vercel analytics
  inject({ mode: dev ? 'development' : 'production', debug: false })

  let { data, children }: { data: any; children: Snippet } = $props()

  $effect(() => {
    session.set(data.session)
    profile.set(data.profile)
    project.set(data.projects)
  })

  onMount(() => {
    const {
      data: { subscription },
    } = data.supabase.auth.onAuthStateChange((event: string, _session: any) => {
      if (_session?.expires_at !== $session?.expires_at) {
        invalidate('supabase:auth')
      }
    })
    return () => subscription.unsubscribe()
  })

  $effect(() => {
    if (
      typeof window !== 'undefined' &&
      $selectedRange &&
      $selectedRange !== WakaApiRangePrompt &&
      !$profile
    ) {
      const url = new URL(window.location.href)
      if (url.searchParams.get('range') !== $selectedRange) {
        url.searchParams.set('range', $selectedRange)
        goto(url, { replaceState: true, keepFocus: true })
      }
    }
  })
</script>

<svelte:head>
  <meta name="description" content="Visualize your coding metrics!" />
  <link rel="canonical" href={$page.url.href} />
</svelte:head>

<main>
  <Navbar />
  <div class="flex min-h-screen w-full flex-col">
    <div class="relative mx-auto w-full max-w-screen-xl flex-1 pt-20">
      <PageTransition pathname={data.pathname}>
        {@render children()}
      </PageTransition>
    </div>
    <div class="py-8">
      <Footer />
    </div>
  </div>
</main>
