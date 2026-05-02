import type { SummariesResult } from '$src/types/wakatime'
import {
  NO_ID,
  NO_SHORT_BRANCH_NAME,
  SummaryItemType,
  createItemNameToTimeDict,
  getBranchShortName,
  getStoryBranches,
  getStoryIdFromShortName,
  getSummaryItems,
} from './chartHelpers'

describe('getSummaryItems', () => {
  const summaries = {
    data: [
      {
        projects: [
          { name: 'project1', total_seconds: 10 },
          { name: 'project2', total_seconds: 10 },
        ],
        languages: [
          { name: 'Svelte', total_seconds: 3600 },
          { name: 'TypeScript', total_seconds: 120 },
        ],
      },
      {
        projects: [
          { name: 'project1', total_seconds: 30 },
          { name: 'project3', total_seconds: 100 },
        ],
        languages: [{ name: 'Svelte', total_seconds: 1800 }],
      },
    ],
  } as unknown as SummariesResult

  it('should return all projects', () => {
    expect(getSummaryItems(summaries, SummaryItemType.Projects)).toStrictEqual([
      { name: 'project1', total_seconds: 10 },
      { name: 'project2', total_seconds: 10 },
      { name: 'project1', total_seconds: 30 },
      { name: 'project3', total_seconds: 100 },
    ])
  })

  it('should return all languages', () => {
    expect(getSummaryItems(summaries, SummaryItemType.Languages)).toStrictEqual([
      { name: 'Svelte', total_seconds: 3600 },
      { name: 'TypeScript', total_seconds: 120 },
      { name: 'Svelte', total_seconds: 1800 },
    ])
  })
})

describe('createItemNameToTimeDict', () => {
  it('should return an project name to total seconds dictionary', () => {
    expect(
      createItemNameToTimeDict([
        { name: 'project1', total_seconds: 10 },
        { name: 'project2', total_seconds: 10 },
        { name: 'project1', total_seconds: 30 },
        { name: 'project3', total_seconds: 100 },
      ]),
    ).toStrictEqual({
      project1: 40,
      project2: 10,
      project3: 100,
    })
  })

  it('should return an language name to total seconds dictionary', () => {
    expect(
      createItemNameToTimeDict([
        { name: 'Svelte', total_seconds: 3600 },
        { name: 'TypeScript', total_seconds: 120 },
        { name: 'Svelte', total_seconds: 1800 },
      ]),
    ).toStrictEqual({
      Svelte: 5400,
      TypeScript: 120,
    })
  })
})

describe('getBranchShortName', () => {
  it('should return the short name of the branch or default message', () => {
    expect(getBranchShortName('cesar/sc-221_get-coverage-up-to-30')).toBe('sc-221')
    expect(getBranchShortName('')).toBe(NO_SHORT_BRANCH_NAME)
  })
})

describe('getStoryIdFromShortName', () => {
  it('should return the story id for the branch', () => {
    expect(getStoryIdFromShortName('sc-221')).toBe('221')
    expect(getStoryIdFromShortName('')).toBe(NO_ID)
  })
})

describe('getStoryBranches', () => {
  it('should return all story branches except for main', () => {
    const branches = [
      'cesar/sc-221_get-coverage-up-to-30',
      'cesar/sc-222_get-coverage-up-to-40',
      'main',
    ]
    expect(getStoryBranches(branches)).toStrictEqual([
      'cesar/sc-221_get-coverage-up-to-30',
      'cesar/sc-222_get-coverage-up-to-40',
    ])
  })
})
