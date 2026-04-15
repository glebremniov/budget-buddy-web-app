import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { useIsMobile } from '@/hooks/useIsMobile';
import { TransactionFilters } from './TransactionFilters';

vi.mock('@/hooks/useIsMobile', () => ({
  useIsMobile: vi.fn(() => false),
}));

vi.mock('@/components/ui/input', () => ({
  Input: ({
    id,
    value,
    onChange,
    placeholder,
    autoFocus,
  }: {
    id?: string;
    value: string;
    onChange: React.ChangeEventHandler<HTMLInputElement>;
    placeholder?: string;
    autoFocus?: boolean;
  }) =>
    React.createElement('input', { id, value, onChange, placeholder, 'data-autofocus': autoFocus }),
}));

vi.mock('@/components/ui/date-picker', () => ({
  DatePicker: ({
    id,
    value,
    onChange,
  }: {
    id?: string;
    value: string;
    onChange: React.ChangeEventHandler<HTMLInputElement>;
  }) => React.createElement('input', { id, type: 'date', value, onChange }),
}));

vi.mock('@/components/ui/select', () => ({
  Select: ({
    id,
    children,
    value,
    onChange,
  }: {
    id?: string;
    children: React.ReactNode;
    value: string;
    onChange: React.ChangeEventHandler<HTMLSelectElement>;
  }) => React.createElement('select', { id, value, onChange }, children),
}));

describe('TransactionFilters', () => {
  const categories = [
    { id: '1', name: 'Food' },
    { id: '2', name: 'Transport' },
  ];
  const filters = {
    categoryId: '',
    start: '',
    end: '',
    sort: 'desc' as const,
    search: '',
  };
  const onFilterChange = vi.fn();
  const onReset = vi.fn();
  const onClose = vi.fn();

  it('renders correctly', () => {
    render(
      <TransactionFilters
        categories={categories}
        filters={filters}
        onFilterChange={onFilterChange}
        onReset={onReset}
        onClose={onClose}
      />,
    );

    expect(screen.getByLabelText(/search/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/category/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/from/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/to/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/sort/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /reset/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /done/i })).toBeInTheDocument();
  });

  it('calls onReset when reset button is clicked', () => {
    const activeFilters = { ...filters, search: 'test' };
    render(
      <TransactionFilters
        categories={categories}
        filters={activeFilters}
        onFilterChange={onFilterChange}
        onReset={onReset}
        onClose={onClose}
      />,
    );

    const resetButton = screen.getByRole('button', { name: /reset/i });
    fireEvent.click(resetButton);
    expect(onReset).toHaveBeenCalled();
  });

  it('calls onClose when done button is clicked', () => {
    render(
      <TransactionFilters
        categories={categories}
        filters={filters}
        onFilterChange={onFilterChange}
        onReset={onReset}
        onClose={onClose}
      />,
    );

    const doneButton = screen.getByRole('button', { name: /done/i });
    fireEvent.click(doneButton);
    expect(onClose).toHaveBeenCalled();
  });

  it('applies autoFocus on desktop', () => {
    vi.mocked(useIsMobile).mockReturnValue(false);
    render(
      <TransactionFilters
        categories={categories}
        filters={filters}
        onFilterChange={onFilterChange}
        onReset={onReset}
        onClose={onClose}
      />,
    );
    expect(screen.getByPlaceholderText(/Search transactions/i)).toHaveAttribute(
      'data-autofocus',
      'true',
    );
  });

  it('applies autoFocus on mobile', () => {
    vi.mocked(useIsMobile).mockReturnValue(true);
    render(
      <TransactionFilters
        categories={categories}
        filters={filters}
        onFilterChange={onFilterChange}
        onReset={onReset}
        onClose={onClose}
      />,
    );
    expect(screen.getByPlaceholderText(/Search transactions/i)).toHaveAttribute(
      'data-autofocus',
      'true',
    );
  });
});
