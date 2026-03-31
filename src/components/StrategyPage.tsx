import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Target, TrendingUp, TrendingDown, CheckCircle2, Clock, Calendar,
  ChevronRight, Wallet, Plus, Sparkles, Lightbulb,
  ArrowUpRight, ArrowDownRight, Minus
} from 'lucide-react';
import { Goal, FinancialData } from '@/hooks/useGoals';
import { TipEntry } from '@/hooks/useTipEntries';
import { GoalSettingsForm } from '@/components/GoalSettingsForm';
import { AnnualGoalModal } from '@/components/AnnualGoalModal';
import { FinancialHealthScoreModal } from '@/components/FinancialHealthScoreModal';
import { BudgetInput } from '@/components/BudgetInput';
import { GoalCelebrationModal } from '@/components/GoalCelebrationModal';
import { 
  startOfYear, endOfYear, startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  isWithinInterval, differenceInDays, format, getDaysInMonth, getDate,
  subMonths, getMonth, getYear
} from 'date-fns';
import { CheckCircle, XCircle } from 'lucide-react';

interface StrategyPageProps {
  goals: Goal[];
  financialData: FinancialData;
  onAddGoal: (goal: Omit<Goal, 'id'>) => Promise<void>;
  onUpdateGoal: (goalId: string, goal: Omit<Goal, 'id'>) => Promise<void>;
  onDeleteGoal: (goalId: string) => Promise<void>;
  onUpdateFinancialData: (data: FinancialData) => Promise<void>;
  tipEntries: TipEntry[];
}

// Helper to calculate total earnings
const calculateTotalEarnings = (entry: TipEntry) => {
  const tips = entry.creditTips + entry.cashTips;
  const wages = entry.hoursWorked * entry.hourlyRate;
  return tips + wages;
};

export const StrategyPage: React.FC<StrategyPageProps> = ({
  goals,
  financialData,
  onAddGoal,
  onUpdateGoal,
  onDeleteGoal,
  onUpdateFinancialData,
  tipEntries,
}) => {
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [isHealthScoreModalOpen, setIsHealthScoreModalOpen] = useState(false);
  const [celebrationType, setCelebrationType] = useState<'weekly' | 'monthly' | null>(null);
  const celebrationCheckedRef = useRef(false);

  const realEntries = tipEntries.filter(entry => !entry.isPlaceholder);
  const yearlyGoal = goals.find(g => g.type === 'yearly') || null;
  const hasBudgetSet = financialData.monthlyExpenses > 0;

  // All computed metrics
  const metrics = useMemo(() => {
    const now = new Date();
    const yearStart = startOfYear(now);
    const yearEnd = endOfYear(now);
    const weekStart = startOfWeek(now);
    const weekEnd = endOfWeek(now);
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);
    const dayOfMonth = getDate(now);
    const daysInMonth = getDaysInMonth(now);
    const monthProgress = dayOfMonth / daysInMonth;

    // Annual
    const yearlyAchieved = realEntries
      .filter(entry => isWithinInterval(entry.date, { start: yearStart, end: yearEnd }))
      .reduce((sum, entry) => sum + calculateTotalEarnings(entry), 0);
    const yearlyPercentage = yearlyGoal && yearlyGoal.amount > 0
      ? Math.min((yearlyAchieved / yearlyGoal.amount) * 100, 100) : 0;

    // Weekly/Monthly targets from annual
    const monthlyTarget = yearlyGoal ? yearlyGoal.amount / 12 : 0;
    const weeklyTarget = monthlyTarget / (52 / 12);

    const weeklyEarned = realEntries
      .filter(entry => isWithinInterval(entry.date, { start: weekStart, end: weekEnd }))
      .reduce((sum, entry) => sum + calculateTotalEarnings(entry), 0);
    const monthlyEarned = realEntries
      .filter(entry => isWithinInterval(entry.date, { start: monthStart, end: monthEnd }))
      .reduce((sum, entry) => sum + calculateTotalEarnings(entry), 0);

    // Average per shift
    const totalEarnings = realEntries.reduce((sum, entry) => sum + calculateTotalEarnings(entry), 0);
    const totalShifts = realEntries.reduce((sum, entry) => sum + (entry.shift === 'Double' ? 2 : 1), 0);
    const averagePerShift = totalShifts > 0 ? totalEarnings / totalShifts : 0;

    // Shifts worked this month
    const monthEntries = realEntries.filter(entry => isWithinInterval(entry.date, { start: monthStart, end: monthEnd }));
    const shiftsWorkedThisMonth = monthEntries.reduce((sum, entry) => sum + (entry.shift === 'Double' ? 2 : 1), 0);

    // Days left
    const daysLeftInMonth = Math.max(0, differenceInDays(monthEnd, now) + 1);

    // Budget metrics
    const proratedExpenses = financialData.monthlyExpenses * monthProgress;
    const proratedSavingsGoal = financialData.monthlySavingsGoal * monthProgress;
    const currentSavings = Math.max(0, monthlyEarned - financialData.monthlyExpenses);
    const monthlyTargetIncome = financialData.monthlyExpenses + financialData.monthlySavingsGoal;

    // Shortfall for shift recommendations
    const shortfall = Math.max(0, monthlyTargetIncome - monthlyEarned);
    const shiftsNeeded = averagePerShift > 0 ? Math.ceil(shortfall / averagePerShift) : 0;
    const budgetProgress = monthlyTargetIncome > 0 ? Math.min((monthlyEarned / monthlyTargetIncome) * 100, 100) : 0;

    // Health score
    const calculateScore = () => {
      if (monthlyEarned === 0 && proratedExpenses === 0) return 50;
      if (monthlyEarned === 0) return 0;
      const incomeExpenseRatio = Math.min((monthlyEarned - proratedExpenses) / monthlyEarned * 100, 100);
      const incomeExpensePoints = Math.max(0, (incomeExpenseRatio / 100) * 40);
      const savingsRate = monthlyEarned > 0 ? (currentSavings / monthlyEarned) * 100 : 0;
      const savingsPoints = Math.min(Math.max(0, (savingsRate / 20) * 30), 30);
      const goalProgress = proratedSavingsGoal > 0 ? (currentSavings / proratedSavingsGoal) * 100 : 100;
      const goalPoints = Math.min(Math.max(0, (goalProgress / 100) * 30), 30);
      return Math.round(incomeExpensePoints + savingsPoints + goalPoints);
    };
    const healthScore = calculateScore();

    // Annual tracking
    const daysPassed = differenceInDays(now, yearStart);
    const expectedProgress = yearlyGoal ? (daysPassed / 365) * yearlyGoal.amount : 0;
    const annualSurplus = yearlyAchieved - expectedProgress;
    const weeksInYear = 52;
    const weeksPassed = Math.floor(daysPassed / 7);
    const weeksRemaining = Math.max(0, weeksInYear - weeksPassed);
    const isOnTrack = yearlyPercentage >= (weeksPassed / weeksInYear) * 100;

    // Monthly history - previous months this year
    const currentMonthIndex = getMonth(now);
    const monthlyHistory = [];
    for (let i = 0; i < currentMonthIndex; i++) {
      const mStart = new Date(getYear(now), i, 1);
      const mEnd = endOfMonth(mStart);
      const earned = realEntries
        .filter(entry => isWithinInterval(entry.date, { start: mStart, end: mEnd }))
        .reduce((sum, entry) => sum + calculateTotalEarnings(entry), 0);
      monthlyHistory.push({
        month: format(mStart, 'MMM'),
        monthFull: format(mStart, 'MMMM'),
        earned,
        target: monthlyTarget,
        met: monthlyTarget > 0 && earned >= monthlyTarget,
        percentage: monthlyTarget > 0 ? Math.min((earned / monthlyTarget) * 100, 100) : 0,
        surplus: earned - monthlyTarget,
      });
    }

    return {
      yearlyAchieved, yearlyPercentage,
      weeklyTarget, weeklyEarned, monthlyTarget, monthlyEarned,
      averagePerShift, shiftsWorkedThisMonth, daysLeftInMonth,
      currentSavings, monthlyTargetIncome, shortfall, shiftsNeeded, budgetProgress,
      healthScore, proratedExpenses, proratedSavingsGoal,
      annualSurplus, weeksRemaining, isOnTrack, weeksPassed,
      monthProgress, monthlyHistory,
    };
  }, [realEntries, tipEntries, yearlyGoal, financialData]);

  // Goal celebration logic
  useEffect(() => {
    if (!yearlyGoal || celebrationCheckedRef.current) return;
    const now = new Date();
    const weekKey = format(startOfWeek(now), 'yyyy-ww');
    const monthKey = format(startOfMonth(now), 'yyyy-MM');
    const celebratedWeeks = JSON.parse(localStorage.getItem('celebratedWeeks') || '[]');
    const celebratedMonths = JSON.parse(localStorage.getItem('celebratedMonths') || '[]');
    const weeklyMet = metrics.weeklyEarned >= metrics.weeklyTarget && metrics.weeklyTarget > 0;
    const monthlyMet = metrics.monthlyEarned >= metrics.monthlyTarget && metrics.monthlyTarget > 0;
    if (monthlyMet && !celebratedMonths.includes(monthKey)) {
      setCelebrationType('monthly');
    } else if (weeklyMet && !celebratedWeeks.includes(weekKey)) {
      setCelebrationType('weekly');
    }
    celebrationCheckedRef.current = true;
  }, [yearlyGoal, metrics]);

  const handleCloseCelebration = () => {
    const now = new Date();
    if (celebrationType === 'weekly') {
      const weekKey = format(startOfWeek(now), 'yyyy-ww');
      const celebratedWeeks = JSON.parse(localStorage.getItem('celebratedWeeks') || '[]');
      localStorage.setItem('celebratedWeeks', JSON.stringify([...celebratedWeeks, weekKey]));
    } else if (celebrationType === 'monthly') {
      const monthKey = format(startOfMonth(now), 'yyyy-MM');
      const celebratedMonths = JSON.parse(localStorage.getItem('celebratedMonths') || '[]');
      localStorage.setItem('celebratedMonths', JSON.stringify([...celebratedMonths, monthKey]));
    }
    setCelebrationType(null);
  };

  const handleSubmitGoal = async (goalData: Omit<Goal, 'id'>) => {
    await onAddGoal(goalData);
    setShowGoalForm(false);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-warning';
    return 'text-destructive';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Needs Work';
  };

  // ─── SHARED COMPONENTS ───────────────────────────────────────

  const AnnualGoalHero = ({ compact = false }: { compact?: boolean }) => {
    if (!yearlyGoal) {
      return (
        <Card className="overflow-hidden border-0 shadow-depth-lg">
          <div className="bg-gradient-primary p-6 text-primary-foreground">
            {!showGoalForm ? (
              <div className="text-center py-4">
                <div className="w-16 h-16 rounded-full bg-primary-foreground/10 mx-auto mb-4 flex items-center justify-center">
                  <Target className="h-8 w-8 text-primary-foreground/70" />
                </div>
                <h3 className="heading-sm text-primary-foreground mb-2">Set Your Annual Income Goal</h3>
                <p className="body-md text-primary-foreground/70 mb-4">We'll break it down into weekly & monthly targets</p>
                <Button onClick={() => setShowGoalForm(true)} variant="secondary" className="interactive-glow">
                  <Plus className="h-4 w-4 mr-2" />
                  Set Annual Goal
                </Button>
              </div>
            ) : (
              <div className="bg-card rounded-lg p-4">
                <GoalSettingsForm
                  editingGoal={null}
                  onSubmit={handleSubmitGoal}
                  onCancel={() => setShowGoalForm(false)}
                  availableGoalTypes={['yearly']}
                />
              </div>
            )}
          </div>
        </Card>
      );
    }

    const isComplete = metrics.yearlyPercentage >= 100;

    return (
      <Card 
        className="overflow-hidden border-0 shadow-depth-lg cursor-pointer interactive-rise"
        onClick={() => setIsGoalModalOpen(true)}
      >
        <div className="bg-gradient-primary p-5 text-primary-foreground">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              <span className="label-lg text-primary-foreground">Annual Income Goal</span>
            </div>
            <div className="flex items-center gap-2">
              {isComplete ? (
                <span className="label-sm bg-success/30 px-2.5 py-1 rounded-full text-primary-foreground">Complete!</span>
              ) : metrics.isOnTrack ? (
                <span className="label-sm bg-success/30 px-2.5 py-1 rounded-full text-primary-foreground">On Track</span>
              ) : (
                <span className="label-sm bg-warning/30 px-2.5 py-1 rounded-full text-primary-foreground">Behind</span>
              )}
              <ChevronRight className="h-4 w-4 opacity-60" />
            </div>
          </div>

          {/* Big number + progress */}
          <div className="flex items-end justify-between mb-3">
            <div>
              <p className="text-3xl font-bold">${metrics.yearlyAchieved.toLocaleString()}</p>
              <p className="body-sm text-primary-foreground/60">of ${yearlyGoal.amount.toLocaleString()}</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">{metrics.yearlyPercentage.toFixed(0)}%</p>
              <p className="body-sm text-primary-foreground/60">{metrics.weeksRemaining}w left</p>
            </div>
          </div>
          <Progress value={metrics.yearlyPercentage} className="h-2.5 bg-primary-foreground/20" />

          {!compact && (
            <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-primary-foreground/15">
              <MiniPeriodCard 
                label="This Week" 
                earned={metrics.weeklyEarned} 
                target={metrics.weeklyTarget} 
              />
              <MiniPeriodCard 
                label="This Month" 
                earned={metrics.monthlyEarned} 
                target={metrics.monthlyTarget} 
              />
            </div>
          )}
        </div>
      </Card>
    );
  };

  const MiniPeriodCard = ({ label, earned, target }: { label: string; earned: number; target: number }) => {
    const progress = target > 0 ? Math.min((earned / target) * 100, 100) : 0;
    const surplus = earned - target;
    return (
      <div className="text-center">
        <p className="label-sm text-primary-foreground/50 mb-1">{label}</p>
        <p className="font-semibold text-primary-foreground">${earned.toFixed(0)}</p>
        <p className="body-sm text-primary-foreground/50">of ${target.toFixed(0)}</p>
        <div className="mt-1.5 h-1 bg-primary-foreground/20 rounded-full overflow-hidden">
          <div className="h-full bg-primary-foreground/60 rounded-full transition-all" style={{ width: `${progress}%` }} />
        </div>
        {target > 0 && (
          <p className={`body-sm mt-1 ${surplus >= 0 ? 'text-primary-foreground/80' : 'text-primary-foreground/50'}`}>
            {surplus >= 0 ? `+$${surplus.toFixed(0)}` : `$${Math.abs(surplus).toFixed(0)} to go`}
          </p>
        )}
      </div>
    );
  };

  const HealthScoreRing = ({ size = 'lg' }: { size?: 'sm' | 'lg' }) => {
    const score = metrics.healthScore;
    const radius = size === 'lg' ? 54 : 32;
    const circumference = 2 * Math.PI * radius;
    const svgSize = size === 'lg' ? 128 : 80;
    
    return (
      <div className="relative" style={{ width: svgSize, height: svgSize }}>
        <svg className="-rotate-90" width={svgSize} height={svgSize}>
          <circle
            cx={svgSize / 2} cy={svgSize / 2} r={radius}
            stroke="hsl(var(--border))" strokeWidth={size === 'lg' ? 8 : 5} fill="none"
          />
          <circle
            cx={svgSize / 2} cy={svgSize / 2} r={radius}
            stroke={score >= 80 ? 'hsl(var(--success))' : score >= 60 ? 'hsl(var(--warning))' : 'hsl(var(--destructive))'}
            strokeWidth={size === 'lg' ? 8 : 5} fill="none"
            strokeDasharray={`${(score / 100) * circumference} ${circumference}`}
            strokeLinecap="round"
            className="transition-all duration-700"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`font-bold ${size === 'lg' ? 'text-2xl' : 'text-lg'} ${getScoreColor(score)}`}>{score}</span>
          {size === 'lg' && <span className="body-sm text-muted-foreground">{getScoreLabel(score)}</span>}
        </div>
      </div>
    );
  };

  const MonthlyBudgetHero = () => {
    if (!hasBudgetSet) return null;
    const isOnTrack = metrics.budgetProgress >= 100;
    const surplus = metrics.monthlyEarned - metrics.monthlyTargetIncome;
    const score = metrics.healthScore;
    const ringR = 22;
    const ringC = 2 * Math.PI * ringR;

    return (
      <Card 
        className="overflow-hidden border-0 shadow-depth-lg cursor-pointer interactive-rise"
        onClick={() => setIsHealthScoreModalOpen(true)}
      >
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-5 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              <span className="label-lg text-white">Monthly Budget</span>
            </div>
            <div className="flex items-center gap-2">
              {isOnTrack ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-200" />
              ) : (
                <span className="label-sm bg-white/20 px-2.5 py-1 rounded-full text-white">{metrics.daysLeftInMonth}d left</span>
              )}
              <ChevronRight className="h-4 w-4 opacity-60" />
            </div>
          </div>

          <div className="flex items-end justify-between mb-3">
            <div>
              <p className="text-3xl font-bold">${metrics.monthlyEarned.toFixed(0)}</p>
              <p className="body-sm text-white/60">of ${metrics.monthlyTargetIncome.toFixed(0)} target</p>
            </div>
            <p className={`text-2xl font-bold ${isOnTrack ? 'text-emerald-200' : 'text-white'}`}>
              {metrics.budgetProgress.toFixed(0)}%
            </p>
          </div>
          <Progress value={metrics.budgetProgress} className="h-2.5 bg-white/20" />

          <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-white/15">
            <div className="text-center">
              <p className="text-xs text-white/50">Expenses</p>
              <p className="font-semibold text-white">${financialData.monthlyExpenses.toFixed(0)}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-white/50">Savings Goal</p>
              <p className="font-semibold text-white">${financialData.monthlySavingsGoal.toFixed(0)}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-white/50">Saved</p>
              <p className="font-semibold text-emerald-200">${metrics.currentSavings.toFixed(0)}</p>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-white/15">
            <div className="flex items-center justify-between">
              <div>
                {isOnTrack ? (
                  <>
                    <div className="flex items-center gap-2 mb-1">
                      <CheckCircle2 className="h-4 w-4 text-emerald-200" />
                      <span className="label-sm text-emerald-200">Target Reached!</span>
                    </div>
                    <p className="text-xl font-bold text-emerald-200">+${surplus.toFixed(0)} surplus</p>
                  </>
                ) : metrics.averagePerShift > 0 ? (
                  <>
                    <div className="flex items-center gap-2 mb-1">
                      <Target className="h-4 w-4 text-white/70" />
                      <span className="label-sm text-white/70">Need {metrics.shiftsNeeded} more shift{metrics.shiftsNeeded !== 1 ? 's' : ''}</span>
                    </div>
                    <p className="text-sm text-white/50">${metrics.averagePerShift.toFixed(0)}/shift avg</p>
                  </>
                ) : (
                  <p className="text-sm text-white/50">Log shifts to see strategy</p>
                )}
              </div>
              <div className="relative" style={{ width: 56, height: 56 }}>
                <svg className="-rotate-90" width={56} height={56}>
                  <circle cx={28} cy={28} r={ringR} stroke="rgba(255,255,255,0.2)" strokeWidth={4} fill="none" />
                  <circle cx={28} cy={28} r={ringR}
                    stroke={score >= 80 ? '#86efac' : score >= 60 ? '#fde68a' : '#fca5a5'}
                    strokeWidth={4} fill="none"
                    strokeDasharray={`${(score / 100) * ringC} ${ringC}`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm font-bold text-white">{score}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 mt-3 pt-3 border-t border-white/15">
              <div className="text-center">
                <p className="font-semibold text-white">{metrics.shiftsWorkedThisMonth}</p>
                <p className="text-xs text-white/50">Shifts</p>
              </div>
              <div className="text-center">
                <p className="font-semibold text-white">{metrics.daysLeftInMonth}</p>
                <p className="text-xs text-white/50">Days Left</p>
              </div>
              <div className="text-center">
                <p className="font-semibold text-white">${metrics.averagePerShift.toFixed(0)}</p>
                <p className="text-xs text-white/50">Per Shift</p>
              </div>
            </div>
          </div>

          <p className="text-xs text-center text-white/40 mt-3">Tap for breakdown & details</p>
        </div>
      </Card>
    );
  };



  const InsightsCard = () => {
    const tips: { icon: React.ReactNode; message: string; type: 'success' | 'warning' | 'info' }[] = [];
    
    const savingsRate = metrics.monthlyEarned > 0 ? (metrics.currentSavings / metrics.monthlyEarned) * 100 : 0;
    
    if (savingsRate >= 20) {
      tips.push({ icon: <TrendingUp className="h-4 w-4" />, message: `Saving ${savingsRate.toFixed(0)}% of income — excellent!`, type: 'success' });
    } else if (metrics.monthlyEarned > 0 && savingsRate < 10) {
      tips.push({ icon: <TrendingDown className="h-4 w-4" />, message: `Only ${savingsRate.toFixed(0)}% going to savings. Add an extra shift or cut expenses.`, type: 'warning' });
    }
    
    if (yearlyGoal && metrics.isOnTrack) {
      tips.push({ icon: <Target className="h-4 w-4" />, message: `You're on pace for your annual goal. Keep it up!`, type: 'success' });
    } else if (yearlyGoal && !metrics.isOnTrack) {
      tips.push({ icon: <Target className="h-4 w-4" />, message: `$${Math.abs(metrics.annualSurplus).toFixed(0)} behind your annual pace. Focus on extra shifts.`, type: 'warning' });
    }

    if (tips.length === 0) return null;

    const getStyle = (type: string) => {
      if (type === 'success') return 'bg-success/10 border-success/20';
      if (type === 'warning') return 'bg-warning/10 border-warning/20';
      return 'bg-primary/5 border-primary/20';
    };

    return (
      <Card>
        <CardContent className="p-4 space-y-2">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Lightbulb className="h-4 w-4" />
            <span className="label-lg">Insights</span>
          </div>
          {tips.slice(0, 2).map((tip, i) => (
            <div key={i} className={`p-3 rounded-lg border ${getStyle(tip.type)} flex items-start gap-2`}>
              <div className={tip.type === 'success' ? 'text-success' : tip.type === 'warning' ? 'text-warning' : 'text-primary'}>{tip.icon}</div>
              <p className="body-md text-foreground">{tip.message}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  };

  const MonthlyHistoryCard = () => {
    if (!yearlyGoal || metrics.monthlyHistory.length === 0) return null;

    const metCount = metrics.monthlyHistory.filter(m => m.met).length;

    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span className="label-lg">Monthly History</span>
            </div>
            <span className="label-sm text-muted-foreground">
              {metCount}/{metrics.monthlyHistory.length} hit
            </span>
          </div>

          <div className="space-y-2">
            {metrics.monthlyHistory.map((m, i) => (
              <div key={i} className={`flex items-center gap-3 p-2.5 rounded-lg ${m.met ? 'bg-success/5' : 'bg-destructive/5'}`}>
                {m.met ? (
                  <CheckCircle className="h-5 w-5 text-success flex-shrink-0" />
                ) : (
                  <XCircle className="h-5 w-5 text-destructive flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="label-md">{m.monthFull}</span>
                    <span className="font-semibold text-sm">${m.earned.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                  </div>
                  <div className="flex items-center justify-between mt-0.5">
                    <div className="flex-1 mr-3">
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all ${m.met ? 'bg-success' : 'bg-destructive/60'}`} 
                          style={{ width: `${m.percentage}%` }} 
                        />
                      </div>
                    </div>
                    <span className={`text-xs font-medium ${m.met ? 'text-success' : 'text-destructive'}`}>
                      {m.surplus >= 0 ? `+$${m.surplus.toFixed(0)}` : `-$${Math.abs(m.surplus).toFixed(0)}`}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  // ─── LAYOUT 1: GOAL-FIRST ──────────────────────────────────

  const GoalFirstLayout = () => (
    <div className="space-y-4 animate-fade-in">
      <AnnualGoalHero />
      
      {/* Budget section */}
      {hasBudgetSet ? (
        <MonthlyBudgetHero />
      ) : (
        <BudgetInput
          monthlyExpenses={financialData.monthlyExpenses}
          monthlySavingsGoal={financialData.monthlySavingsGoal}
          monthlySpendingLimit={financialData.monthlySpendingLimit}
          onSave={onUpdateFinancialData}
        />
      )}
      
      <MonthlyHistoryCard />
      <InsightsCard />
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            Strategy
          </CardTitle>
          <p className="body-md text-muted-foreground">
            Your complete financial game plan
          </p>
        </CardHeader>
      </Card>

      <GoalFirstLayout />

      {/* Modals */}
      <AnnualGoalModal
        isOpen={isGoalModalOpen}
        onClose={() => setIsGoalModalOpen(false)}
        yearlyGoal={yearlyGoal}
        yearlyAchieved={metrics.yearlyAchieved}
        yearlyPercentage={metrics.yearlyPercentage}
        tipEntries={tipEntries}
        averagePerShift={metrics.averagePerShift}
        onUpdateGoal={onUpdateGoal}
        onDeleteGoal={onDeleteGoal}
        onAddGoal={onAddGoal}
        financialData={financialData}
        hasBudgetSet={hasBudgetSet}
        weeklyEarned={metrics.weeklyEarned}
        weeklyTarget={metrics.weeklyTarget}
        monthlyEarned={metrics.monthlyEarned}
        monthlyTarget={metrics.monthlyTarget}
      />

      <FinancialHealthScoreModal
        isOpen={isHealthScoreModalOpen}
        onClose={() => setIsHealthScoreModalOpen(false)}
        monthlyIncome={metrics.monthlyEarned}
        monthlyExpenses={financialData.monthlyExpenses}
        monthlySavings={metrics.currentSavings}
        savingsGoal={financialData.monthlySavingsGoal}
        financialData={financialData}
        onUpdateFinancialData={onUpdateFinancialData}
        hasGoalSet={!!yearlyGoal}
      />

      <GoalCelebrationModal
        isOpen={celebrationType !== null}
        onClose={handleCloseCelebration}
        type={celebrationType || 'weekly'}
        earned={celebrationType === 'monthly' ? metrics.monthlyEarned : metrics.weeklyEarned}
        target={celebrationType === 'monthly' ? metrics.monthlyTarget : metrics.weeklyTarget}
      />
    </div>
  );
};
