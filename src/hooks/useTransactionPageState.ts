import { useCallback, useState } from 'react';

export interface TransactionPageFilters {
  categoryId: string;
  start: string;
  end: string;
  sort: 'asc' | 'desc';
}

const DEFAULT_FILTERS: TransactionPageFilters = {
  categoryId: '',
  start: '',
  end: '',
  sort: 'desc',
};

export function useTransactionPageState() {
  const [showForm, setShowForm] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filters, setFilters] = useState<TransactionPageFilters>(DEFAULT_FILTERS);
  const [page, setPage] = useState(0);

  const closeForm = useCallback(() => {
    setShowForm(false);
    setEditingId(null);
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
    setPage(0);
  }, []);

  const handleFilterChange = useCallback((newFilters: TransactionPageFilters) => {
    setFilters(newFilters);
    setPage(0);
  }, []);

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const isFiltered = !!(filters.categoryId || filters.start || filters.end);
  const hasActiveFilters = isFiltered || filters.sort !== 'desc';

  return {
    showForm,
    setShowForm,
    showFilters,
    setShowFilters,
    editingId,
    setEditingId,
    filters,
    page,
    isFiltered,
    hasActiveFilters,
    closeForm,
    resetFilters,
    handleFilterChange,
    handlePageChange,
  };
}
