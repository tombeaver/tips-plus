import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Target, TrendingUp, Calendar, Edit, Trash2, Plus, Clock, DollarSign, Wallet } from 'lucide-react';
import { Goal, FinancialData } from '@/hooks/useGoals';
import { TipEntry } from '@/hooks/useTipEntries';
import { GoalSettingsForm } from '@/components/GoalSettingsForm';
import { FinancialHealthScore } from '@/components/FinancialHealthScore';
import { IncomeExpenseChart } from '@/components/IncomeExpenseChart';
import { BudgetInput } from '@/components/BudgetInput';
import { ShiftRecommendations } from '@/components/ShiftRecommendations';
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, isWithinInterval, differenceInDays } from 'date-fns';

interface GoalSettingsProps {
  goals: Goal[];
  financialData: FinancialData;
  onAddGoal: (goal: Omit<Goal, 'id'>) => Promise<void>;
  onUpdateGoal: (goalId: string, goal: Omit<Goal, 'id'>) => Promise<void>;
  onDeleteGoal: (goalId: string) => Promise<void>;
  onUpdateFinancialData: (data: FinancialData) => Promise<void>;
  tipEntries: TipEntry[];
}

export const GoalSettings: React.FC<GoalSettingsProps> = ({ 
  goals, 
  financialData,
  onAddGoal, 
  onUpdateGoal, 
  onDeleteGoal,
  onUpdateFinancialData,
  tipEntries 
}) => {
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [showForm, setShowForm] = useState(false);

  // Get one goal for each time period
  const goalsByType = useMemo(() => {
    const types: ('daily' | 'weekly' | 'monthly' | 'yearly')[] = ['daily', 'weekly', 'monthly', 'yearly'];
    return types.map(type => ({
      type,
      goal: goals.find(g => g.type === type)
    }));
  }, [goals]);

  const realEntries = tipEntries.filter(entry => !entry.isPlaceholder);

  const goalProgress = useMemo(() => {
    const now = new Date();
    
    return goals.map(goal => {
      let period: { start: Date; end: Date };
      let achieved = 0;
      
      switch (goal.type) {
        case 'daily':
          // Get today's earnings
          const todayEntries = realEntries.filter(entry => 
            entry.date.toDateString() === now.toDateString()
          );
          achieved = todayEntries.reduce((sum, entry) => sum + entry.creditTips + entry.cashTips, 0);
          period = { start: now, end: now };
          break;
          
        case 'weekly':
          period = { start: startOfWeek(now), end: endOfWeek(now) };
          achieved = realEntries
            .filter(entry => isWithinInterval(entry.date, period))
            .reduce((sum, entry) => sum + entry.creditTips + entry.cashTips, 0);
          break;
          
        case 'monthly':
          period = { start: startOfMonth(now), end: endOfMonth(now) };
          achieved = realEntries
            .filter(entry => isWithinInterval(entry.date, period))
            .reduce((sum, entry) => sum + entry.creditTips + entry.cashTips, 0);
          break;
          
        case 'yearly':
          period = { start: startOfYear(now), end: endOfYear(now) };
          achieved = realEntries
            .filter(entry => isWithinInterval(entry.date, period))
            .reduce((sum, entry) => sum + entry.creditTips + entry.cashTips, 0);
          break;
      }
      
      const percentage = goal.amount > 0 ? Math.min((achieved / goal.amount) * 100, 100) : 0;
      
      return {
        ...goal,
        achieved,
        percentage,
        period
      };
    });
  }, [goals, realEntries]);

  const handleSubmitGoal = async (goalData: Omit<Goal, 'id'>) => {
    if (editingGoal) {
      await onUpdateGoal(editingGoal.id, goalData);
    } else {
      await onAddGoal(goalData);
    }
    
    setEditingGoal(null);
    setShowForm(false);
  };

  const startEditing = (goalWithProgress: typeof goalProgress[0]) => {
    // Extract the actual Goal object from progress data
    const originalGoal = goals.find(g => g.id === goalWithProgress.id);
    if (originalGoal) {
      setEditingGoal(originalGoal);
      setShowForm(true);
    }
  };

  const startCreating = (type: 'daily' | 'weekly' | 'monthly' | 'yearly') => {
    setEditingGoal(null);
    setShowForm(true);
  };

  const cancelForm = () => {
    setEditingGoal(null);
    setShowForm(false);
  };

  const existingGoalTypes = goals.map(goal => goal.type);
  const availableGoalTypes = (['daily', 'weekly', 'monthly', 'yearly'] as const)
    .filter(type => !existingGoalTypes.includes(type));
  const allGoalTypesSet = availableGoalTypes.length === 0;

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
    
    // Calculate current savings (income - expenses)
    const currentSavings = Math.max(0, monthTotal - financialData.monthlyExpenses);
    
    return {
      averagePerShift,
      monthlyIncome: monthTotal,
      projectedMonthlyIncome: projectedMonthTotal,
      shiftsWorkedThisMonth: monthEntries.length,
      daysLeftInMonth,
      currentSavings,
    };
  }, [realEntries, tipEntries, financialData.monthlyExpenses]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-6 w-6" />
            Financial Dashboard
          </CardTitle>
          <p className="body-md text-muted-foreground">
            Track income, expenses, savings, and reach your financial goals
          </p>
        </CardHeader>
      </Card>

      {/* Budget Input */}
      <BudgetInput
        monthlyExpenses={financialData.monthlyExpenses}
        monthlySavingsGoal={financialData.monthlySavingsGoal}
        monthlySpendingLimit={financialData.monthlySpendingLimit}
        onSave={onUpdateFinancialData}
      />

      {/* Financial Health Score */}
      <FinancialHealthScore
        monthlyIncome={financialMetrics.monthlyIncome}
        monthlyExpenses={financialData.monthlyExpenses}
        monthlySavings={financialMetrics.currentSavings}
        savingsGoal={financialData.monthlySavingsGoal}
      />

      {/* Shift Recommendations */}
      <ShiftRecommendations
        monthlyIncome={financialMetrics.monthlyIncome}
        monthlyExpenses={financialData.monthlyExpenses}
        monthlySavingsGoal={financialData.monthlySavingsGoal}
        averagePerShift={financialMetrics.averagePerShift}
        shiftsWorkedThisMonth={financialMetrics.shiftsWorkedThisMonth}
        daysLeftInMonth={financialMetrics.daysLeftInMonth}
      />

      {/* Income vs Expense Chart */}
      <IncomeExpenseChart
        monthlyIncome={financialMetrics.monthlyIncome}
        monthlyExpenses={financialData.monthlyExpenses}
        monthlySavings={financialMetrics.currentSavings}
        projectedIncome={financialMetrics.projectedMonthlyIncome}
      />

      {/* Annual Income Goal with Breakdown */}
      <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
        <CardHeader>
          <CardTitle className="text-white text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Annual Income Goal
          </CardTitle>
          <p className="text-white/80 text-sm">Set your yearly target and track weekly progress</p>
        </CardHeader>
        <CardContent>
          {(() => {
            const yearlyGoal = goals.find(g => g.type === 'yearly');
            const yearlyProgress = goalProgress.find(p => p.type === 'yearly');
            const now = new Date();
            const yearStart = startOfYear(now);
            const yearEnd = endOfYear(now);
            const weeksInYear = 52;
            const weeksPassed = Math.floor(differenceInDays(now, yearStart) / 7);
            const weeksRemaining = Math.max(0, weeksInYear - weeksPassed);
            
            if (!yearlyGoal || !yearlyProgress) {
              return (
                <div className="text-center py-8">
                  <Target className="h-12 w-12 mx-auto text-white/60 mb-4" />
                  <h3 className="text-lg font-medium mb-2 text-white">Set Your Annual Income Goal</h3>
                  <p className="text-white/80 mb-4">We'll break it down into monthly and weekly targets</p>
                  <Button onClick={() => {
                    setEditingGoal(null);
                    setShowForm(true);
                  }} variant="secondary">
                    <Plus className="h-4 w-4 mr-2" />
                    Set Annual Goal
                  </Button>
                </div>
              );
            }

            const monthlyTarget = yearlyGoal.amount / 12;
            const weeksPerMonth = 52 / 12; // ~4.33 weeks per month
            const weeklyTarget = monthlyTarget / weeksPerMonth;
            
            // Calculate current period earnings
            const weekStart = startOfWeek(now);
            const weekEnd = endOfWeek(now);
            const monthStart = startOfMonth(now);
            const monthEnd = endOfMonth(now);
            
            const currentWeekEarnings = realEntries
              .filter(entry => isWithinInterval(entry.date, { start: weekStart, end: weekEnd }))
              .reduce((sum, entry) => sum + entry.creditTips + entry.cashTips, 0);
            
            const currentMonthEarnings = realEntries
              .filter(entry => isWithinInterval(entry.date, { start: monthStart, end: monthEnd }))
              .reduce((sum, entry) => sum + entry.creditTips + entry.cashTips, 0);
            
            const weeklyNeeded = Math.max(0, weeklyTarget - currentWeekEarnings);
            const monthlyNeeded = Math.max(0, monthlyTarget - currentMonthEarnings);

            return (
              <div className="space-y-6">
                {/* Main Annual Goal */}
                <div className="p-4 border border-white/20 rounded-lg bg-white/5">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="text-2xl font-bold text-white">
                        ${yearlyGoal.amount.toLocaleString()}
                      </h4>
                      <p className="text-sm text-white/70">Annual Income Target</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          setEditingGoal(yearlyGoal);
                          setShowForm(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => onDeleteGoal(yearlyGoal.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm font-medium text-white">
                      <span>Year Progress</span>
                      <span>${yearlyProgress.achieved.toLocaleString()} / ${yearlyGoal.amount.toLocaleString()}</span>
                    </div>
                    <Progress value={yearlyProgress.percentage} className="h-3" />
                    <div className="text-sm text-white/70">
                      {yearlyProgress.percentage.toFixed(1)}% complete • {weeksRemaining} weeks remaining
                    </div>
                  </div>
                </div>

                {/* Breakdown Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Monthly Target */}
                  <div className="p-4 border border-white/20 rounded-lg bg-white/10">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="h-4 w-4 text-white/70" />
                      <span className="text-xs text-white/70 uppercase">Monthly Target</span>
                    </div>
                    <div className="text-xl font-bold text-white">
                      ${currentMonthEarnings.toLocaleString(undefined, { maximumFractionDigits: 0 })} / ${monthlyTarget.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </div>
                    <p className="text-xs text-white/60 mt-1">
                      ${monthlyNeeded.toLocaleString(undefined, { maximumFractionDigits: 0 })} remaining
                    </p>
                  </div>

                  {/* Weekly Target */}
                  <div className="p-4 border border-white/20 rounded-lg bg-white/10">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="h-4 w-4 text-white/70" />
                      <span className="text-xs text-white/70 uppercase">Weekly Target</span>
                    </div>
                    <div className="text-xl font-bold text-white">
                      ${currentWeekEarnings.toLocaleString(undefined, { maximumFractionDigits: 0 })} / ${weeklyTarget.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </div>
                    <p className="text-xs text-white/60 mt-1">
                      ${weeklyNeeded.toLocaleString(undefined, { maximumFractionDigits: 0 })} remaining
                    </p>
                  </div>

                  {/* Needed This Week */}
                  <div className="p-4 border border-green-300/30 rounded-lg bg-green-500/20">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="h-4 w-4 text-green-200" />
                      <span className="text-xs text-green-200 uppercase">Need This Week</span>
                    </div>
                    <div className="text-xl font-bold text-white">
                      ${weeklyNeeded.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </div>
                    <p className="text-xs text-green-200 mt-1">
                      {currentWeekEarnings > 0 ? 
                        `$${currentWeekEarnings.toLocaleString(undefined, { maximumFractionDigits: 0 })} earned so far` :
                        'To reach weekly target'
                      }
                    </p>
                  </div>
                </div>

                {/* Progress Summary */}
                <div className="p-4 border border-white/20 rounded-lg bg-white/5">
                  <h5 className="font-semibold text-white mb-3">💡 Progress Summary</h5>
                  <div className="space-y-2 text-sm text-white/80">
                    <p>
                      <span className="font-semibold text-white">This Week:</span> You've earned ${currentWeekEarnings.toLocaleString(undefined, { maximumFractionDigits: 0 })} of your ${weeklyTarget.toLocaleString(undefined, { maximumFractionDigits: 0 })} weekly target
                      {weeklyNeeded > 0 && <span className="text-green-300"> • ${weeklyNeeded.toLocaleString(undefined, { maximumFractionDigits: 0 })} more needed</span>}
                    </p>
                    <p>
                      <span className="font-semibold text-white">This Month:</span> You've earned ${currentMonthEarnings.toLocaleString(undefined, { maximumFractionDigits: 0 })} of your ${monthlyTarget.toLocaleString(undefined, { maximumFractionDigits: 0 })} monthly target
                      {monthlyNeeded > 0 && <span className="text-green-300"> • ${monthlyNeeded.toLocaleString(undefined, { maximumFractionDigits: 0 })} more needed</span>}
                    </p>
                  </div>
                </div>
              </div>
            );
          })()}

          {showForm && (
            <div className="mt-6 p-4 bg-white rounded-lg">
              <GoalSettingsForm
                editingGoal={editingGoal}
                onSubmit={handleSubmitGoal}
                onCancel={cancelForm}
                availableGoalTypes={editingGoal ? [editingGoal.type] : ['yearly']}
              />
            </div>
          )}

        </CardContent>
      </Card>

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