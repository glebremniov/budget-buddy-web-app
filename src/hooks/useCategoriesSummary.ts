import { getCategoriesSummary } from '@budget-buddy-org/budget-buddy-contracts';
import { queryOptions, useQuery } from '@tanstack/react-query';
import { localeCurrency, toLocalYearMonth } from '@/lib/formatters';
import { useUserPreferencesStore } from '@/stores/user-preferences.store';

export interface CategoriesSummaryFilters {
  month?: string;
  currency?: string;
}

const KEYS = {
  all: ['categories-summary'] as const,
  summary: (month: string, currency: string) => ['categories-summary', month, currency] as const,
};

export const categoriesSummaryQueryOptions = (month: string, currency: string) =>
  queryOptions({
    queryKey: KEYS.summary(month, currency),
    queryFn: async () => {
      const { data, error } = await getCategoriesSummary({
        query: { month, currency },
      });
      if (error) throw error;
      return data;
    },
  });

export function useCategoriesSummary(filters: CategoriesSummaryFilters = {}) {
  const preferredCurrency = useUserPreferencesStore((s) => s.currency);
  const month = filters.month ?? toLocalYearMonth(new Date());
  const currency = filters.currency ?? preferredCurrency ?? localeCurrency();
  return useQuery(categoriesSummaryQueryOptions(month, currency));
}
