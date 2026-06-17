import { render, screen } from '@testing-library/svelte'
import { vi } from 'vitest'
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

  it('invokes the onwakarange callback when a non-custom range is selected', async () => {
    const onwakarange = vi.fn()
    render(DateRangeSelect, { onwakarange })
    const select = screen.getByRole('combobox')

    await user.selectOptions(select, WakaApiRange.Last_7_Days)

    expect(onwakarange).toHaveBeenCalledTimes(1)
  })

  it('does not invoke onwakarange when the Custom range is selected', async () => {
    const onwakarange = vi.fn()
    render(DateRangeSelect, { onwakarange })
    const select = screen.getByRole('combobox')

    await user.selectOptions(select, WakaApiRange.Custom)

    // Custom selection waits for both date inputs before firing the callback.
    expect(onwakarange).not.toHaveBeenCalled()
  })
})
