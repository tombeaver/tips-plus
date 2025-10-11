import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Calendar, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface ShiftRecommendationsProps {
  monthlyIncome: number;
  monthlyExpenses: number;
  monthlySavingsGoal: number;
  averagePerShift: number;
  shiftsWorkedThisMonth: number;
  daysLeftInMonth: number;
}

export const ShiftRecommendations: React.FC<ShiftRecommendationsProps> = ({
  monthlyIncome,
  monthlyExpenses,
  monthlySavingsGoal,
  averagePerShift,
  shiftsWorkedThisMonth,
  daysLeftInMonth,
}) => {
  const requiredMonthlyIncome = monthlyExpenses + monthlySavingsGoal;
  const shortfall = Math.max(0, requiredMonthlyIncome - monthlyIncome);
  const shiftsNeeded = averagePerShift > 0 ? Math.ceil(shortfall / averagePerShift) : 0;
  const progress = requiredMonthlyIncome > 0 ? (monthlyIncome / requiredMonthlyIncome) * 100 : 0;
  
  const safeToSpend = Math.max(0, monthlyIncome - monthlyExpenses - monthlySavingsGoal);
  const weeklyBudget = safeToSpend / 4;

  const getStatusIcon = () => {
    if (progress >= 100) return <CheckCircle className="h-5 w-5 text-green-600" />;
    if (progress >= 75) return <TrendingUp className="h-5 w-5 text-yellow-600" />;
    return <AlertCircle className="h-5 w-5 text-red-600" />;
  };

  const getStatusMessage = () => {
    if (progress >= 100) {
      return "Great job! You've covered expenses and met your savings goal.";
    }
    if (shiftsNeeded > 0 && daysLeftInMonth > 0) {
      return `You need ${shiftsNeeded} more shift${shiftsNeeded !== 1 ? 's' : ''} this month to cover expenses and save $${monthlySavingsGoal.toFixed(0)}.`;
    }
    if (shiftsNeeded > 0 && daysLeftInMonth === 0) {
      return `You're $${shortfall.toFixed(2)} short of your target this month. Consider adjusting next month's plan.`;
    }
    return "Keep tracking your shifts to meet your goals!";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Shift Recommendations
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <div className="flex items-start gap-3">
            {getStatusIcon()}
            <AlertDescription className="flex-1">
              {getStatusMessage()}
            </AlertDescription>
          </div>
        </Alert>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Monthly Progress</span>
            <span className="font-semibold">
              ${monthlyIncome.toFixed(0)} / ${requiredMonthlyIncome.toFixed(0)}
            </span>
          </div>
          <Progress value={Math.min(progress, 100)} className="h-2" />
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
          <div>
            <p className="text-xs text-muted-foreground">Shifts This Month</p>
            <p className="text-2xl font-bold">{shiftsWorkedThisMonth}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Days Remaining</p>
            <p className="text-2xl font-bold">{daysLeftInMonth}</p>
          </div>
        </div>

        {safeToSpend > 0 && (
          <div className="pt-4 border-t">
            <p className="text-sm font-medium mb-2">Safe to Spend</p>
            <div className="space-y-1">
              <p className="text-lg font-bold text-green-600">
                ${safeToSpend.toFixed(2)} <span className="text-xs font-normal text-muted-foreground">this month</span>
              </p>
              <p className="text-sm text-muted-foreground">
                ~${weeklyBudget.toFixed(2)} per week
              </p>
            </div>
          </div>
        )}

        {averagePerShift > 0 && (
          <div className="text-xs text-muted-foreground pt-2">
            Average earnings per shift: ${averagePerShift.toFixed(2)}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
