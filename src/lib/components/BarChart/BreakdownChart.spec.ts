import { render, screen } from '@testing-library/svelte'
import BreakdownChart from './BreakdownChart.svelte'
import { summaries } from '$src/mocks/testData'
import userEvent from '@testing-library/user-event'

describe('BreakdownChart', () => {
  const user = userEvent.setup()

  it('no filter ', async () => {
    const props = {
      summaries,
      title: 'Title',
    }
    render(BreakdownChart, props)
    expect(screen.getByRole('heading', { name: new RegExp(props.title, 'i') })).toHaveTextContent(
      props.title,
    )

    const filterIcon = screen.getByRole('img', { name: /filter on/i })
    expect(filterIcon).toBeVisible()
    await user.click(filterIcon)
    expect(screen.getByRole('img', { name: /filter off/i })).toBeVisible()
    expect(screen.getByRole('img', { name: /info/i })).toBeVisible()
  })

  it('yes filter', async () => {
    const props = {
      summaries,
      title: 'Title',
      isFiltered: false,
    }
    render(BreakdownChart, props)
    expect(screen.getByRole('heading', { name: new RegExp(props.title, 'i') })).toHaveTextContent(
      props.title,
    )

    const filterIcon = screen.getByRole('img', { name: /filter off/i })
    expect(filterIcon).toBeVisible()
    expect(screen.getByRole('img', { name: /info/i })).toBeVisible()
  })
})
