import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Target, Plus } from 'lucide-react';
import { Goal, FinancialData } from '@/hooks/useGoals';
import { TipEntry } from '@/hooks/useTipEntries';
import { GoalSettingsForm } from '@/components/GoalSettingsForm';
import { AnnualGoalCard } from '@/components/AnnualGoalCard';
import { AnnualGoalModal } from '@/components/AnnualGoalModal';
import { GoalShiftStrategy } from '@/components/GoalShiftStrategy';
import { startOfYear, endOfYear, isWithinInterval, startOfMonth, endOfMonth, startOfWeek, endOfWeek } from 'date-fns';

interface GoalSettingsProps {
  goals: Goal[];
  financialData: FinancialData;
  onAddGoal: (goal: Omit<Goal, 'id'>) => Promise<void>;
  onUpdateGoal: (goalId: string, goal: Omit<Goal, 'id'>) => Promise<void>;
  onDeleteGoal: (goalId: string) => Promise<void>;
  tipEntries: TipEntry[];
}

export const GoalSettings: React.FC<GoalSettingsProps> = ({ 
  goals, 
  financialData,
  onAddGoal, 
  onUpdateGoal, 
  onDeleteGoal,
  tipEntries 
}) => {
  const [showForm, setShowForm] = useState(false);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);

  const realEntries = tipEntries.filter(entry => !entry.isPlaceholder);

  // Helper to calculate total earnings
  const calculateTotalEarnings = (entry: TipEntry) => {
    const tips = entry.creditTips + entry.cashTips;
    const wages = entry.hoursWorked * entry.hourlyRate;
    return tips + wages;
  };

  const yearlyGoal = goals.find(g => g.type === 'yearly') || null;

  const { yearlyProgress, weeklyData, monthlyData } = useMemo(() => {
    const now = new Date();
    const yearStart = startOfYear(now);
    const yearEnd = endOfYear(now);
    const weekStart = startOfWeek(now);
    const weekEnd = endOfWeek(now);
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);
    
    const achieved = realEntries
      .filter(entry => isWithinInterval(entry.date, { start: yearStart, end: yearEnd }))
      .reduce((sum, entry) => sum + calculateTotalEarnings(entry), 0);
    
    const percentage = yearlyGoal && yearlyGoal.amount > 0 
      ? Math.min((achieved / yearlyGoal.amount) * 100, 100) 
      : 0;

    // Calculate targets based on yearly goal
    const monthlyTarget = yearlyGoal ? yearlyGoal.amount / 12 : 0;
    const weeklyTarget = monthlyTarget / (52 / 12);

    const weeklyEarned = realEntries
      .filter(entry => isWithinInterval(entry.date, { start: weekStart, end: weekEnd }))
      .reduce((sum, entry) => sum + calculateTotalEarnings(entry), 0);

    const monthlyEarned = realEntries
      .filter(entry => isWithinInterval(entry.date, { start: monthStart, end: monthEnd }))
      .reduce((sum, entry) => sum + calculateTotalEarnings(entry), 0);

    return {
      yearlyProgress: { achieved, percentage },
      weeklyData: { target: weeklyTarget, earned: weeklyEarned },
      monthlyData: { target: monthlyTarget, earned: monthlyEarned },
    };
  }, [yearlyGoal, realEntries]);

  const averagePerShift = useMemo(() => {
    if (realEntries.length === 0) return 0;
    const totalEarnings = realEntries.reduce((sum, entry) => sum + calculateTotalEarnings(entry), 0);
    const totalShifts = realEntries.reduce((sum, entry) => sum + (entry.shift === 'Double' ? 2 : 1), 0);
    return totalShifts > 0 ? totalEarnings / totalShifts : 0;
  }, [realEntries]);

  const handleSubmitGoal = async (goalData: Omit<Goal, 'id'>) => {
    await onAddGoal(goalData);
    setShowForm(false);
  };

  const cancelForm = () => {
    setShowForm(false);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-6 w-6" />
            Goal Tracking
          </CardTitle>
          <p className="body-md text-muted-foreground">
            Set and track your income goals across different time periods
          </p>
        </CardHeader>
      </Card>

      {/* Annual Goal Card OR Setup */}
      {yearlyGoal ? (
        <>
          <AnnualGoalCard
            yearlyGoal={yearlyGoal.amount}
            yearlyAchieved={yearlyProgress.achieved}
            yearlyPercentage={yearlyProgress.percentage}
            weeklyTarget={weeklyData.target}
            weeklyEarned={weeklyData.earned}
            monthlyTarget={monthlyData.target}
            monthlyEarned={monthlyData.earned}
            onClick={() => setIsGoalModalOpen(true)}
          />
          
          {/* Shift Strategy */}
          <GoalShiftStrategy
            weeklyTarget={weeklyData.target}
            weeklyEarned={weeklyData.earned}
            monthlyTarget={monthlyData.target}
            monthlyEarned={monthlyData.earned}
            averagePerShift={averagePerShift}
          />
        </>
      ) : (
        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <CardContent className="py-8">
            {!showForm ? (
              <div className="text-center">
                <Target className="h-12 w-12 mx-auto text-white/60 mb-4" />
                <h3 className="text-lg font-medium mb-2 text-white">Set Your Annual Income Goal</h3>
                <p className="text-white/80 mb-4">We'll break it down into monthly and weekly targets</p>
                <Button onClick={() => setShowForm(true)} variant="secondary">
                  <Plus className="h-4 w-4 mr-2" />
                  Set Annual Goal
                </Button>
              </div>
            ) : (
              <div className="bg-white rounded-lg p-4">
                <GoalSettingsForm
                  editingGoal={null}
                  onSubmit={handleSubmitGoal}
                  onCancel={cancelForm}
                  availableGoalTypes={['yearly']}
                />
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Annual Goal Modal */}
      <AnnualGoalModal
        isOpen={isGoalModalOpen}
        onClose={() => setIsGoalModalOpen(false)}
        yearlyGoal={yearlyGoal}
        yearlyAchieved={yearlyProgress.achieved}
        yearlyPercentage={yearlyProgress.percentage}
        tipEntries={tipEntries}
        averagePerShift={averagePerShift}
        onUpdateGoal={onUpdateGoal}
        onDeleteGoal={onDeleteGoal}
        onAddGoal={onAddGoal}
      />
    </div>
  );
};
