type WakaSnippet = {
  content: string
  name: string
}

type WakaBadgeSlim = {
  color: string
  created_at: string
  id: string
  left_text: string
  link: string
  project_id: string
  title: string
  url: string
  snippets: WakaSnippet[]
}

type WakaBadge = WakaBadgeSlim & {
  provider: string
  repository: string
}

type WakaRepository = {
  created_at: string
  default_branch: string
  description: string | null
  fork_count: number
  full_name: string
  homepage: string
  html_url: string
  id: string
  image_icon_url: string
  is_fork: boolean
  is_private: boolean
  last_synced_at: string | null
  modified_at: string
  name: string
  provider: string
  star_count: number
  url: string
  urlencoded_name: string
  wakatime_project_name: string
  watch_count: number
}

type WakaProject = {
  color: string
  created_at: string
  has_public_url: boolean
  human_readable_last_heartbeat_at: string
  id: string
  last_heartbeat_at: string
  name: string
  url: string
  urlencoded_name: string
  badge: WakaBadgeSlim
  repository: WakaRepository
}

export type WakaProjectResult = {
  data: WakaProject[]
  next_page: number
  page: number
  prev_page: number
  total: number
  total_pages: number
}

type CumulativeTotal = {
  decimal: string
  digital: string
  seconds: number
  text: string
}

type DailyAverage = {
  days_including_holidays: number
  days_minus_holidays: number
  holidays: number
  seconds: number
  seconds_including_other_language: number
  text: string
  text_including_other_language: string
}

export type WakaCategory = {
  decimal: string
  digital: string
  hours: number
  minutes: number
  name: string
  percent: number
  seconds: number
  text: string
  total_seconds: number
}

type WakaDependency = WakaCategory
type WakaEditor = WakaCategory
type WakaLanguage = WakaCategory
type WakaMachine = WakaCategory & { machine_name_id: string }
type WakaOperatingSystem = WakaCategory
type WakaProjectSlim = WakaCategory & { color: string | null }
type WakaBranch = WakaCategory
type WakaEntity = WakaCategory & { project_root_count: number; type: string }

type WakaRange = {
  date: string
  end: string
  start: string
  text: string
  timezone: string
}

export type WakaGrandTotal = {
  decimal: string
  digital: string
  hours: number
  minutes: number
  text: string
  total_seconds: number
  ai_additions: number
  ai_deletions: number
  human_additions: number
  human_deletions: number
  ai_input_tokens: number
  ai_output_tokens: number
  ai_prompt_length_avg: number
  ai_prompt_length_sum: number
  ai_prompt_events: number
}

type SummariesData = {
  categories: WakaCategory[]
  dependencies: WakaDependency[]
  editors: WakaEditor[]
  grand_total: WakaGrandTotal
  languages: WakaLanguage[]
  machines: WakaMachine[]
  operating_systems: WakaOperatingSystem[]
  projects: WakaProjectSlim[]
  range: WakaRange
  branches: WakaBranch[]
  entities: WakaEntity[]
}

export type SummariesResult = {
  cumulative_total: CumulativeTotal
  daily_average: DailyAverage
  data: SummariesData[]
  end: string
  start: string
  branches: string[]
  available_branches: string[]
  color: string | null
}

export type WakaDuration = {
  color: string | null
  duration: number
  project: string
  language: string
  category: string
  entity: string
  branch: string
  time: number
  ai_session: string | null
  ai_additions: number
  ai_deletions: number
  human_additions: number
  human_deletions: number
  ai_input_tokens: number
  ai_output_tokens: number
  ai_prompt_length_sum: number
  ai_prompt_events: number
}

export type DurationsResult = {
  branches: string[]
  data: WakaDuration[]
  end: string
  start: string
  timezone: string
}

export type WakaFullRange = {
  end: string
  end_date: string
  end_text: string
  start: string
  start_date: string
  start_text: string
  timezone: string
}

export type AllTimeSinceTodayData = {
  decimal: string
  digital: string
  is_up_to_date: boolean
  percent_calculated: number
  range: WakaFullRange
  text: string
  timeout: number
  total_seconds: number
}

export {}
