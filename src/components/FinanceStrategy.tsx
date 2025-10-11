import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wallet } from 'lucide-react';
import { FinancialData } from '@/hooks/useGoals';
import { TipEntry } from '@/hooks/useTipEntries';
import { FinancialHealthScore } from '@/components/FinancialHealthScore';
import { IncomeExpenseChart } from '@/components/IncomeExpenseChart';
import { BudgetInput } from '@/components/BudgetInput';
import { ShiftRecommendations } from '@/components/ShiftRecommendations';
import { startOfMonth, endOfMonth, isWithinInterval, differenceInDays } from 'date-fns';

interface FinanceStrategyProps {
  financialData: FinancialData;
  onUpdateFinancialData: (data: FinancialData) => Promise<void>;
  tipEntries: TipEntry[];
}

export const FinanceStrategy: React.FC<FinanceStrategyProps> = ({ 
  financialData,
  onUpdateFinancialData,
  tipEntries 
}) => {
  const realEntries = tipEntries.filter(entry => !entry.isPlaceholder);

  const financialMetrics = useMemo(() => {
    const now = new Date();
    const allEntries = [...realEntries, ...tipEntries.filter(entry => entry.isPlaceholder)];
    
    // Calculate total earnings (tips + wages)
    const calculateTotalEarnings = (entry: TipEntry) => {
      const tips = entry.creditTips + entry.cashTips;
      const wages = entry.hoursWorked * entry.hourlyRate;
      return tips + wages;
    };
    
    // Calculate average per shift from real entries
    const averagePerShift = realEntries.length > 0 ? 
      realEntries.reduce((sum, entry) => sum + calculateTotalEarnings(entry), 0) / realEntries.length : 
      0;
    
    // Calculate monthly metrics
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);
    const monthEntries = realEntries.filter(entry => isWithinInterval(entry.date, { start: monthStart, end: monthEnd }));
    const monthTotal = monthEntries.reduce((sum, entry) => sum + calculateTotalEarnings(entry), 0);
    
    // Projected monthly with placeholders
    const allMonthEntries = allEntries.filter(entry => isWithinInterval(entry.date, { start: monthStart, end: monthEnd }));
    const projectedMonthTotal = allMonthEntries.reduce((sum, entry) => sum + calculateTotalEarnings(entry), 0);
    
    // Calculate days left in month
    const daysLeftInMonth = Math.max(0, differenceInDays(monthEnd, now));
    
    // Calculate total expenses (monthly expenses + additional expenses)
    const totalExpenses = financialData.monthlyExpenses + financialData.monthlySpendingLimit;
    
    // Calculate current savings (income - total expenses)
    const currentSavings = Math.max(0, monthTotal - totalExpenses);
    
    return {
      averagePerShift,
      monthlyIncome: monthTotal,
      projectedMonthlyIncome: projectedMonthTotal,
      shiftsWorkedThisMonth: monthEntries.length,
      daysLeftInMonth,
      currentSavings,
      totalExpenses,
    };
  }, [realEntries, tipEntries, financialData.monthlyExpenses, financialData.monthlySpendingLimit]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-6 w-6" />
            Financial Strategy
          </CardTitle>
          <p className="body-md text-muted-foreground">
            Manage your budget, track savings, and optimize your income
          </p>
        </CardHeader>
      </Card>

      {/* Financial Health Score - only show if budget is set */}
      {financialMetrics.totalExpenses > 0 && (
        <FinancialHealthScore
          monthlyIncome={financialMetrics.monthlyIncome}
          monthlyExpenses={financialMetrics.totalExpenses}
          monthlySavings={financialMetrics.currentSavings}
          savingsGoal={financialData.monthlySavingsGoal}
        />
      )}

      {/* Budget Input */}
      <BudgetInput
        monthlyExpenses={financialData.monthlyExpenses}
        monthlySavingsGoal={financialData.monthlySavingsGoal}
        monthlySpendingLimit={financialData.monthlySpendingLimit}
        onSave={onUpdateFinancialData}
      />

      {/* Shift Recommendations */}
      <ShiftRecommendations
        monthlyIncome={financialMetrics.monthlyIncome}
        monthlyExpenses={financialMetrics.totalExpenses}
        monthlySavingsGoal={financialData.monthlySavingsGoal}
        averagePerShift={financialMetrics.averagePerShift}
        shiftsWorkedThisMonth={financialMetrics.shiftsWorkedThisMonth}
        daysLeftInMonth={financialMetrics.daysLeftInMonth}
      />

      {/* Income vs Expense Chart */}
      <IncomeExpenseChart
        monthlyIncome={financialMetrics.monthlyIncome}
        monthlyExpenses={financialMetrics.totalExpenses}
        monthlySavings={financialMetrics.currentSavings}
      />

      {/* Tips Section */}
      <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
        <CardHeader>
          <CardTitle className="text-white text-lg">Financial Planning Tips</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="p-3 border border-white/20 rounded-lg bg-white/5">
            <p className="text-white text-sm">• Track all expenses to identify areas to save</p>
          </div>
          <div className="p-3 border border-white/20 rounded-lg bg-white/5">
            <p className="text-white text-sm">• Aim to save at least 20% of your income</p>
          </div>
          <div className="p-3 border border-white/20 rounded-lg bg-white/5">
            <p className="text-white text-sm">• Set aside money for irregular expenses (car maintenance, gifts)</p>
          </div>
          <div className="p-3 border border-white/20 rounded-lg bg-white/5">
            <p className="text-white text-sm">• Review your budget monthly and adjust as needed</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
