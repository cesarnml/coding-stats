import {
  SummaryItemType,
  createItemNameToTimeDict,
  getSummaryItems,
} from '$lib/helpers/chartHelpers'
import type { SummariesResult } from '$src/types/wakatime'
import isEmpty from 'lodash/isEmpty'
import orderBy from 'lodash/orderBy'

export const DEFAULT_EMPTY_MESSAGE = 'N/A'

export const createProjectList = (summaries: SummariesResult) => {
  const projects = getSummaryItems(summaries, SummaryItemType.Projects)

  const projectToTimeDict = createItemNameToTimeDict(projects)

  return orderBy(
    Object.entries(projectToTimeDict)
      .filter(([, value]) => value)
      .map(([name, value]) => ({ name, value })),
    'value',
    'desc',
  )
}

export const getTopLanguage = (summaries: SummariesResult) => {
  if (!summaries.data) return DEFAULT_EMPTY_MESSAGE

  const languages = summaries.data.flatMap((summary) => summary.languages)

  if (isEmpty(languages)) return DEFAULT_EMPTY_MESSAGE

  const languageToTimeDict = languages.reduce((acc, { name, total_seconds }) => {
    acc[name] = (acc[name] ?? 0) + total_seconds
    return acc
  }, {} as Record<string, number>)

  return Object.keys(languageToTimeDict).reduce((a, b) =>
    languageToTimeDict[a] > languageToTimeDict[b] ? a : b,
  )
}
