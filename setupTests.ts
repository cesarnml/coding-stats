// setupTests.ts
import '@testing-library/jest-dom'
import { vi } from 'vitest'


// jsdom does not implement the Web Animations API; stub it so Svelte 5
// transitions don't crash in tests.
Element.prototype.animate = vi.fn(() => ({
  onfinish: null,
  cancel: vi.fn(),
  finish: vi.fn(),
}))

// jsdom's HTMLCanvasElement.getContext returns null; stub a minimal 2d context
// so ECharts (zrender) can initialise without throwing during tests.
HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
  clearRect: vi.fn(),
  fillRect: vi.fn(),
  strokeRect: vi.fn(),
  beginPath: vi.fn(),
  closePath: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  arc: vi.fn(),
  fill: vi.fn(),
  stroke: vi.fn(),
  clip: vi.fn(),
  save: vi.fn(),
  restore: vi.fn(),
  translate: vi.fn(),
  scale: vi.fn(),
  rotate: vi.fn(),
  transform: vi.fn(),
  setTransform: vi.fn(),
  drawImage: vi.fn(),
  createLinearGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
  createRadialGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
  measureText: vi.fn(() => ({ width: 0 })),
  fillText: vi.fn(),
  strokeText: vi.fn(),
  putImageData: vi.fn(),
  getImageData: vi.fn(() => ({ data: [] })),
  createPattern: vi.fn(),
  createImageData: vi.fn(),
  setLineDash: vi.fn(),
  getLineDash: vi.fn(() => []),
  quadraticCurveTo: vi.fn(),
  bezierCurveTo: vi.fn(),
  arcTo: vi.fn(),
  rect: vi.fn(),
  canvas: { width: 300, height: 150 },
}))
import type { Navigation, Page } from '@sveltejs/kit'
import { readable } from 'svelte/store'
import * as environment from '$app/environment'
import * as navigation from '$app/navigation'
import * as stores from '$app/stores'

vi.mock('$lib/stores/media', () => ({
  media: readable({
    sm: true,
    md: true,
    lg: true,
    xl: true,
    '2xl': true,
  }),
}))
// Mock SvelteKit runtime module $app/environment
vi.mock('$app/environment', (): typeof environment => ({
  browser: false,
  dev: true,
  building: false,
  version: 'any',
}))

// Mock SvelteKit runtime module $app/navigation
vi.mock('$app/navigation', (): typeof navigation => ({
  afterNavigate: () => vi.fn(),
  beforeNavigate: () => vi.fn(),
  disableScrollHandling: () => vi.fn(),
  goto: () => Promise.resolve(),
  invalidate: () => Promise.resolve(),
  invalidateAll: () => Promise.resolve(),
  preloadData: () => Promise.resolve(),
  preloadCode: () => Promise.resolve(),
}))

// Mock SvelteKit runtime module $app/stores
vi.mock('$app/stores', (): typeof stores => {
  const getStores: typeof stores.getStores = () => {
    const navigating = readable<Navigation | null>(null)
    const page = readable<Page>({
      url: new URL('http://localhost'),
      params: {},
      route: {
        id: null,
      },
      status: 200,
      error: null,
      data: {},
      form: undefined,
    })
    const updated = { subscribe: readable(false).subscribe, check: async () => false }

    return { navigating, page, updated }
  }

  const page: typeof stores.page = {
    subscribe(fn) {
      return getStores().page.subscribe(fn)
    },
  }
  const navigating: typeof stores.navigating = {
    subscribe(fn) {
      return getStores().navigating.subscribe(fn)
    },
  }
  const updated: typeof stores.updated = {
    subscribe(fn) {
      return getStores().updated.subscribe(fn)
    },
    check: async () => false,
  }

  return {
    getStores,
    navigating,
    page,
    updated,
  }
})
