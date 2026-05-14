import { render, screen } from '@testing-library/svelte'
import DailyTitleContent from './DailyTitleContent.svelte'
import { supabaseDuration } from '$src/mocks/testData'
import { DateFormat } from '$lib/helpers/timeHelpers'
import dayjs from 'dayjs'

describe('DailyTitleContent', () => {
  it('renders a title and date', () => {
    const props = {
      title: 'Test title',
      durations: supabaseDuration,
    }
    render(DailyTitleContent, props)

    const title = screen.getByText(props.title)
    const date = screen.getByText(dayjs(props.durations.date).format(DateFormat.Shortish))
    expect(title).toBeInTheDocument()
    expect(date).toBeInTheDocument()
  })
  it('renders a title, date and time', () => {
    const today = dayjs().format(DateFormat.Query)
    const props = {
      title: 'Test title',
      durations: { ...supabaseDuration, date: today },
      showCurrentTime: true,
    }
    render(DailyTitleContent, props)

    const title = screen.getByText(props.title)
    const date = screen.getByText(dayjs(props.durations.date).format(DateFormat.Shortish))
    const time = screen.getByText(dayjs().format(DateFormat.TwelveHour))

    expect(title).toBeInTheDocument()
    expect(date).toBeInTheDocument()
    expect(time).toBeInTheDocument()
  })
})
