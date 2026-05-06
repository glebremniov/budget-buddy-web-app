import type { Transaction } from '@budget-buddy-org/budget-buddy-contracts';
import { memo } from 'react';
import { TransactionAmount } from '@/components/transactions/TransactionAmount';

interface TransactionRowProps {
  transaction: Transaction;
  categoryName?: string;
  onEdit?: (id: string) => void;
}

export const TransactionRow = memo(function TransactionRow({
  transaction: t,
  categoryName,
  onEdit,
}: TransactionRowProps) {
  return (
    <li className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/30 cursor-pointer">
      <button
        type="button"
        aria-label={`Edit transaction: ${t.description ?? 'unnamed'}`}
        className="min-w-0 flex-1 cursor-pointer text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
        onClick={() => onEdit?.(t.id)}
      >
        <p className="truncate text-sm font-medium">{t.description ?? '—'}</p>
        <p className="text-xs text-muted-foreground">{categoryName || 'No Category'}</p>
      </button>
      <TransactionAmount amount={t.amount} currency={t.currency} type={t.type} />
    </li>
  );
});
