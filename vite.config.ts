import { sveltekit } from '@sveltejs/kit/vite'
// import { sentrySvelteKit } from '@sentry/sveltekit'
import { defineConfig, loadEnv } from 'vite'
import Inspect from 'vite-plugin-inspect'
import viteCompression from 'vite-plugin-compression'
import tsconfigPaths from 'vite-tsconfig-paths'

const config = defineConfig(({ mode }) => {
  // Only setup Sentry in production
  const isProduction = mode === 'production'
  // Gain access to environmental variables within vite config
  const env = loadEnv(mode, process.cwd(), '')
  return {
    build: {
      target: 'esnext', // minimize transpilation
      sourcemap: true, // Tell vite to emit source maps
      chunkSizeWarningLimit: 1200,
      reportCompressedSize: false,
      // rollupOptions: {
      //   output: {
      //     manualChunks: function manualChunks(id) {
      //       if (id.includes('echarts')) {
      //         return 'echarts'
      //       }
      //     },
      //   },
      // },
    },
    plugins: [
      sveltekit(), // Add the sentry-vite-plugin last
      tsconfigPaths(),
      viteCompression({ algorithm: 'brotliCompress', ext: '.br' }),
      Inspect({
        build: true,
        outputDir: '.vite-inspect',
      }),
      // isProduction
      //   ? sentrySvelteKit({
      //       adapter: 'vercel',
      //       sourceMapsUploadOptions: {
      //         org: env.PUBLIC_SENTRY_ORG,
      //         project: env.PUBLIC_SENTRY_PROJECT,
      //         authToken: env.SENTRY_AUTH_TOKEN,
      //         telemetry: false,
      //         cleanArtifacts: true,
      //         setCommits: {
      //           auto: true,
      //         },
      //       },
      //     })
      //   : '',
    ],
    define: {
      // Eliminate in-source test code
      'import.meta.vitest': 'undefined',
    },
    test: {
      globals: true,
      environmentMatchGlobs: [
        // all tests in tests/dom will run in jsdom
        ['**/*.edge.spec.ts', 'edge-runtime'],
        ['**/*.node.spec.ts', 'node'],
        ['**/*.spec.ts', 'jsdom'],
        // ...
      ],
      setupFiles: ['setupTests.ts', 'src/mocks/setup.ts'],
      deps: {
        inline: ['echarts', /msw/],
      },
      include: ['src/**/*.spec.{js,ts}'],
      coverage: {
        all: true,
        enabled: true,
        reporter: ['json', 'html', 'text', 'lcov'],
        src: ['./src'],
        skipFull: true,
        include: ['src/**/*.{ts, svelte}', 'src/lib/components/**/*.svelte'],
        exclude: [
          'src/lib/external',
          'src/lib/typings',
          'src/routes/**/+page*.ts',
          'src/routes/**/+layout*.ts',
          'src/routes/**/+error.svelte',
          'src/hooks.client.ts',
          'src/hooks.server.ts',
          'src/**/*.spec.{js,ts}',
          'src/lib/generated/**/*.ts',
          'src/lib/constants.ts',
          'src/mocks',
          'src/**/*.d.ts',
          'src/**/*.types.ts',
        ],
      },
    },
  }
})

export default config
