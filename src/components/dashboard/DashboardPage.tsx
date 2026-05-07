import { Link, useNavigate } from '@tanstack/react-router';
import { ArrowDownRight, ArrowUpRight, ChevronDown, PlusCircle, Wallet } from 'lucide-react';
import { useMemo, useState } from 'react';
import { DashboardSkeleton } from '@/components/dashboard/DashboardSkeleton';
import { SummaryCard, SummaryCardDescription } from '@/components/dashboard/SummaryCard';
import { PageHeader } from '@/components/layout/PageHeader';
import { TransactionAmount } from '@/components/transactions/TransactionAmount';
import { AnimatedNumber } from '@/components/ui/animated-number';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { ListItem } from '@/components/ui/list-item';
import { PageContainer } from '@/components/ui/page-container';
import { useCategoriesSummary } from '@/hooks/useCategoriesSummary';
import { useFormatters } from '@/hooks/useFormatters';
import { useMonthlySummary } from '@/hooks/useMonthlySummary';
import { useTransactions } from '@/hooks/useTransactions';
import { getCategoryColor } from '@/lib/categoryColor';
import { cn } from '@/lib/cn';
import { localeCurrency, todayIso, toLocalIsoDate, toLocalYearMonth } from '@/lib/formatters';
import { haptic } from '@/lib/haptics';
import { useThemeStore } from '@/stores/theme.store';
import { useUserPreferencesStore } from '@/stores/user-preferences.store';

const VISIBLE_COUNT = 5;
const MONTH_NAMES = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

export function DashboardPage() {
  const navigate = useNavigate();
  const [showAll, setShowAll] = useState(false);
  const glassEffect = useThemeStore((s) => s.glassEffect);
  const { fmtCurrency, fmtDate } = useFormatters();

  // Recomputed every render so the dashboard rolls over correctly when the app
  // stays open past midnight (especially across a month boundary).
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  const [selectedMonth, setSelectedMonth] = useState(currentMonth);

  const { firstDayOfPeriod, lastDayOfPeriod, periodMonth } = useMemo(
    () => ({
      firstDayOfPeriod: toLocalIsoDate(new Date(currentYear, selectedMonth, 1)),
      // For past months use the last day of that month; for the current month use today.
      lastDayOfPeriod:
        selectedMonth === currentMonth
          ? todayIso()
          : toLocalIsoDate(new Date(currentYear, selectedMonth + 1, 0)),
      periodMonth: toLocalYearMonth(new Date(currentYear, selectedMonth, 1)),
    }),
    [currentYear, currentMonth, selectedMonth],
  );

  const handleMonthSelect = (month: number) => {
    if (month !== selectedMonth) haptic('tap');
    setSelectedMonth(month);
    setShowAll(false);
  };

  const preferredCurrency = useUserPreferencesStore((s) => s.currency) ?? localeCurrency();

  const { data: summaryData, isLoading: summaryLoading } = useCategoriesSummary({
    month: periodMonth,
    currency: preferredCurrency,
  });

  const { data: monthlySummary, isLoading: monthlyLoading } = useMonthlySummary({
    month: periodMonth,
    currency: preferredCurrency,
  });

  const { data: recentData, isLoading: recentLoading } = useTransactions({
    start: firstDayOfPeriod,
    end: lastDayOfPeriod,
    sort: 'desc',
    size: 5,
  });

  const income = monthlySummary?.income ?? 0;
  const expense = monthlySummary?.expense ?? 0;
  const balance = monthlySummary?.balance ?? 0;
  const monthlyExcludedCount = monthlySummary?.excludedTransactionCount ?? 0;

  const { categoryRows, excludedCount } = useMemo(() => {
    const items = summaryData?.items ?? [];
    const rows = items
      .filter((row) => row.spent > 0 || (row.monthlyBudget ?? 0) > 0)
      .map((row) => ({
        categoryId: row.categoryId,
        name: row.categoryName,
        spent: row.spent,
        monthlyBudget: row.monthlyBudget ?? null,
      }))
      .sort((a, b) => b.spent - a.spent);
    const excluded = items.reduce((sum, row) => sum + row.excludedTransactionCount, 0);
    return { categoryRows: rows, excludedCount: excluded };
  }, [summaryData]);

  const currency = monthlySummary?.currency ?? summaryData?.currency ?? preferredCurrency;
  const recent = recentData?.items ?? [];

  if (summaryLoading || monthlyLoading || recentLoading) return <DashboardSkeleton />;

  const visibleRows = showAll ? categoryRows : categoryRows.slice(0, VISIBLE_COUNT);
  const hiddenCount = categoryRows.length - VISIBLE_COUNT;

  const periodLabel = `${MONTH_NAMES[selectedMonth]} ${currentYear}`;

  return (
    <PageContainer>
      <PageHeader title="Dashboard" subtitle={periodLabel} />

      {/* Month selector — Jan through current month, wraps on small screens */}
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: currentMonth + 1 }, (_, i) => i).map((month) => {
          const isActive = selectedMonth === month;
          return (
            <button
              key={month}
              type="button"
              onClick={() => handleMonthSelect(month)}
              className={cn(
                'shrink-0 rounded-pill px-3 py-1 text-sm font-medium transition outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.98] motion-reduce:transition-none cursor-pointer',
                isActive
                  ? cn(
                      'bg-primary text-primary-foreground shadow-sm',
                      glassEffect && 'bg-primary/80 backdrop-blur-sm',
                    )
                  : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground',
              )}
            >
              {MONTH_NAMES[month]}
            </button>
          );
        })}
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        <Card glass className="col-span-2 md:col-span-1">
          <CardHeader className="pb-2">
            <SummaryCardDescription>
              <Wallet className="size-4" />
              Balance
            </SummaryCardDescription>
          </CardHeader>
          <CardContent>
            <AnimatedNumber
              value={balance}
              format={(v) => fmtCurrency(Math.round(v), currency)}
              className={cn('text-xl font-bold', balance >= 0 ? 'text-income' : 'text-expense')}
            />
          </CardContent>
        </Card>

        <SummaryCard
          label="Income"
          amount={income}
          currency={currency}
          icon={<ArrowUpRight className="size-4 text-income" />}
          className="text-income"
          linkSearch={{ type: 'INCOME', start: firstDayOfPeriod, end: lastDayOfPeriod }}
        />
        <SummaryCard
          label="Expenses"
          amount={expense}
          currency={currency}
          icon={<ArrowDownRight className="size-4 text-expense" />}
          className="text-expense"
          linkSearch={{ type: 'EXPENSE', start: firstDayOfPeriod, end: lastDayOfPeriod }}
        />
      </div>

      {monthlyExcludedCount > 0 && (
        <p className="text-xs text-muted-foreground">
          {monthlyExcludedCount === 1
            ? '1 transaction in another currency not shown'
            : `${monthlyExcludedCount} transactions in other currencies not shown`}
        </p>
      )}

      {/* Expenses by category */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold" as="h2">
            Expenses by category
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {categoryRows.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">
              No expenses in {periodLabel}
            </p>
          ) : (
            <>
              <ul className="space-y-3">
                {visibleRows.map((row) => {
                  const color = getCategoryColor(row.name);
                  const hasBudget = row.monthlyBudget != null;
                  const budget = row.monthlyBudget ?? 0;
                  const pct =
                    budget > 0
                      ? Math.min(100, Math.round((row.spent / budget) * 100))
                      : row.spent > 0
                        ? 100
                        : 0;
                  const overBudget = hasBudget && row.spent > budget;
                  return (
                    <li key={row.categoryId}>
                      <Link
                        to="/transactions"
                        search={{
                          type: 'EXPENSE',
                          start: firstDayOfPeriod,
                          end: lastDayOfPeriod,
                          categoryId: row.categoryId,
                        }}
                        className="block -mx-1 rounded-md p-1 transition-colors hover:bg-muted/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
                      >
                        <div className="mb-1 flex items-center justify-between">
                          <div className="mr-2 flex min-w-0 items-center gap-2">
                            <span
                              className="h-2 w-2 shrink-0 rounded-pill"
                              style={{ backgroundColor: color }}
                            />
                            <span className="truncate text-sm font-medium">{row.name}</span>
                          </div>
                          <span
                            className={cn(
                              'shrink-0 text-sm tabular-nums',
                              overBudget ? 'text-expense font-medium' : 'text-muted-foreground',
                            )}
                          >
                            {hasBudget
                              ? `${fmtCurrency(row.spent, currency)} / ${fmtCurrency(row.monthlyBudget as number, currency)}`
                              : fmtCurrency(row.spent, currency)}
                          </span>
                        </div>
                        {hasBudget ? (
                          <div className="h-1.5 w-full overflow-hidden rounded-pill bg-muted">
                            <div
                              className="h-full rounded-pill"
                              style={{
                                width: `${pct}%`,
                                backgroundColor: overBudget ? 'var(--color-expense)' : color,
                              }}
                            />
                          </div>
                        ) : (
                          <p className="text-xs text-muted-foreground">No budget</p>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>

              {excludedCount > 0 && (
                <p className="text-xs text-muted-foreground">
                  {excludedCount === 1
                    ? '1 transaction in another currency not shown'
                    : `${excludedCount} transactions in other currencies not shown`}
                </p>
              )}

              {hiddenCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-muted-foreground"
                  onClick={() => setShowAll((v) => !v)}
                >
                  <ChevronDown
                    className={cn('mr-1 size-4 transition-transform', showAll && 'rotate-180')}
                  />
                  {showAll ? 'Show less' : `Show ${hiddenCount} more`}
                </Button>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Recent transactions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold" as="h2">
            Recent transactions
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {recent.length === 0 ? (
            <EmptyState
              icon={<PlusCircle className="size-4 text-muted-foreground" />}
              title="No transactions yet"
              description="Start tracking your budget by adding your first transaction."
              action={{
                label: 'Add transaction',
                onClick: () => navigate({ to: '/transactions' }),
              }}
            />
          ) : (
            <ul className="divide-y">
              {recent.map((t) => (
                <ListItem
                  key={t.id}
                  onClick={() =>
                    navigate({
                      to: '/transactions',
                      search: { start: firstDayOfPeriod, end: lastDayOfPeriod },
                    })
                  }
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{t.description ?? '—'}</p>
                    <p className="text-xs text-muted-foreground">{fmtDate(t.date)}</p>
                  </div>
                  <TransactionAmount amount={t.amount} currency={t.currency} type={t.type} />
                </ListItem>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </PageContainer>
  );
}
