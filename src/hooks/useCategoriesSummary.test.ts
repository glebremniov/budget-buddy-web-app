import { getCategoriesSummary } from '@budget-buddy-org/budget-buddy-contracts';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useUserPreferencesStore } from '@/stores/user-preferences.store';
import { useCategoriesSummary } from './useCategoriesSummary';

type GetCategoriesSummaryResult = Awaited<ReturnType<typeof getCategoriesSummary>>;

vi.mock('@budget-buddy-org/budget-buddy-contracts', () => ({
  getCategoriesSummary: vi.fn(),
}));

const mockSummary = {
  month: '2024-01',
  currency: 'EUR',
  items: [
    {
      categoryId: 'cat-1',
      categoryName: 'Food',
      monthlyBudget: 50000,
      spent: 12345,
      transactionCount: 4,
      excludedTransactionCount: 0,
    },
    {
      categoryId: 'cat-2',
      categoryName: 'Transport',
      monthlyBudget: null,
      spent: 0,
      transactionCount: 0,
      excludedTransactionCount: 0,
    },
  ],
};

function makeWrapper() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: qc }, children);
}

describe('useCategoriesSummary', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useUserPreferencesStore.setState({ currency: null });
  });

  it('returns the fetched summary and forwards month + currency', async () => {
    vi.mocked(getCategoriesSummary).mockResolvedValue({
      data: mockSummary,
      error: undefined,
    } as unknown as GetCategoriesSummaryResult);

    const { result } = renderHook(
      () => useCategoriesSummary({ month: '2024-01', currency: 'EUR' }),
      { wrapper: makeWrapper() },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.items).toHaveLength(2);
    expect(getCategoriesSummary).toHaveBeenCalledWith({
      query: { month: '2024-01', currency: 'EUR' },
    });
  });

  it('falls back to the user-preferences currency when none is provided', async () => {
    useUserPreferencesStore.setState({ currency: 'GBP' });
    vi.mocked(getCategoriesSummary).mockResolvedValue({
      data: { ...mockSummary, currency: 'GBP' },
      error: undefined,
    } as unknown as GetCategoriesSummaryResult);

    renderHook(() => useCategoriesSummary({ month: '2024-02' }), { wrapper: makeWrapper() });

    await waitFor(() => expect(getCategoriesSummary).toHaveBeenCalled());
    expect(getCategoriesSummary).toHaveBeenCalledWith({
      query: { month: '2024-02', currency: 'GBP' },
    });
  });

  it('falls back to the locale currency when no preference is set', async () => {
    vi.mocked(getCategoriesSummary).mockResolvedValue({
      data: mockSummary,
      error: undefined,
    } as unknown as GetCategoriesSummaryResult);

    renderHook(() => useCategoriesSummary({ month: '2024-03' }), { wrapper: makeWrapper() });

    await waitFor(() => expect(getCategoriesSummary).toHaveBeenCalled());
    const call = vi.mocked(getCategoriesSummary).mock.calls[0]?.[0];
    expect(call?.query.month).toBe('2024-03');
    expect(typeof call?.query.currency).toBe('string');
    expect(call?.query.currency).toMatch(/^[A-Z]{3}$/);
  });
});
