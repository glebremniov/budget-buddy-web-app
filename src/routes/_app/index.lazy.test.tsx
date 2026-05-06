import { useNavigate } from '@tanstack/react-router';
import { fireEvent, screen } from '@testing-library/react';
import type React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DashboardPage } from '@/components/dashboard/DashboardPage';
import { render } from '@/test/utils';

vi.mock('@tanstack/react-router', () => ({
  createLazyFileRoute: () => (options: { component: React.ComponentType }) => ({ options }),
  useNavigate: vi.fn(),
  Link: ({ children }: { children: React.ReactNode }) => <a href="/">{children}</a>,
}));

vi.mock('@/hooks/useTransactions', () => ({
  useAllTransactions: vi.fn(),
  useTransactions: vi.fn(),
}));

vi.mock('@/hooks/useCategoriesSummary', () => ({
  useCategoriesSummary: vi.fn(),
}));

import { useCategoriesSummary } from '@/hooks/useCategoriesSummary';
import { useAllTransactions, useTransactions } from '@/hooks/useTransactions';

const mockTransactions = [
  {
    id: '1',
    description: 'Income this month',
    amount: 10000,
    type: 'INCOME',
    currency: 'EUR',
    date: '2026-04-10',
    categoryId: '1',
  },
  {
    id: '2',
    description: 'Expense this month',
    amount: 5000,
    type: 'EXPENSE',
    currency: 'EUR',
    date: '2026-04-11',
    categoryId: '2',
  },
];

describe('DashboardPage', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-04-14'));
    vi.clearAllMocks();

    vi.mocked(useCategoriesSummary).mockReturnValue({
      data: {
        month: '2026-04',
        currency: 'EUR',
        items: [
          {
            categoryId: '2',
            categoryName: 'Transport',
            monthlyBudget: 10000,
            spent: 5000,
            transactionCount: 1,
            excludedTransactionCount: 0,
          },
        ],
      },
      isLoading: false,
    } as ReturnType<typeof useCategoriesSummary>);

    vi.mocked(useTransactions).mockReturnValue({
      data: { items: [], meta: { total: 0, size: 5, page: 0 } },
      isLoading: false,
    } as unknown as ReturnType<typeof useTransactions>);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('shows income, expense and balance totals for the month', async () => {
    vi.mocked(useAllTransactions).mockReturnValue({
      data: {
        items: mockTransactions,
      },
      isLoading: false,
    } as unknown as ReturnType<typeof useAllTransactions>);

    render(<DashboardPage />);

    // Items: 10000 income, 5000 expense. Balance = 50.00

    // Income card
    const incomeCard = screen.getByText('Income').closest('.rounded-lg');
    expect(incomeCard).toHaveTextContent(/100/);

    // Expense card
    const expenseCard = screen.getByText('Expenses').closest('.rounded-lg');
    expect(expenseCard).toHaveTextContent(/50/);

    // Balance card
    const balanceCard = screen.getByText('Balance').closest('.rounded-lg');
    expect(balanceCard).toHaveTextContent(/50/);
  });

  it('navigates to transaction list on click', async () => {
    const mockNavigate = vi.fn();
    vi.mocked(useNavigate).mockReturnValue(mockNavigate);
    vi.mocked(useAllTransactions).mockReturnValue({
      data: {
        items: mockTransactions,
      },
      isLoading: false,
    } as unknown as ReturnType<typeof useAllTransactions>);
    vi.mocked(useTransactions).mockReturnValue({
      data: { items: mockTransactions, meta: { total: 2, size: 5, page: 0 } },
      isLoading: false,
    } as unknown as ReturnType<typeof useTransactions>);

    render(<DashboardPage />);

    const transactionItem = screen.getByText('Income this month');
    fireEvent.click(transactionItem);

    expect(mockNavigate).toHaveBeenCalledWith(expect.objectContaining({ to: '/transactions' }));
  });

  it('renders summary rows with budget progress and the spent / budget label', async () => {
    vi.mocked(useAllTransactions).mockReturnValue({
      data: { items: [] },
      isLoading: false,
    } as unknown as ReturnType<typeof useAllTransactions>);

    render(<DashboardPage />);

    expect(screen.getByText('Transport')).toBeInTheDocument();
    // 5000 / 10000 minor units → "€50.00 / €100.00"
    expect(screen.getByText(/50\.00.*100\.00/)).toBeInTheDocument();
  });

  it('shows the excluded-transactions note when excludedTransactionCount > 0', async () => {
    vi.mocked(useCategoriesSummary).mockReturnValue({
      data: {
        month: '2026-04',
        currency: 'EUR',
        items: [
          {
            categoryId: '2',
            categoryName: 'Transport',
            monthlyBudget: null,
            spent: 5000,
            transactionCount: 1,
            excludedTransactionCount: 3,
          },
        ],
      },
      isLoading: false,
    } as ReturnType<typeof useCategoriesSummary>);
    vi.mocked(useAllTransactions).mockReturnValue({
      data: { items: [] },
      isLoading: false,
    } as unknown as ReturnType<typeof useAllTransactions>);

    render(<DashboardPage />);

    expect(screen.getByText(/3 transactions in other currencies not shown/i)).toBeInTheDocument();
  });
});
