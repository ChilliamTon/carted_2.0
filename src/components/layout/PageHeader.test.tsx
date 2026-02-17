import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { PageHeader } from './PageHeader'

describe('PageHeader', () => {
  it('renders title, description, breadcrumbs, and actions', () => {
    render(
      <MemoryRouter>
        <PageHeader
          eyebrow="Workspace"
          title="Notifications"
          description="Stay updated on tracked items."
          breadcrumbs={[
            { label: 'Dashboard', to: '/dashboard' },
            { label: 'Notifications' },
          ]}
          actions={<button type="button">Refresh</button>}
        />
      </MemoryRouter>,
    )

    expect(screen.getByText('Workspace')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Notifications' })).toBeInTheDocument()
    expect(screen.getByText('Stay updated on tracked items.')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Dashboard' })).toHaveAttribute('href', '/dashboard')
    expect(screen.getByText('Refresh')).toBeInTheDocument()
  })
})
