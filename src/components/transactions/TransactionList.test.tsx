import { render, screen, fireEvent } from '@testing-library/react'
import { TransactionList } from './TransactionList'
import { describe, expect, it, vi } from 'vitest'

vi.mock('@/hooks/useTransactions', () => ({
  useDeleteTransaction: () => ({ mutate: vi.fn(), isPending: false }),
}))

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: vi.fn() }),
}))

describe('TransactionList empty states', () => {
  it('renders "No transactions yet." when no transactions and not filtering', () => {
    render(<TransactionList transactions={[]} categories={[]} isLoading={false} />)
    expect(screen.getByText(/no transactions yet/i)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /reset filters/i })).not.toBeInTheDocument()
  })

  it('renders "No transactions match your filters." and reset button when filtering', () => {
    const onResetFilters = vi.fn()
    render(
      <TransactionList 
        transactions={[]} 
        categories={[]} 
        isLoading={false} 
        isFiltering={true} 
        onResetFilters={onResetFilters}
      />
    )
    
    expect(screen.getByText(/no transactions match your filters/i)).toBeInTheDocument()
    const resetButton = screen.getByRole('button', { name: /reset filters/i })
    expect(resetButton).toBeInTheDocument()
    
    fireEvent.click(resetButton)
    expect(onResetFilters).toHaveBeenCalled()
  })
})
