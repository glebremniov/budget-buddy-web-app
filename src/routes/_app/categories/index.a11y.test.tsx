import { render } from '@testing-library/react'
import 'vitest-axe/extend-expect'
import { axe } from 'vitest-axe'
import { describe, expect, it, vi } from 'vitest'
import { Route } from './index.lazy'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type React from 'react'

vi.mock('@tanstack/react-router', () => ({
  createLazyFileRoute: () => (options: any) => ({ options }),
}))

vi.mock('@/hooks/useCategories', () => ({
  useCategories: () => ({
    data: {
      items: [
        { id: '1', name: 'Food' },
        { id: '2', name: 'Transport' },
      ],
    },
    isLoading: false,
  }),
  useCreateCategory: () => ({ mutate: vi.fn(), isPending: false }),
  useDeleteCategory: () => ({ mutate: vi.fn(), isPending: false }),
  useUpdateCategory: () => ({ mutate: vi.fn(), isPending: false }),
}))

describe('CategoriesPage a11y', () => {
  it('should have no accessibility violations', async () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    })
    
    const CategoriesPage = (Route as any).options.component as React.ElementType
    
    const { container } = render(
      <QueryClientProvider client={queryClient}>
        <CategoriesPage />
      </QueryClientProvider>
    )
    
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
