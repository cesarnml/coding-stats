import { render, screen } from '@testing-library/svelte'
import { createRawSnippet } from 'svelte'
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

  it('renders the children snippet inside .stat-value', async () => {
    const children = createRawSnippet(() => ({
      render: () => `<span>42 hrs</span>`,
    }))

    const { container } = render(StatPanelItem, {
      title: 'Test Title',
      icon: 'icon',
      label: 'icon-label',
      children,
    })

    const statValue = container.querySelector('.stat-value')
    expect(statValue).not.toBeNull()
    expect(statValue).toHaveTextContent('42 hrs')
  })
})
