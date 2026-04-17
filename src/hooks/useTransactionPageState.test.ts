import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { type TransactionPageFilters, useTransactionPageState } from './useTransactionPageState';

const DEFAULT_FILTERS: TransactionPageFilters = {
  categoryId: '',
  start: '',
  end: '',
  sort: 'desc',
};

beforeEach(() => {
  vi.stubGlobal('scrollTo', vi.fn());
});

describe('useTransactionPageState — initial state', () => {
  it('returns correct defaults', () => {
    const { result } = renderHook(() => useTransactionPageState());

    expect(result.current.showForm).toBe(false);
    expect(result.current.showFilters).toBe(false);
    expect(result.current.editingId).toBeNull();
    expect(result.current.page).toBe(0);
    expect(result.current.filters).toEqual(DEFAULT_FILTERS);
    expect(result.current.isFiltered).toBe(false);
    expect(result.current.hasActiveFilters).toBe(false);
  });
});

describe('useTransactionPageState — direct setters', () => {
  it('setShowForm toggles showForm', () => {
    const { result } = renderHook(() => useTransactionPageState());

    act(() => result.current.setShowForm(true));
    expect(result.current.showForm).toBe(true);

    act(() => result.current.setShowForm(false));
    expect(result.current.showForm).toBe(false);
  });

  it('setShowFilters toggles showFilters', () => {
    const { result } = renderHook(() => useTransactionPageState());

    act(() => result.current.setShowFilters(true));
    expect(result.current.showFilters).toBe(true);
  });

  it('setEditingId sets the editing transaction id', () => {
    const { result } = renderHook(() => useTransactionPageState());

    act(() => result.current.setEditingId('tx-123'));
    expect(result.current.editingId).toBe('tx-123');
  });
});

describe('useTransactionPageState — closeForm', () => {
  it('resets showForm to false', () => {
    const { result } = renderHook(() => useTransactionPageState());

    act(() => result.current.setShowForm(true));
    act(() => result.current.closeForm());

    expect(result.current.showForm).toBe(false);
  });

  it('resets editingId to null', () => {
    const { result } = renderHook(() => useTransactionPageState());

    act(() => result.current.setEditingId('tx-abc'));
    act(() => result.current.closeForm());

    expect(result.current.editingId).toBeNull();
  });

  it('resets both showForm and editingId together', () => {
    const { result } = renderHook(() => useTransactionPageState());

    act(() => {
      result.current.setShowForm(true);
      result.current.setEditingId('tx-abc');
    });
    act(() => result.current.closeForm());

    expect(result.current.showForm).toBe(false);
    expect(result.current.editingId).toBeNull();
  });
});

describe('useTransactionPageState — handleFilterChange', () => {
  it('updates filters to the new value', () => {
    const { result } = renderHook(() => useTransactionPageState());
    const newFilters: TransactionPageFilters = {
      categoryId: 'cat-1',
      start: '2024-01-01',
      end: '2024-01-31',
      sort: 'asc',
    };

    act(() => result.current.handleFilterChange(newFilters));

    expect(result.current.filters).toEqual(newFilters);
  });

  it('resets page to 0 when filters change', () => {
    const { result } = renderHook(() => useTransactionPageState());

    // advance to page 2 first
    act(() => result.current.handlePageChange(2));
    expect(result.current.page).toBe(2);

    act(() => result.current.handleFilterChange({ ...DEFAULT_FILTERS, categoryId: 'cat-1' }));

    expect(result.current.page).toBe(0);
  });
});

describe('useTransactionPageState — resetFilters', () => {
  it('restores all filters to defaults', () => {
    const { result } = renderHook(() => useTransactionPageState());

    act(() =>
      result.current.handleFilterChange({
        categoryId: 'cat-1',
        start: '2024-01-01',
        end: '2024-12-31',
        sort: 'asc',
      }),
    );
    act(() => result.current.resetFilters());

    expect(result.current.filters).toEqual(DEFAULT_FILTERS);
  });

  it('resets page to 0', () => {
    const { result } = renderHook(() => useTransactionPageState());

    act(() => result.current.handlePageChange(3));
    act(() => result.current.resetFilters());

    expect(result.current.page).toBe(0);
  });
});

describe('useTransactionPageState — handlePageChange', () => {
  it('updates page to the requested value', () => {
    const { result } = renderHook(() => useTransactionPageState());

    act(() => result.current.handlePageChange(4));

    expect(result.current.page).toBe(4);
  });

  it('calls window.scrollTo with smooth scroll to top', () => {
    const { result } = renderHook(() => useTransactionPageState());

    act(() => result.current.handlePageChange(1));

    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
  });

  it('calls window.scrollTo on every page change', () => {
    const { result } = renderHook(() => useTransactionPageState());

    act(() => result.current.handlePageChange(1));
    act(() => result.current.handlePageChange(2));

    expect(window.scrollTo).toHaveBeenCalledTimes(2);
  });
});

describe('useTransactionPageState — isFiltered', () => {
  it('is false with default filters', () => {
    const { result } = renderHook(() => useTransactionPageState());
    expect(result.current.isFiltered).toBe(false);
  });

  it('is true when categoryId is set', () => {
    const { result } = renderHook(() => useTransactionPageState());
    act(() => result.current.handleFilterChange({ ...DEFAULT_FILTERS, categoryId: 'cat-1' }));
    expect(result.current.isFiltered).toBe(true);
  });

  it('is true when start date is set', () => {
    const { result } = renderHook(() => useTransactionPageState());
    act(() => result.current.handleFilterChange({ ...DEFAULT_FILTERS, start: '2024-01-01' }));
    expect(result.current.isFiltered).toBe(true);
  });

  it('is true when end date is set', () => {
    const { result } = renderHook(() => useTransactionPageState());
    act(() => result.current.handleFilterChange({ ...DEFAULT_FILTERS, end: '2024-12-31' }));
    expect(result.current.isFiltered).toBe(true);
  });

  it('is false after resetFilters clears active filters', () => {
    const { result } = renderHook(() => useTransactionPageState());
    act(() => result.current.handleFilterChange({ ...DEFAULT_FILTERS, categoryId: 'cat-1' }));
    act(() => result.current.resetFilters());
    expect(result.current.isFiltered).toBe(false);
  });
});

describe('useTransactionPageState — hasActiveFilters', () => {
  it('is false with default filters', () => {
    const { result } = renderHook(() => useTransactionPageState());
    expect(result.current.hasActiveFilters).toBe(false);
  });

  it('is true when sort is asc (non-default)', () => {
    const { result } = renderHook(() => useTransactionPageState());
    act(() => result.current.handleFilterChange({ ...DEFAULT_FILTERS, sort: 'asc' }));
    expect(result.current.hasActiveFilters).toBe(true);
  });

  it('is true when isFiltered is true (e.g. categoryId set)', () => {
    const { result } = renderHook(() => useTransactionPageState());
    act(() => result.current.handleFilterChange({ ...DEFAULT_FILTERS, categoryId: 'cat-1' }));
    expect(result.current.hasActiveFilters).toBe(true);
  });

  it('is false after resetFilters even when sort was changed', () => {
    const { result } = renderHook(() => useTransactionPageState());
    act(() => result.current.handleFilterChange({ ...DEFAULT_FILTERS, sort: 'asc' }));
    act(() => result.current.resetFilters());
    expect(result.current.hasActiveFilters).toBe(false);
  });
});
