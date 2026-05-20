<script lang="ts">
  import { page } from '$app/stores'

  export let data
  const { supabase } = data
  const signInWithGitHub = async () => {
    const redirect = import.meta.env.PROD
      ? 'https://codingstats.vercel.app'
      : 'http://localhost:5173'
    await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${$page.url.origin}/login-redirect?redirect=${redirect}`,
      },
    })
  }
</script>

<svelte:head>
  <title>Login</title>
</svelte:head>

<div class="flex justify-center pt-8">
  <button class="btn-primary btn" type="button" on:click={signInWithGitHub}>
    Sign in with GitHub
  </button>
</div>
