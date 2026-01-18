import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Target, TrendingUp, CheckCircle2, Clock } from 'lucide-react';

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
  const progress = monthlyTargetIncome > 0 ? Math.min((monthlyIncome / monthlyTargetIncome) * 100, 100) : 0;
  const surplus = Math.max(0, monthlyIncome - monthlyTargetIncome);
  const isOnTrack = progress >= 100;

  // Calculate pace metrics
  const shiftsPerDayNeeded = daysLeftInMonth > 0 ? shiftsNeeded / daysLeftInMonth : 0;
  const paceDescription = shiftsPerDayNeeded <= 0.5 ? 'relaxed' : shiftsPerDayNeeded <= 1 ? 'steady' : 'aggressive';

  // Generate timeline markers (show days left in month, capped at 14 for visual)
  const totalDaysInTimeline = Math.min(daysLeftInMonth, 14);
  const shiftsSpreadAcrossDays = Array.from({ length: totalDaysInTimeline }, (_, i) => {
    const dayIndex = i + 1;
    const cumulativeShiftsNeeded = Math.ceil((dayIndex / totalDaysInTimeline) * shiftsNeeded);
    return {
      day: dayIndex,
      shiftsNeeded: cumulativeShiftsNeeded,
      isShiftDay: shiftsNeeded > 0 && dayIndex <= shiftsNeeded,
    };
  });

  if (monthlyTargetIncome === 0) {
    return (
      <Card className="bg-muted/30 border-dashed">
        <CardContent className="p-6 text-center">
          <Target className="h-8 w-8 mx-auto mb-3 text-muted-foreground" />
          <p className="text-muted-foreground">Set your budget to see shift recommendations</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        {/* Hero section with main message */}
        <div className={`p-5 rounded-t-lg ${isOnTrack ? 'bg-gradient-to-r from-emerald-500 to-emerald-600' : 'bg-gradient-to-r from-primary to-primary/80'}`}>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              {isOnTrack ? (
                <>
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle2 className="h-5 w-5 text-white" />
                    <span className="text-white/80 text-sm font-medium">Target Reached!</span>
                  </div>
                  <p className="text-white text-2xl font-bold">+${surplus.toFixed(0)} surplus</p>
                  <p className="text-white/70 text-sm mt-1">Extra income this month</p>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2 mb-1">
                    <Target className="h-5 w-5 text-white/80" />
                    <span className="text-white/80 text-sm font-medium">To Hit Your Target</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-white text-4xl font-bold">{shiftsNeeded}</span>
                    <span className="text-white/80 text-lg">shift{shiftsNeeded !== 1 ? 's' : ''}</span>
                  </div>
                  <p className="text-white/70 text-sm mt-1">
                    {daysLeftInMonth} day{daysLeftInMonth !== 1 ? 's' : ''} left • ${averagePerShift.toFixed(0)}/shift avg
                  </p>
                </>
              )}
            </div>
            
            {/* Circular progress */}
            <div className="relative w-16 h-16">
              <svg className="w-16 h-16 -rotate-90">
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  stroke="rgba(255,255,255,0.2)"
                  strokeWidth="6"
                  fill="none"
                />
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  stroke="white"
                  strokeWidth="6"
                  fill="none"
                  strokeDasharray={`${progress * 1.76} 176`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-white text-sm font-bold">{Math.round(progress)}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Shift Pace */}
        {!isOnTrack && daysLeftInMonth > 0 && shiftsNeeded > 0 && (
          <div className="px-4 py-3 border-b">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">
                Shift Pace: <span className="capitalize text-foreground">{paceDescription}</span>
              </span>
            </div>
          </div>
        )}

        {/* Progress breakdown */}
        <div className="p-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted-foreground">Monthly Progress</span>
            <span className="font-medium">${monthlyIncome.toFixed(0)} / ${monthlyTargetIncome.toFixed(0)}</span>
          </div>
          <Progress value={progress} className="h-2" />
          
          <div className="flex justify-between mt-4 pt-4 border-t">
            <div className="text-center">
              <p className="text-2xl font-bold">{shiftsWorkedThisMonth}</p>
              <p className="text-xs text-muted-foreground">Shifts worked</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{daysLeftInMonth}</p>
              <p className="text-xs text-muted-foreground">Days left</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">${averagePerShift.toFixed(0)}</p>
              <p className="text-xs text-muted-foreground">Per shift avg</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
