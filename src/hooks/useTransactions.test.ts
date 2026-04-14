import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import React from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useCreateTransaction, useDeleteTransaction, useTransactions, useAllTransactions } from './useTransactions'
import {
  listTransactions,
  createTransaction,
  deleteTransaction,
} from '@budget-buddy-org/budget-buddy-contracts'

vi.mock('@budget-buddy-org/budget-buddy-contracts', () => ({
  listTransactions: vi.fn(),
  getTransaction: vi.fn(),
  createTransaction: vi.fn(),
  updateTransaction: vi.fn(),
  deleteTransaction: vi.fn(),
}))

const mockPage = {
  items: [
    {
      id: 'tx-1',
      description: 'Coffee',
      amount: 350,
      type: 'EXPENSE',
      currency: 'EUR',
      date: '2024-01-10',
      categoryId: 'cat-1',
      ownerId: 'user-1',
      createdAt: '2024-01-10T08:00:00Z',
      updatedAt: '2024-01-10T08:00:00Z',
    },
  ],
  meta: {
    total: 1,
    size: 20,
    page: 0,
  },
}

function makeWrapper() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: qc }, children)
}

describe('useTransactions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns fetched transactions', async () => {
    vi.mocked(listTransactions).mockResolvedValue({
      data: {
        items: [{ id: 'tx-1', date: '2024-01-10' }],
        meta: { total: 1, size: 20, page: 0 }
      }
    } as any)

    const { result } = renderHook(() => useTransactions(), { wrapper: makeWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.items).toHaveLength(1)
    expect(listTransactions).toHaveBeenCalledTimes(1)
  })

  it('passes filters to the API', async () => {
    vi.mocked(listTransactions).mockResolvedValue({ data: mockPage } as any)

    renderHook(
      () => useTransactions({ categoryId: 'cat-1', sort: 'asc', size: 10 }),
      { wrapper: makeWrapper() },
    )

    await waitFor(() => expect(listTransactions).toHaveBeenCalled())
    expect(listTransactions).toHaveBeenCalledWith(
      expect.objectContaining({ query: expect.objectContaining({ categoryId: 'cat-1', sort: 'asc', size: 10 }) }),
    )
  })

  it('performs client-side search when search filter is present', async () => {
    const items = [
      { id: '1', description: 'Apple' },
      { id: '2', description: 'Banana' },
      { id: '3', description: 'Apricot' },
    ]
    vi.mocked(listTransactions).mockResolvedValue({
      data: {
        items,
        meta: { total: 3, size: 20, page: 0 }
      }
    } as any)

    const { result } = renderHook(
      () => useTransactions({ search: 'ap' }),
      { wrapper: makeWrapper() },
    )

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    
    // Should find Apple and Apricot
    expect(result.current.data?.items).toHaveLength(2)
    expect(result.current.data?.items[0].description).toBe('Apple')
    expect(result.current.data?.items[1].description).toBe('Apricot')
    expect(result.current.data?.meta.total).toBe(2)
    
    // Should have called API with search: undefined and large size
    expect(listTransactions).toHaveBeenCalledWith(
      expect.objectContaining({ 
        query: expect.objectContaining({ 
          search: undefined,
          size: 1000 
        }) 
      }),
    )
  })
})

describe('useAllTransactions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('fetches multiple pages until total is reached', async () => {
    vi.mocked(listTransactions)
      .mockResolvedValueOnce({
        data: {
          items: [{ id: '1' }],
          meta: { total: 2, size: 1, page: 0 }
        }
      } as any)
      .mockResolvedValueOnce({
        data: {
          items: [{ id: '2' }],
          meta: { total: 2, size: 1, page: 1 }
        }
      } as any)

    const { result } = renderHook(() => useAllTransactions(), { wrapper: makeWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.items).toHaveLength(2)
    expect(listTransactions).toHaveBeenCalledTimes(2)
    expect(listTransactions).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ query: expect.objectContaining({ page: 0, size: 200 }) }),
    )
  })

  it('limits to 10 page fetches', async () => {
    vi.mocked(listTransactions).mockResolvedValue({
      data: {
        items: [{ id: '1' }],
        meta: { total: 100, size: 1, page: 0 }
      }
    } as any)

    const { result } = renderHook(() => useAllTransactions(), { wrapper: makeWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(listTransactions).toHaveBeenCalledTimes(10)
  })
})

describe('useCreateTransaction', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('calls createTransaction and invalidates queries on success', async () => {
    const created = { ...mockPage.items[0] }
    vi.mocked(createTransaction).mockResolvedValue({ data: created } as any)
    vi.mocked(listTransactions).mockResolvedValue({ data: mockPage } as any)

    const { result } = renderHook(() => useCreateTransaction(), { wrapper: makeWrapper() })

    result.current.mutate({
      description: 'Coffee',
      amount: 350,
      type: 'EXPENSE',
      currency: 'EUR',
      date: '2024-01-10',
      categoryId: 'cat-1',
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(createTransaction).toHaveBeenCalledOnce()
  })
})

describe('useDeleteTransaction', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('calls deleteTransaction and invalidates queries on success', async () => {
    vi.mocked(deleteTransaction).mockResolvedValue({ data: undefined } as any)
    vi.mocked(listTransactions).mockResolvedValue({ data: mockPage } as any)

    const { result } = renderHook(() => useDeleteTransaction(), { wrapper: makeWrapper() })

    result.current.mutate('tx-1')

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(deleteTransaction).toHaveBeenCalledWith({ path: { transactionId: 'tx-1' } })
  })
})
