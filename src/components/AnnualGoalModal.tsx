import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Target, Calendar, Clock, Pencil, X, Save, Trash2, Wallet, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';
import { Goal, FinancialData } from '@/hooks/useGoals';
import { TipEntry } from '@/hooks/useTipEntries';
import { 
  differenceInDays, 
  startOfYear, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  isWithinInterval 
} from 'date-fns';

interface AnnualGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  yearlyGoal: Goal | null;
  yearlyAchieved: number;
  yearlyPercentage: number;
  tipEntries: TipEntry[];
  averagePerShift: number;
  onUpdateGoal: (goalId: string, goal: Omit<Goal, 'id'>) => Promise<void>;
  onDeleteGoal: (goalId: string) => Promise<void>;
  onAddGoal: (goal: Omit<Goal, 'id'>) => Promise<void>;
  // Cross-linking props
  financialData?: FinancialData;
  hasBudgetSet?: boolean;
  onNavigateToBudget?: () => void;
}

export const AnnualGoalModal: React.FC<AnnualGoalModalProps> = ({
  isOpen,
  onClose,
  yearlyGoal,
  yearlyAchieved,
  yearlyPercentage,
  tipEntries,
  averagePerShift,
  onUpdateGoal,
  onDeleteGoal,
  onAddGoal,
  financialData,
  hasBudgetSet = false,
  onNavigateToBudget,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [goalAmount, setGoalAmount] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const realEntries = tipEntries.filter(entry => !entry.isPlaceholder);

  useEffect(() => {
    if (isOpen && yearlyGoal) {
      setGoalAmount(yearlyGoal.amount.toString());
      setIsEditing(false);
      setShowDeleteConfirm(false);
    }
  }, [isOpen, yearlyGoal]);

  const now = new Date();
  const yearStart = startOfYear(now);
  const weeksInYear = 52;
  const weeksPassed = Math.floor(differenceInDays(now, yearStart) / 7);
  const weeksRemaining = Math.max(0, weeksInYear - weeksPassed);

  // Calculate targets
  const monthlyTarget = yearlyGoal ? yearlyGoal.amount / 12 : 0;
  const weeklyTarget = monthlyTarget / (52 / 12);

  // Calculate current period earnings
  const calculateTotalEarnings = (entry: TipEntry) => {
    const tips = entry.creditTips + entry.cashTips;
    const wages = entry.hoursWorked * entry.hourlyRate;
    return tips + wages;
  };

  const weekStart = startOfWeek(now);
  const weekEnd = endOfWeek(now);
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);

  const currentWeekEarnings = realEntries
    .filter(entry => isWithinInterval(entry.date, { start: weekStart, end: weekEnd }))
    .reduce((sum, entry) => sum + calculateTotalEarnings(entry), 0);

  const currentMonthEarnings = realEntries
    .filter(entry => isWithinInterval(entry.date, { start: monthStart, end: monthEnd }))
    .reduce((sum, entry) => sum + calculateTotalEarnings(entry), 0);

  const weeklyNeeded = Math.max(0, weeklyTarget - currentWeekEarnings);
  const monthlyNeeded = Math.max(0, monthlyTarget - currentMonthEarnings);
  const weeklyProgress = weeklyTarget > 0 ? Math.min((currentWeekEarnings / weeklyTarget) * 100, 100) : 0;
  const monthlyProgress = monthlyTarget > 0 ? Math.min((currentMonthEarnings / monthlyTarget) * 100, 100) : 0;

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const amount = parseFloat(goalAmount) || 0;
      if (yearlyGoal) {
        await onUpdateGoal(yearlyGoal.id, { type: 'yearly', amount, period: 'yearly' });
      } else {
        await onAddGoal({ type: 'yearly', amount, period: 'yearly' });
      }
      setIsEditing(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (yearlyGoal) {
      await onDeleteGoal(yearlyGoal.id);
      onClose();
    }
  };

  const shiftsNeededWeekly = averagePerShift > 0 ? Math.ceil(weeklyNeeded / averagePerShift) : 0;
  const shiftsNeededMonthly = averagePerShift > 0 ? Math.ceil(monthlyNeeded / averagePerShift) : 0;

  // Budget sustainability check
  const monthlyExpenses = financialData?.monthlyExpenses || 0;
  const monthlySavingsGoal = financialData?.monthlySavingsGoal || 0;
  const monthlyBudgetNeeded = monthlyExpenses + monthlySavingsGoal;
  const isBudgetUnsustainable = hasBudgetSet && monthlyTarget > 0 && monthlyBudgetNeeded > monthlyTarget;
  const budgetGap = monthlyBudgetNeeded - monthlyTarget;
  const annualGapAdjustment = budgetGap * 12;

  const handleIncreaseGoal = async () => {
    if (yearlyGoal) {
      const newAmount = yearlyGoal.amount + annualGapAdjustment;
      await onUpdateGoal(yearlyGoal.id, { type: 'yearly', amount: newAmount, period: 'yearly' });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-screen h-screen max-w-none p-0 gap-0 border-0 flex flex-col" hideCloseButton>
        {/* Gradient Header */}
        <div className="sticky top-0 z-10 h-[130px] bg-gradient-to-r from-purple-600 via-purple-500 to-purple-600 px-6 pt-[50px] flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-white">
            Annual Income Goal
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 text-white"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto flex-1 bg-background">
          <div className="p-4 space-y-4">
            {/* Main Progress */}
            <div className="text-center py-4">
              <p className="text-4xl font-bold text-foreground">
                ${yearlyAchieved.toLocaleString()}
              </p>
              <p className="text-muted-foreground text-sm mt-1">
                of ${yearlyGoal?.amount.toLocaleString() || '0'} annual goal
              </p>
              <div className="mt-4 mx-auto max-w-xs">
                <Progress value={yearlyPercentage} className="h-3" />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>{yearlyPercentage.toFixed(1)}% complete</span>
                  <span>{weeksRemaining} weeks left</span>
                </div>
              </div>
            </div>

            {/* Weekly & Monthly Breakdown */}
            <div className="grid grid-cols-2 gap-3">
              <Card className="bg-muted/30">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground uppercase">This Week</span>
                  </div>
                  <p className="text-xl font-bold">${currentWeekEarnings.toFixed(0)}</p>
                  <p className="text-xs text-muted-foreground">of ${weeklyTarget.toFixed(0)}</p>
                  <Progress value={weeklyProgress} className="h-1.5 mt-2" />
                </CardContent>
              </Card>

              <Card className="bg-muted/30">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground uppercase">This Month</span>
                  </div>
                  <p className="text-xl font-bold">${currentMonthEarnings.toFixed(0)}</p>
                  <p className="text-xs text-muted-foreground">of ${monthlyTarget.toFixed(0)}</p>
                  <Progress value={monthlyProgress} className="h-1.5 mt-2" />
                </CardContent>
              </Card>
            </div>

            {/* Budget Setup Prompt (if budget not set) */}
            {!hasBudgetSet && (
              <Card className="border-amber-500/50 bg-amber-500/10">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Wallet className="h-5 w-5 text-amber-500 mt-0.5 shrink-0" />
                    <div className="flex-1">
                      <p className="font-medium text-sm">Set Up Your Budget</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Track your expenses and savings goals to see if your income goal covers your needs.
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-3"
                        onClick={() => {
                          onClose();
                          onNavigateToBudget?.();
                        }}
                      >
                        <Wallet className="h-4 w-4 mr-2" />
                        Set Up Budget
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Budget Sustainability Warning */}
            {isBudgetUnsustainable && (
              <Card className="border-red-500/50 bg-red-500/10">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 shrink-0" />
                    <div className="flex-1">
                      <p className="font-medium text-sm">Budget Exceeds Income Target</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Your monthly expenses (${monthlyExpenses.toFixed(0)}) + savings goal (${monthlySavingsGoal.toFixed(0)}) = ${monthlyBudgetNeeded.toFixed(0)}/mo exceeds your monthly target of ${monthlyTarget.toFixed(0)}.
                      </p>
                      <div className="flex flex-wrap gap-2 mt-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleIncreaseGoal}
                        >
                          <TrendingUp className="h-4 w-4 mr-2" />
                          Increase Goal +${annualGapAdjustment.toLocaleString()}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            onClose();
                            onNavigateToBudget?.();
                          }}
                        >
                          <TrendingDown className="h-4 w-4 mr-2" />
                          Edit Budget
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Breakdown Summary */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Target Breakdown</p>
              <div className="space-y-2">
                <div className="flex justify-between items-center py-2 border-b border-border/50">
                  <span className="text-sm text-muted-foreground">Yearly Goal</span>
                  <span className="font-medium">${yearlyGoal?.amount.toLocaleString() || '0'}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border/50">
                  <span className="text-sm text-muted-foreground">Monthly Target</span>
                  <span className="font-medium">${monthlyTarget.toFixed(0)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border/50 last:border-0">
                  <span className="text-sm text-muted-foreground">Weekly Target</span>
                  <span className="font-medium">${weeklyTarget.toFixed(0)}</span>
                </div>
              </div>
            </div>

            {/* Edit Goal Button / Form */}
            {!isEditing && !showDeleteConfirm ? (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setIsEditing(true)}
                >
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit Goal
                </Button>
                <Button
                  variant="outline"
                  className="text-destructive hover:bg-destructive/10"
                  onClick={() => setShowDeleteConfirm(true)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ) : showDeleteConfirm ? (
              <Card className="border-destructive/50">
                <CardContent className="p-4 space-y-3">
                  <p className="text-sm text-center">Are you sure you want to delete your annual goal?</p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => setShowDeleteConfirm(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="destructive"
                      className="flex-1"
                      onClick={handleDelete}
                    >
                      Delete Goal
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-primary/50">
                <CardContent className="p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">Edit Annual Goal</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsEditing(false)}
                    >
                      Cancel
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="annual-goal">Annual Income Target ($)</Label>
                    <Input
                      id="annual-goal"
                      type="number"
                      step="1000"
                      placeholder="e.g. 60000"
                      value={goalAmount}
                      onChange={(e) => setGoalAmount(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      This breaks down to ${((parseFloat(goalAmount) || 0) / 12).toFixed(0)}/month and ${((parseFloat(goalAmount) || 0) / 52).toFixed(0)}/week
                    </p>
                  </div>

                  <Button 
                    onClick={handleSave} 
                    disabled={isSaving}
                    className="w-full"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {isSaving ? 'Saving...' : 'Save Goal'}
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
