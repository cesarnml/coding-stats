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
  import { injectAnalytics } from '@vercel/analytics/sveltekit'
  import { onMount } from 'svelte'
  import type { Snippet } from 'svelte'
  import 'tippy.js/animations/scale.css'
  import 'tippy.js/dist/tippy.css'
  import 'tippy.js/themes/light.css'
  import '../app.css'
  import { project } from '$lib/stores/project'
  import { session } from '$lib/stores/session'

  // Initiate Vercel analytics
  injectAnalytics({ mode: dev ? 'development' : 'production', debug: false })

  let { data, children }: { data: any; children: Snippet } = $props()

  // Built via concatenation so the Svelte parser never sees a literal closing script tag
  const jsonLd =
    `<script type="application/ld+json">` +
    JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'CodingStats',
      url: 'https://codingstats.vercel.app',
      description:
        'Personal coding dashboard — WakaTime activity stored in Supabase and visualized as an Apple Health for coders.',
      author: { '@type': 'Person', name: 'Cesar Mejia Leiva', url: 'https://github.com/cesarnml' },
    }) +
    `${'</'}script>`

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
  <meta
    name="description"
    content="CodingStats — Apple Health for coders. Own your WakaTime data beyond the 7-day free tier: coding-time trends, per-project hours, AI-usage stats, and client-ready reports."
  />
  <meta
    name="keywords"
    content="CodingStats, WakaTime dashboard, coding time tracking, coding fitness, developer productivity, WakaTime data retention, AI coding stats, per-project hours, SvelteKit, Supabase"
  />
  <meta name="author" content="Cesar Mejia Leiva" />
  <link rel="canonical" href={$page.url.href} />
  <meta property="og:site_name" content="CodingStats" />
  <meta property="og:type" content="website" />
  <meta property="og:title" content="CodingStats — Apple Health for coders" />
  <meta
    property="og:description"
    content="Own your WakaTime data beyond the 7-day free tier: coding-time trends, per-project hours, AI-usage stats, and client-ready reports."
  />
  <meta property="og:url" content={$page.url.href} />
  <meta property="og:image" content="https://codingstats.vercel.app/og-image.png" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="CodingStats — Apple Health for coders" />
  <meta
    name="twitter:description"
    content="Own your WakaTime data beyond the 7-day free tier: coding-time trends, per-project hours, AI-usage stats, and client-ready reports."
  />
  <meta name="twitter:image" content="https://codingstats.vercel.app/og-image.png" />
  <!-- JSON-LD is a static, fully app-controlled string — no user input involved -->
  <!-- eslint-disable-next-line svelte/no-at-html-tags -->
  {@html jsonLd}
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
