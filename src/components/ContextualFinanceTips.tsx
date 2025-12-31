import { Card, CardContent } from '@/components/ui/card';
import { Lightbulb, TrendingUp, PiggyBank, AlertTriangle, Target, Sparkles, Clock } from 'lucide-react';

interface ContextualFinanceTipsProps {
  monthlyIncome: number;
  monthlyExpenses: number;
  monthlySavings: number;
  savingsGoal: number;
  averagePerShift: number;
  shiftsWorkedThisMonth: number;
  weeklyTarget: number;
  weeklyEarned: number;
  daysLeftInWeek: number;
}

interface Tip {
  icon: React.ReactNode;
  title: string;
  message: string;
  type: 'success' | 'warning' | 'info';
}

export const ContextualFinanceTips: React.FC<ContextualFinanceTipsProps> = ({
  monthlyIncome,
  monthlyExpenses,
  monthlySavings,
  savingsGoal,
  averagePerShift,
  shiftsWorkedThisMonth,
  weeklyTarget,
  weeklyEarned,
  daysLeftInWeek,
}) => {
  const savingsRate = monthlyIncome > 0 ? (monthlySavings / monthlyIncome) * 100 : 0;
  const expenseRatio = monthlyIncome > 0 ? (monthlyExpenses / monthlyIncome) * 100 : 0;
  const savingsGoalProgress = savingsGoal > 0 ? (monthlySavings / savingsGoal) * 100 : 0;
  const netIncome = monthlyIncome - monthlyExpenses;

  // Weekly shift pace calculation
  const weeklyShortfall = Math.max(0, weeklyTarget - weeklyEarned);
  const weeklyShiftsNeeded = averagePerShift > 0 ? Math.ceil(weeklyShortfall / averagePerShift) : 0;
  const shiftsPerDayNeeded = daysLeftInWeek > 0 ? weeklyShiftsNeeded / daysLeftInWeek : 0;
  const shiftPace = weeklyEarned >= weeklyTarget ? 'on track' : 
    shiftsPerDayNeeded <= 0.5 ? 'relaxed' : 
    shiftsPerDayNeeded <= 1 ? 'steady' : 'aggressive';

  const tips: Tip[] = [];

  // Generate contextual tips based on data
  if (monthlyIncome === 0 && shiftsWorkedThisMonth === 0) {
    tips.push({
      icon: <Sparkles className="h-5 w-5" />,
      title: "Get Started",
      message: "Log your first shift to start tracking your earnings and get personalized insights.",
      type: 'info',
    });
  }

  // Savings rate tips
  if (savingsRate >= 20) {
    tips.push({
      icon: <PiggyBank className="h-5 w-5" />,
      title: "Great Savings Rate!",
      message: `You're saving ${savingsRate.toFixed(0)}% of your income — that's excellent! Consider investing the surplus.`,
      type: 'success',
    });
  } else if (savingsRate >= 10 && savingsRate < 20) {
    tips.push({
      icon: <PiggyBank className="h-5 w-5" />,
      title: "Solid Progress",
      message: `${savingsRate.toFixed(0)}% savings rate. Try to bump it to 20% for better financial security.`,
      type: 'info',
    });
  } else if (monthlyIncome > 0 && savingsRate < 10) {
    tips.push({
      icon: <AlertTriangle className="h-5 w-5" />,
      title: "Low Savings",
      message: `Only ${savingsRate.toFixed(0)}% going to savings. Look for expenses you can reduce or add an extra shift.`,
      type: 'warning',
    });
  }

  // Expense ratio tips
  if (expenseRatio > 80 && monthlyIncome > 0) {
    tips.push({
      icon: <AlertTriangle className="h-5 w-5" />,
      title: "High Expense Ratio",
      message: `${expenseRatio.toFixed(0)}% of income goes to expenses. Review your budget for areas to cut back.`,
      type: 'warning',
    });
  }

  // Negative net income
  if (netIncome < 0 && monthlyIncome > 0) {
    tips.push({
      icon: <AlertTriangle className="h-5 w-5" />,
      title: "Spending Exceeds Income",
      message: `You're $${Math.abs(netIncome).toFixed(0)} over budget. Prioritize essential expenses or pick up extra shifts.`,
      type: 'warning',
    });
  }

  // Savings goal progress
  if (savingsGoalProgress >= 100) {
    tips.push({
      icon: <Target className="h-5 w-5" />,
      title: "Savings Goal Reached!",
      message: "Amazing work hitting your goal! Consider increasing it next month to build even more security.",
      type: 'success',
    });
  } else if (savingsGoalProgress >= 75 && savingsGoalProgress < 100) {
    tips.push({
      icon: <Target className="h-5 w-5" />,
      title: "Almost There",
      message: `${savingsGoalProgress.toFixed(0)}% to your savings goal. One more good shift could get you there!`,
      type: 'info',
    });
  }

  // Shift optimization tip
  if (averagePerShift > 0 && shiftsWorkedThisMonth >= 10) {
    tips.push({
      icon: <TrendingUp className="h-5 w-5" />,
      title: "Consistent Worker",
      message: `${shiftsWorkedThisMonth} shifts averaging $${averagePerShift.toFixed(0)} each. Track which days perform best!`,
      type: 'success',
    });
  }

  // Don't show anything if no relevant tips
  if (tips.length === 0) return null;

  // Only show top 2 most relevant tips
  const displayTips = tips.slice(0, 2);

  const getTypeStyles = (type: Tip['type']) => {
    switch (type) {
      case 'success':
        return 'bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-400';
      case 'warning':
        return 'bg-amber-500/10 border-amber-500/20 text-amber-700 dark:text-amber-400';
      case 'info':
      default:
        return 'bg-blue-500/10 border-blue-500/20 text-blue-700 dark:text-blue-400';
    }
  };

  const getIconColor = (type: Tip['type']) => {
    switch (type) {
      case 'success':
        return 'text-emerald-500';
      case 'warning':
        return 'text-amber-500';
      case 'info':
      default:
        return 'text-blue-500';
    }
  };

  const getPaceStyles = () => {
    switch (shiftPace) {
      case 'on track':
        return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400';
      case 'relaxed':
        return 'bg-blue-500/10 text-blue-600 dark:text-blue-400';
      case 'steady':
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-400';
      case 'aggressive':
        return 'bg-red-500/10 text-red-600 dark:text-red-400';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Lightbulb className="h-4 w-4" />
            <span className="text-sm font-medium">Insights</span>
          </div>
          
          {/* Shift Pace Token */}
          {weeklyTarget > 0 && (
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${getPaceStyles()}`}>
              <Clock className="h-3 w-3" />
              <span className="capitalize">{shiftPace}</span>
            </div>
          )}
        </div>
        
        {displayTips.map((tip, index) => (
          <div
            key={index}
            className={`p-3 rounded-lg border ${getTypeStyles(tip.type)}`}
          >
            <div className="flex items-start gap-3">
              <div className={getIconColor(tip.type)}>
                {tip.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-foreground">{tip.title}</p>
                <p className="text-sm opacity-90 mt-0.5">{tip.message}</p>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
