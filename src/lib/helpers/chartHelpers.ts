import {
  BRANCH_NAME_DELIMITER,
  BRANCH_FULL_ID_DELIMITER,
  BRANCH_ONLY_ID_DELIMITER,
  MAIN_BRANCH,
} from '$lib/constants'
import type { SummariesResult } from '$src/types/wakatime'
import first from 'lodash/first'
import last from 'lodash/last'

export const LanguageColor = {
  Svelte: '#EB5027',
  JavaScript: '#FFCB6B',
  TypeScript: '#3075C0',
  HTML: '#EA6328',
  INI: '#B9B9B9',
  Other: '#FAFAFA',
  TSConfig: '#7D7DEB',
  Python: '#376D9D',
  SCSS: '#C76496',
  Markdown: '#000000',
  JSON: '#7D7D7D',
  Ruby: '#AA1401',
  CSS: '#2A65F1',
  Bash: '#44B050',
  YAML: '#F8CA3E',
  LESS: '#2C4E85',
  'Vue.js': '#3EB480',
  'Git Config': '#E94D31',
  Astro: '#583085',
  Text: '#F8F8F8',
  Docker: '#2596ED',
  GraphQL: '#DA32A4',
  Git: '#E94D31',
  SQL: '#D16F30',
} as const

export type KeyOfLanguageColor = keyof typeof LanguageColor

export const ChartColor = {
  Text: '#fafafa',
  Icon: '#fafafa',
  Default: '#5A6FC0',
  Marker: '#ff0000',
  Great: '#00ff00',
  Good: '#62BAF3',
  Fair: '#ffff00',
  Poor: '#ff0000',
  Purple: '#9581F7',
  Time: '#F97316',
} as const

export const SummaryItemType = {
  Categories: 'categories',
  Projects: 'projects',
  Languages: 'languages',
  Branches: 'branches',
  Entities: 'entities',
} as const

export type KeyOfSummaryItemType = keyof typeof SummaryItemType
export type ValueOfSummaryItemType = (typeof SummaryItemType)[keyof typeof SummaryItemType]

export const DurationItemType = {
  Category: 'category',
  Project: 'project',
  Language: 'language',
  Branch: 'branch',
  Entity: 'entity',
} as const

export type KeyOfDurationItemType = keyof typeof DurationItemType
export type ValueOfDurationItemType = (typeof DurationItemType)[keyof typeof DurationItemType]

export const getSummaryItems = (summaries: SummariesResult, itemType: ValueOfSummaryItemType) => {
  if (!summaries?.data) return []

  return summaries.data.flatMap((summary) => summary[itemType])
}

type Item = { name: string; total_seconds: number }

export const createItemNameToTimeDict = (items: Item[]) => {
  if (!items) return {}
  return items.reduce((acc, { name, total_seconds }) => {
    acc[name] = (acc[name] ?? 0) + total_seconds
    return acc
  }, {} as Record<string, number>)
}

export const convertDataDictToChartData = (dataDict: Record<string, number>) =>
  Object.entries(dataDict).map(([name, value]) => ({
    name,
    value,
  }))

export const NO_SHORT_BRANCH_NAME = 'N/A'
export const getBranchShortName = (name: string) =>
  // eslint-disable-next-line
  last(first(name.split(BRANCH_NAME_DELIMITER))?.split(BRANCH_FULL_ID_DELIMITER)) ||
  NO_SHORT_BRANCH_NAME

export const NO_ID = 'N/A'
export const getStoryIdFromShortName = (shortBranchName: string) =>
  last(shortBranchName.split(BRANCH_ONLY_ID_DELIMITER)) || NO_ID

export const getStoryBranches = (branches: string[]) =>
  branches.filter((branch) => branch !== MAIN_BRANCH)
