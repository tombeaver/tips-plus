import { Card, CardContent } from '@/components/ui/card';
import { Target, CheckCircle2, Clock, Calendar } from 'lucide-react';

interface GoalShiftStrategyProps {
  weeklyTarget: number;
  weeklyEarned: number;
  monthlyTarget: number;
  monthlyEarned: number;
  averagePerShift: number;
}

export const GoalShiftStrategy: React.FC<GoalShiftStrategyProps> = ({
  weeklyTarget,
  weeklyEarned,
  monthlyTarget,
  monthlyEarned,
  averagePerShift,
}) => {
  const weeklyNeeded = Math.max(0, weeklyTarget - weeklyEarned);
  const monthlyNeeded = Math.max(0, monthlyTarget - monthlyEarned);
  
  const shiftsNeededWeekly = averagePerShift > 0 ? Math.ceil(weeklyNeeded / averagePerShift) : 0;
  const shiftsNeededMonthly = averagePerShift > 0 ? Math.ceil(monthlyNeeded / averagePerShift) : 0;

  const weeklyComplete = weeklyNeeded === 0;
  const monthlyComplete = monthlyNeeded === 0;

  if (averagePerShift === 0) {
    return (
      <Card className="bg-muted/30 border-dashed">
        <CardContent className="p-6 text-center">
          <Target className="h-8 w-8 mx-auto mb-3 text-muted-foreground" />
          <p className="text-muted-foreground text-sm">Log more shifts to see personalized recommendations</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        {/* Header */}
        <div className="p-4 border-b">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-muted-foreground" />
            <span className="font-medium">Shift Strategy</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Based on ${averagePerShift.toFixed(0)} average per shift
          </p>
        </div>

        {/* Strategy items */}
        <div className="divide-y">
          {/* Weekly */}
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full ${weeklyComplete ? 'bg-emerald-500/10' : 'bg-primary/10'}`}>
                {weeklyComplete ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                ) : (
                  <Clock className="h-5 w-5 text-primary" />
                )}
              </div>
              <div>
                <p className="font-medium text-sm">This Week</p>
                <p className="text-xs text-muted-foreground">
                  {weeklyComplete 
                    ? 'Target reached!' 
                    : `$${weeklyNeeded.toFixed(0)} remaining`
                  }
                </p>
              </div>
            </div>
            {!weeklyComplete && (
              <div className="text-right">
                <p className="text-2xl font-bold text-primary">{shiftsNeededWeekly}</p>
                <p className="text-xs text-muted-foreground">shift{shiftsNeededWeekly !== 1 ? 's' : ''}</p>
              </div>
            )}
          </div>

          {/* Monthly */}
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full ${monthlyComplete ? 'bg-emerald-500/10' : 'bg-primary/10'}`}>
                {monthlyComplete ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                ) : (
                  <Calendar className="h-5 w-5 text-primary" />
                )}
              </div>
              <div>
                <p className="font-medium text-sm">This Month</p>
                <p className="text-xs text-muted-foreground">
                  {monthlyComplete 
                    ? 'Target reached!' 
                    : `$${monthlyNeeded.toFixed(0)} remaining`
                  }
                </p>
              </div>
            </div>
            {!monthlyComplete && (
              <div className="text-right">
                <p className="text-2xl font-bold text-primary">{shiftsNeededMonthly}</p>
                <p className="text-xs text-muted-foreground">shift{shiftsNeededMonthly !== 1 ? 's' : ''}</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
