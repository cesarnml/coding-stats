import { render, screen } from '@testing-library/svelte'
import DateRangeSelect from './DateRangeSelect.svelte'
import { DefaultWakaApiRange, WakaApiRange } from '$lib/constants'
import userEvent from '@testing-library/user-event'

describe('DateRangeSelect', () => {
  const user = userEvent.setup()
  it('renders', async () => {
    render(DateRangeSelect)
    const select = screen.getByRole('combobox')
    // Select element has the correct default value
    expect(select).toHaveValue(DefaultWakaApiRange)

    // User can change the select value
    await user.selectOptions(select, WakaApiRange.Last_30_Days)
    expect(select).toHaveValue(WakaApiRange.Last_30_Days)
  })
})
