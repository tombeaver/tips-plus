import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { DollarSign } from 'lucide-react';

interface IncomeExpenseChartProps {
  monthlyIncome: number;
  monthlyExpenses: number;
  monthlySavings: number;
  projectedIncome: number;
}

export const IncomeExpenseChart: React.FC<IncomeExpenseChartProps> = ({
  monthlyIncome,
  monthlyExpenses,
  monthlySavings,
  projectedIncome,
}) => {
  const data = [
    {
      name: 'Current',
      Income: monthlyIncome,
      Expenses: monthlyExpenses,
      Savings: monthlySavings,
    },
    {
      name: 'Projected',
      Income: projectedIncome,
      Expenses: monthlyExpenses,
      Savings: Math.max(0, projectedIncome - monthlyExpenses),
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Income vs. Expenses
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip 
              formatter={(value: number) => `$${value.toFixed(2)}`}
              contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
            />
            <Legend />
            <Bar dataKey="Income" fill="hsl(var(--primary))" />
            <Bar dataKey="Expenses" fill="hsl(var(--destructive))" />
            <Bar dataKey="Savings" fill="hsl(var(--chart-2))" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
