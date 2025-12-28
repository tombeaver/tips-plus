import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Calendar, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface ShiftRecommendationsProps {
  monthlyIncome: number;
  monthlyTargetIncome: number;
  averagePerShift: number;
  shiftsWorkedThisMonth: number;
  daysLeftInMonth: number;
}

export const ShiftRecommendations: React.FC<ShiftRecommendationsProps> = ({
  monthlyIncome,
  monthlyTargetIncome,
  averagePerShift,
  shiftsWorkedThisMonth,
  daysLeftInMonth,
}) => {
  const shortfall = Math.max(0, monthlyTargetIncome - monthlyIncome);
  const shiftsNeeded = averagePerShift > 0 ? Math.ceil(shortfall / averagePerShift) : 0;
  const progress = monthlyTargetIncome > 0 ? (monthlyIncome / monthlyTargetIncome) * 100 : 0;
  
  const surplus = Math.max(0, monthlyIncome - monthlyTargetIncome);

  const getStatusIcon = () => {
    if (progress >= 100) return <CheckCircle className="h-5 w-5 text-green-600" />;
    if (progress >= 75) return <TrendingUp className="h-5 w-5 text-yellow-600" />;
    return <AlertCircle className="h-5 w-5 text-red-600" />;
  };

  const getStatusMessage = () => {
    if (progress >= 100) {
      return `Great job! You've hit your target with $${surplus.toFixed(0)} extra this month.`;
    }
    if (shiftsNeeded > 0 && daysLeftInMonth > 0) {
      return `You need ${shiftsNeeded} more shift${shiftsNeeded !== 1 ? 's' : ''} to reach your Monthly Target Income.`;
    }
    if (shiftsNeeded > 0 && daysLeftInMonth === 0) {
      return `You're $${shortfall.toFixed(2)} short of your target this month.`;
    }
    return "Set your budget to get personalized shift recommendations!";
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
            <span>Progress to Target</span>
            <span className="font-semibold">
              ${monthlyIncome.toFixed(0)} / ${monthlyTargetIncome.toFixed(0)}
            </span>
          </div>
          <Progress value={Math.min(progress, 100)} className="h-2" />
          <p className="text-xs text-muted-foreground text-right">
            Monthly Target Income (Expenses + Savings)
          </p>
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

        {shiftsNeeded > 0 && daysLeftInMonth > 0 && averagePerShift > 0 && (
          <div className="pt-4 border-t">
            <p className="text-sm font-medium mb-2">To Hit Your Target</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-primary">{shiftsNeeded}</span>
              <span className="text-muted-foreground">more shift{shiftsNeeded !== 1 ? 's' : ''}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Based on ${averagePerShift.toFixed(0)} avg per shift
            </p>
          </div>
        )}

        {surplus > 0 && (
          <div className="pt-4 border-t">
            <p className="text-sm font-medium mb-2">Surplus This Month</p>
            <p className="text-2xl font-bold text-green-600">
              +${surplus.toFixed(2)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Extra income above your target
            </p>
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