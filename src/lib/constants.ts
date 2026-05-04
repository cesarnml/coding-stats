export const WakaSliceBy = {
  None: '',
  Entity: 'entity',
  Language: 'language',
  Dependencies: 'dependencies',
  OS: 'os',
  Editor: 'editor',
  Machine: 'machine',
} as const

export const WakaApiRangePrompt = 'Pick a range'
export type WakaApiRangePrompt = typeof WakaApiRangePrompt

export const WakaApiRange = {
  Today: 'Today',
  Yesterday: 'Yesterday',
  Last_7_Days: 'Last 7 Days',
  Last_7_Days_From_Yesterday: 'Last 7 Days From Yesterday',
  Last_14_Days: 'Last 14 Days',
  Last_30_Days: 'Last 30 Days',
  This_Week: 'This Week',
  This_Month: 'This Month',
  Last_Month: 'Last Month',
  Custom: 'Custom',
} as const

export type WakaApiRange = typeof WakaApiRange
export type KeyOf<T> = keyof T
export type ValueOf<T> = T[KeyOf<T>]

export const WakaToShortcutApiRange = {
  [WakaApiRange.Today]: 0,
  [WakaApiRange.Yesterday]: 1,
  [WakaApiRange.Last_7_Days]: 6,
  [WakaApiRange.Last_7_Days_From_Yesterday]: 7,
  [WakaApiRange.Last_14_Days]: 13,
  [WakaApiRange.Last_30_Days]: 29,
  [WakaApiRange.This_Week]: 6,
  [WakaApiRange.This_Month]: 30,
  [WakaApiRange.Last_Month]: 61,
} as const

export type WakaToShortcutApiRange = typeof WakaToShortcutApiRange

export const BRANCH_NAME_DELIMITER = '_'
export const BRANCH_FULL_ID_DELIMITER = '/'
export const BRANCH_ONLY_ID_DELIMITER = '-'
export const MAIN_BRANCH = 'main'
export const NUMBER_OF_DECIMALS = 1
export const SHORTCUT_STORY_IDENTIFIER = 'cesar/sc-'

export const Url = {
  Home: '/',
  Account: '/account',
  Projects: '/projects',
  ProjectDetail: (name: string) => `/projects/${name}`,
  Iterations: '/iterations',
  IterationDetail: (id: number) => `/iterations/${id}`,
  Login: '/login',
} as const

type Url = typeof Url

export const TOP_LEVEL_NAV_URLS = [Url.Projects, Url.Login] as const
export const DROPDOWN_NAV_URLS = [Url.Home, Url.Projects, Url.Login]

export const Api = {
  WakaDurations: (date: string, itemType: string) =>
    `${ApiEndpoint.Durations}?date=${date}&slice_by=${itemType}`,
}

export const Step = {
  Next: 1,
  Prev: -1,
} as const

export type Step = (typeof Step)[keyof typeof Step]

export const hours = [
  '12a',
  '1a',
  '2a',
  '3a',
  '4a',
  '5a',
  '6a',
  '7a',
  '8a',
  '9a',
  '10a',
  '11a',
  '12p',
  '1p',
  '2p',
  '3p',
  '4p',
  '5p',
  '6p',
  '7p',
  '8p',
  '9p',
  '10p',
  '11p',
]

export const getPercent = (value: number) => `${(value * 100).toFixed(NUMBER_OF_DECIMALS)}%`

export const HOUR_GOAL = 5

export const ApiEndpoint = {
  Summaries: '/api/wakatime/current/summaries',
  Durations: '/api/wakatime/current/durations',
  Projects: '/api/wakatime/current/projects',
  Iterations: '/api/shortcut/iterations',
  SearchStories: '/api/shortcut/search/stories',
  IterationStories: (id: number | string) => `/api/shortcut/iterations/${id}/stories`,
  VercelProjects: '/api/vercel/projects',
  Aliases: `/api/vercel/aliases`,
  SupabaseProfiles: `/api/supabase/profiles`,
  SupabaseProjects: `/api/supabase/projects`,
  SupabaseSummaries: `/api/supabase/summaries`,
  SupabaseProjectSummaries: `/api/supabase/project-summaries`,
  SupabaseDurations: `/api/supabase/durations`,
  SupabaseDurationsByLanguage: `/api/supabase/durations-by-language`,
} as const

export const BaseUrl = {
  WakaTime: 'https://wakatime.com',
  Shortcut: 'https://api.app.shortcut.com',
  Vercel: 'https://api.vercel.com',
} as const

export const RestResource = {
  Summaries: '/api/v1/users/current/summaries',
  Projects: '/api/v1/users/current/projects',
  Durations: '/api/v1/users/current/durations',
  AllTime: '/api/v1/users/current/all_time_since_today',
  Stories: '/api/v3/search/stories',
  Iterations: '/api/v3/iterations',
  IterationStories: (id: string | number) => `/api/v3/iterations/${id}/stories`,
  Aliases: '/v4/aliases',
  VercelProjects: '/v9/projects',
} as const

export type DataContainer<T> = { data: T }
