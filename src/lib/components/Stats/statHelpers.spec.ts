import { summaries } from '$src/mocks/testData'
import type { SummariesResult } from '$src/types/wakatime'
import { DEFAULT_EMPTY_MESSAGE, createProjectList, getTopLanguage } from './statHelpers'

describe('createProjectList', () => {
  it('returns an empty array when processing empty data', async () => {
    const emptySummaries = {
      data: [
        {
          projects: [],
        },
      ],
    } as unknown as SummariesResult

    const result = createProjectList(emptySummaries)
    expect(result).toEqual([])
  })
  it('returns project list', async () => {
    const expected = [
      { name: 'waka-shortcut-time-stats', value: 329726.958635 },
      { name: 'portfolio-sveltekit', value: 13384.676159999999 },
      { name: 'Svelte', value: 1107.4713120000001 },
      { name: '.nvm', value: 676.096974 },
    ]
    const result = createProjectList(summaries)
    expect(result).toEqual(expected)
  })
})

describe('getTopLanguage', () => {
  it('returns a default message when processing empty data', async () => {
    const emptySummaries = {
      data: [
        {
          languages: [],
        },
      ],
    } as unknown as SummariesResult

    const result = getTopLanguage(emptySummaries)
    expect(result).toEqual(DEFAULT_EMPTY_MESSAGE)
  })
  it('returns the top language', async () => {
    const expected = 'Svelte'

    const result = getTopLanguage(summaries)
    expect(result).toEqual(expected)
  })
})
