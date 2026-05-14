<script lang="ts">
  import { dev } from '$app/environment'
  import { goto, invalidate } from '$app/navigation'
  import { page } from '$app/stores'
  import Footer from '$lib/components/Footer.svelte'
  import Navbar from '$lib/components/Navbar/Navbar.svelte'
  import PageTransition from '$lib/components/PageTransition.svelte'
  import { selectedRange } from '$lib/stores/selectedRange'
  import { profile } from '$lib/stores/profile'
  import { inject } from '@vercel/analytics'
  import { onMount } from 'svelte'
  import 'tippy.js/animations/scale.css'
  import 'tippy.js/dist/tippy.css'
  import 'tippy.js/themes/light.css'
  import '../app.css'
  import { project } from '$lib/stores/project'
  import { session } from '$lib/stores/session'

  // Initiate Vercel analytics
  inject({ mode: dev ? 'development' : 'production', debug: false })

  export let data

  $: ({
    pathname,
    session: initialSession,
    supabase,
    projects: initialProjects,
    profile: initialProfile,
  } = data)

  $: {
    session.set(initialSession)
    profile.set(initialProfile)
    project.set(initialProjects)
  }

  onMount(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, _session) => {
      if (_session?.expires_at !== $session?.expires_at) {
        invalidate('supabase:auth')
      }
    })
    return () => subscription.unsubscribe()
  })

  $: if ($selectedRange && !profile) {
    const url = new URL(window.location.href)
    url.searchParams.set('range', $selectedRange)
    goto(url, { replaceState: true, keepFocus: true })
  }
</script>

<svelte:head>
  <meta name="description" content="Visualize your coding metrics!" />
  <link rel="canonical" href={$page.url.href} />
</svelte:head>

<main>
  <Navbar />
  <div class="flex min-h-screen w-full flex-col">
    <div class="relative mx-auto w-full max-w-screen-xl flex-1 pt-20">
      <PageTransition {pathname}>
        <slot />
      </PageTransition>
    </div>
    <div class="py-8">
      <Footer />
    </div>
  </div>
</main>
