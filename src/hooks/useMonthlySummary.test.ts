import { getTransactionsSummary } from '@budget-buddy-org/budget-buddy-contracts';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useUserPreferencesStore } from '@/stores/user-preferences.store';
import { useMonthlySummary } from './useMonthlySummary';

type GetTransactionsSummaryResult = Awaited<ReturnType<typeof getTransactionsSummary>>;

vi.mock('@budget-buddy-org/budget-buddy-contracts', () => ({
  getTransactionsSummary: vi.fn(),
}));

const mockSummary = {
  month: '2024-01',
  currency: 'EUR',
  income: 250000,
  expense: 132450,
  balance: 117550,
  incomeCount: 3,
  expenseCount: 7,
  excludedTransactionCount: 0,
};

function makeWrapper() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: qc }, children);
}

describe('useMonthlySummary', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useUserPreferencesStore.setState({ currency: null });
  });

  it('returns the fetched summary and forwards month + currency', async () => {
    vi.mocked(getTransactionsSummary).mockResolvedValue({
      data: mockSummary,
      error: undefined,
    } as unknown as GetTransactionsSummaryResult);

    const { result } = renderHook(() => useMonthlySummary({ month: '2024-01', currency: 'EUR' }), {
      wrapper: makeWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.balance).toBe(117550);
    expect(getTransactionsSummary).toHaveBeenCalledWith({
      query: { month: '2024-01', currency: 'EUR' },
    });
  });

  it('falls back to the user-preferences currency when none is provided', async () => {
    useUserPreferencesStore.setState({ currency: 'GBP' });
    vi.mocked(getTransactionsSummary).mockResolvedValue({
      data: { ...mockSummary, currency: 'GBP' },
      error: undefined,
    } as unknown as GetTransactionsSummaryResult);

    renderHook(() => useMonthlySummary({ month: '2024-02' }), { wrapper: makeWrapper() });

    await waitFor(() => expect(getTransactionsSummary).toHaveBeenCalled());
    expect(getTransactionsSummary).toHaveBeenCalledWith({
      query: { month: '2024-02', currency: 'GBP' },
    });
  });

  it('falls back to the locale currency when no preference is set', async () => {
    vi.mocked(getTransactionsSummary).mockResolvedValue({
      data: mockSummary,
      error: undefined,
    } as unknown as GetTransactionsSummaryResult);

    renderHook(() => useMonthlySummary({ month: '2024-03' }), { wrapper: makeWrapper() });

    await waitFor(() => expect(getTransactionsSummary).toHaveBeenCalled());
    const call = vi.mocked(getTransactionsSummary).mock.calls[0]?.[0];
    expect(call?.query.month).toBe('2024-03');
    expect(typeof call?.query.currency).toBe('string');
    expect(call?.query.currency).toMatch(/^[A-Z]{3}$/);
  });
});
