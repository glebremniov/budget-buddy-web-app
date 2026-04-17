import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

interface ChartDataPoint {
  month: string;
  income: number;
  expense: number;
}

interface MonthlyChartProps {
  data: ChartDataPoint[];
  currency: string;
  incomeColor: string;
  expenseColor: string;
}

export function MonthlyChart({ data, currency, incomeColor, expenseColor }: MonthlyChartProps) {
  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={data}>
        <XAxis dataKey="month" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
        <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={40} />
        <Tooltip
          formatter={(v, name) => [
            typeof v === 'number'
              ? new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(v)
              : v,
            name,
          ]}
          contentStyle={{ fontSize: 12 }}
        />
        <Bar dataKey="income" name="Income" fill={incomeColor} radius={[4, 4, 0, 0]} />
        <Bar dataKey="expense" name="Expenses" fill={expenseColor} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
