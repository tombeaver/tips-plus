import React, { useMemo, useState } from 'react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Wallet } from 'lucide-react';
import { FinancialData } from '@/hooks/useGoals';
import { TipEntry } from '@/hooks/useTipEntries';
import { FinancialHealthScore } from '@/components/FinancialHealthScore';
import { FinancialHealthScoreModal } from '@/components/FinancialHealthScoreModal';
import { BudgetInput } from '@/components/BudgetInput';
import { ContextualFinanceTips } from '@/components/ContextualFinanceTips';
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, isWithinInterval, differenceInDays } from 'date-fns';

interface FinanceStrategyProps {
  financialData: FinancialData;
  onUpdateFinancialData: (data: FinancialData) => Promise<void>;
  tipEntries: TipEntry[];
  hasGoalSet?: boolean;
  onNavigateToGoal?: () => void;
}

export const FinanceStrategy: React.FC<FinanceStrategyProps> = ({ 
  financialData,
  onUpdateFinancialData,
  tipEntries,
  hasGoalSet = false,
  onNavigateToGoal,
}) => {
  const [isHealthScoreModalOpen, setIsHealthScoreModalOpen] = useState(false);
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
    
    // Calculate average per shift from real entries (count doubles as 2 shifts)
    const totalEarnings = realEntries.reduce((sum, entry) => sum + calculateTotalEarnings(entry), 0);
    const totalShifts = realEntries.reduce((sum, entry) => sum + (entry.shift === 'Double' ? 2 : 1), 0);
    const averagePerShift = totalShifts > 0 ? totalEarnings / totalShifts : 0;
    
    // Calculate monthly metrics
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);
    const monthEntries = realEntries.filter(entry => isWithinInterval(entry.date, { start: monthStart, end: monthEnd }));
    const monthTotal = monthEntries.reduce((sum, entry) => sum + calculateTotalEarnings(entry), 0);
    
    // Projected monthly with placeholders
    const allMonthEntries = allEntries.filter(entry => isWithinInterval(entry.date, { start: monthStart, end: monthEnd }));
    const projectedMonthTotal = allMonthEntries.reduce((sum, entry) => sum + calculateTotalEarnings(entry), 0);
    
    // Monthly expenses and target
    const totalExpenses = financialData.monthlyExpenses;
    const monthlyTargetIncome = totalExpenses + financialData.monthlySavingsGoal;
    
    // Calculate days left in week (through Saturday) - more relevant for service industry
    const weekStart = startOfWeek(now, { weekStartsOn: 0 });
    const weekEnd = endOfWeek(now, { weekStartsOn: 0 });
    const daysLeftInWeek = Math.max(0, differenceInDays(weekEnd, now) + 1); // +1 to include today
    
    // Calculate weekly earnings and target
    const weekEntries = realEntries.filter(entry => isWithinInterval(entry.date, { start: weekStart, end: weekEnd }));
    const weeklyEarned = weekEntries.reduce((sum, entry) => sum + calculateTotalEarnings(entry), 0);
    const weeklyTarget = monthlyTargetIncome / (52 / 12); // Monthly target divided into weeks
    
    // Calculate shifts worked this month (count doubles as 2)
    const shiftsWorkedThisMonth = monthEntries.reduce((sum, entry) => sum + (entry.shift === 'Double' ? 2 : 1), 0);
    
    // Calculate current savings (income - total expenses)
    const currentSavings = Math.max(0, monthTotal - totalExpenses);
    
    return {
      averagePerShift,
      monthlyIncome: monthTotal,
      projectedMonthlyIncome: projectedMonthTotal,
      shiftsWorkedThisMonth,
      daysLeftInWeek,
      currentSavings,
      totalExpenses,
      monthlyTargetIncome,
      weeklyTarget,
      weeklyEarned,
    };
  }, [realEntries, tipEntries, financialData.monthlyExpenses, financialData.monthlySavingsGoal]);

  const hasBudgetSet = financialMetrics.totalExpenses > 0;

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

      {/* Financial Health Score OR Budget Input based on whether budget is set */}
      {hasBudgetSet ? (
        <FinancialHealthScore
          monthlyIncome={financialMetrics.monthlyIncome}
          monthlyExpenses={financialMetrics.totalExpenses}
          monthlySavings={financialMetrics.currentSavings}
          savingsGoal={financialData.monthlySavingsGoal}
          onClick={() => setIsHealthScoreModalOpen(true)}
        />
      ) : (
        <BudgetInput
          monthlyExpenses={financialData.monthlyExpenses}
          monthlySavingsGoal={financialData.monthlySavingsGoal}
          monthlySpendingLimit={financialData.monthlySpendingLimit}
          onSave={onUpdateFinancialData}
        />
      )}

      {/* Health Score Modal */}
      <FinancialHealthScoreModal
        isOpen={isHealthScoreModalOpen}
        onClose={() => setIsHealthScoreModalOpen(false)}
        monthlyIncome={financialMetrics.monthlyIncome}
        monthlyExpenses={financialMetrics.totalExpenses}
        monthlySavings={financialMetrics.currentSavings}
        savingsGoal={financialData.monthlySavingsGoal}
        financialData={financialData}
        onUpdateFinancialData={onUpdateFinancialData}
        hasGoalSet={hasGoalSet}
        onNavigateToGoal={onNavigateToGoal}
      />

      {/* Contextual Tips - only show when budget is set */}
      {hasBudgetSet && (
        <ContextualFinanceTips
          monthlyIncome={financialMetrics.monthlyIncome}
          monthlyExpenses={financialMetrics.totalExpenses}
          monthlySavings={financialMetrics.currentSavings}
          savingsGoal={financialData.monthlySavingsGoal}
          averagePerShift={financialMetrics.averagePerShift}
          shiftsWorkedThisMonth={financialMetrics.shiftsWorkedThisMonth}
          weeklyTarget={financialMetrics.weeklyTarget}
          weeklyEarned={financialMetrics.weeklyEarned}
          daysLeftInWeek={financialMetrics.daysLeftInWeek}
        />
      )}
    </div>
  );
};
