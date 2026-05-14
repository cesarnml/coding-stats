import { render, screen } from '@testing-library/svelte'
import { describe, expect, it } from 'vitest'
import EmptyState from './EmptyState.svelte'

describe('EmptyState', () => {
  it('renders the message string when show is true', () => {
    render(EmptyState, { message: 'No data for this range', show: true })
    expect(screen.getByText('No data for this range')).toBeInTheDocument()
  })

  it('renders nothing when show is false', () => {
    render(EmptyState, { message: 'No data for this range', show: false })
    expect(screen.queryByText('No data for this range')).not.toBeInTheDocument()
  })
})
