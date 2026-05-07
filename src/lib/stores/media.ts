import { readable } from 'svelte/store'

/**
 * **NOTE:**
 * `media` store *must* remain in sync with `screens` declared in `tailwind.config.cjs`
 */
const mediaQueries = {
  sm: '(min-width: 640px)',
  md: '(min-width: 768px)',
  lg: '(min-width: 1024px)',
  xl: '(min-width: 1280px)',
  '2xl': '(min-width: 1536px)',
} as const

type MediaBreakpoints = {
  [K in keyof typeof mediaQueries]: boolean
}

const defaultMatches = Object.fromEntries(
  Object.keys(mediaQueries).map((key) => [key, false]),
) as MediaBreakpoints

export const media = readable<MediaBreakpoints>(defaultMatches, (set) => {
  if (typeof window === 'undefined') {
    return () => {}
  }

  const entries = Object.entries(mediaQueries).map(([key, query]) => {
    const mql = window.matchMedia(query)
    return [key as keyof MediaBreakpoints, mql] as const
  })

  const update = () => {
    const next = Object.fromEntries(
      entries.map(([key, mql]) => [key, mql.matches]),
    ) as MediaBreakpoints
    set(next)
  }

  for (const [, mql] of entries) {
    mql.addEventListener('change', update)
  }

  update()

  return () => {
    for (const [, mql] of entries) {
      mql.removeEventListener('change', update)
    }
  }
})
