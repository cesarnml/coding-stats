import { render, screen } from '@testing-library/svelte'
import ProjectList from './ProjectList.svelte'
import { formatMinimalWork, formatTime } from '$lib/helpers/timeHelpers'
import { summaries } from 'src/mocks/testData'
import { Url } from '$lib/constants'
import { createProjectList } from './Stats/statHelpers'

describe('ProjectList', async () => {
  it('renders a link to the project detail page for each project', async () => {
    render(ProjectList, { summaries })

    const projects = createProjectList(summaries)

    projects.forEach((project) => {
      const link = screen.getByRole('link', { name: new RegExp(project.name) })

      expect(link).toHaveAttribute('href', Url.ProjectDetail(project.name))
      expect(link).toHaveTextContent(
        `${formatTime(project.value)} ${formatMinimalWork(project.value)}`.trim(),
      )
    })
  })
})
