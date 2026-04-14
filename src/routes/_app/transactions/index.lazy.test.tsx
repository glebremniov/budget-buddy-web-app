import { render, screen, fireEvent } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { Route } from './index.lazy'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type React from 'react'

const mockNavigate = vi.fn()

vi.mock('@tanstack/react-router', () => ({
  createLazyFileRoute: () => (options: any) => ({ options }),
  useNavigate: () => mockNavigate,
  useSearch: () => vi.fn(),
}))

vi.mock('@/hooks/useTransactions', () => ({
  useTransactions: vi.fn(),
  useTransaction: vi.fn(),
}))

vi.mock('@/hooks/useCategories', () => ({
  useCategories: vi.fn(),
}))

vi.mock('@/components/transactions/TransactionForm', () => ({
  TransactionForm: ({ transaction, onSuccess }: any) => (
    <div data-testid="transaction-form">
      {transaction ? `Editing ${transaction.id}` : 'Adding'}
      <button onClick={onSuccess}>Success</button>
    </div>
  ),
}))

import { useTransactions, useTransaction } from '@/hooks/useTransactions'
import { useCategories } from '@/hooks/useCategories'

describe('TransactionsPage', () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })

  beforeEach(() => {
    vi.clearAllMocks()
    ;(useCategories as any).mockReturnValue({ data: { items: [] }, isLoading: false })
    ;(useTransactions as any).mockReturnValue({ data: { items: [], meta: { total: 0 } }, isLoading: false })
    ;(useTransaction as any).mockReturnValue({ data: null, isLoading: false })
  })

  it('opens edit dialog when clicking a transaction in the list', async () => {
    ;(useTransactions as any).mockReturnValue({ 
      data: { 
        items: [{ id: '123', description: 'Test Transaction', amount: 1000, date: '2024-01-01', type: 'EXPENSE', currency: 'EUR' }], 
        meta: { total: 1 } 
      }, 
      isLoading: false 
    })
    ;(useTransaction as any).mockReturnValue({ 
      data: { id: '123', description: 'Test Transaction', amount: 1000, date: '2024-01-01', type: 'EXPENSE', currency: 'EUR' }, 
      isLoading: false 
    })

    const TransactionsPage = (Route as any).options.component as React.ElementType

    render(
      <QueryClientProvider client={queryClient}>
        <TransactionsPage />
      </QueryClientProvider>
    )

    const transactionItem = screen.getByText('Test Transaction')
    fireEvent.click(transactionItem)

    expect(screen.getByText('Edit Transaction')).toBeInTheDocument()
    expect(screen.getByTestId('transaction-form')).toHaveTextContent('Editing 123')
  })

  it('opens add dialog when clicking Add button', async () => {
    const TransactionsPage = (Route as any).options.component as React.ElementType

    render(
      <QueryClientProvider client={queryClient}>
        <TransactionsPage />
      </QueryClientProvider>
    )

    const addButtons = screen.getAllByRole('button', { name: /add/i })
    fireEvent.click(addButtons[0])

    expect(screen.getByText('Add Transaction')).toBeInTheDocument()
    expect(screen.getByTestId('transaction-form')).toHaveTextContent('Adding')
  })
})
