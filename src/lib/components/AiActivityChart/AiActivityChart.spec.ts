import { render, screen } from '@testing-library/svelte'
import { tick } from 'svelte'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const { chart, init } = vi.hoisted(() => ({
  chart: {
    dispose: vi.fn(),
    resize: vi.fn(),
    setOption: vi.fn(),
  },
  init: vi.fn(),
}))

init.mockImplementation(() => chart)

vi.mock('echarts', () => ({ init }))

import AiActivityChart from './AiActivityChart.svelte'

const mockAiData = [
  { date: '2026-05-01', ai_additions: 100, human_additions: 40 },
  { date: '2026-05-02', ai_additions: 200, human_additions: 80 },
]

describe('AiActivityChart', () => {
  beforeEach(() => {
    init.mockClear()
    chart.dispose.mockClear()
    chart.resize.mockClear()
    chart.setOption.mockClear()
  })

  it('shows empty state message when data is empty', () => {
    render(AiActivityChart, { props: { data: [] } })
    expect(screen.getByText(/AI data accumulates daily/i)).toBeInTheDocument()
    expect(init).not.toHaveBeenCalled()
  })

  it('renders chart container when data is present', () => {
    render(AiActivityChart, { props: { data: mockAiData } })
    expect(screen.getByTestId('ai-activity-chart')).toBeInTheDocument()
    expect(init).toHaveBeenCalledTimes(1)
    expect(chart.setOption).toHaveBeenCalled()
  })

  it('disposes the chart and removes the resize listener on unmount', () => {
    const addEventListenerSpy = vi.spyOn(window, 'addEventListener')
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener')
    const view = render(AiActivityChart, { props: { data: mockAiData } })

    const resizeCall = addEventListenerSpy.mock.calls.find(([eventName]) => eventName === 'resize')
    expect(resizeCall).toBeDefined()

    view.unmount()

    expect(chart.dispose).toHaveBeenCalledTimes(1)
    expect(removeEventListenerSpy).toHaveBeenCalledWith('resize', resizeCall?.[1])

    addEventListenerSpy.mockRestore()
    removeEventListenerSpy.mockRestore()
  })

  it('initializes the chart when data becomes available after mount', async () => {
    const view = render(AiActivityChart, { props: { data: [] } })

    await view.rerender({ data: mockAiData })
    await tick()

    expect(init).toHaveBeenCalledTimes(1)
    expect(chart.setOption).toHaveBeenCalled()
  })
})
