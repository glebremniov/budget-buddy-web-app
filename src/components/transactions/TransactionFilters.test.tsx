import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { TransactionFilters } from './TransactionFilters';

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
});
