import { render, screen } from '@testing-library/svelte'
import StatPanelItem from './StatPanelItem.svelte'

describe('StatPanelItem', () => {
  it('renders an icon and title', async () => {
    const props = {
      title: 'Test Title',
      icon: 'icon',
      label: 'icon-label',
    }
    render(StatPanelItem, props)

    expect(screen.getByLabelText('icon-label')).toBeInTheDocument()
    expect(screen.getByText('Test Title')).toBeInTheDocument()
  })
})
