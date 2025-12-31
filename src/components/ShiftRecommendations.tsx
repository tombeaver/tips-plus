import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Target, CheckCircle2, Calendar, Clock } from 'lucide-react';
import { format, addDays, startOfWeek } from 'date-fns';

interface ShiftRecommendationsProps {
  monthlyIncome: number;
  monthlyTargetIncome: number;
  averagePerShift: number;
  shiftsWorkedThisMonth: number;
  daysLeftInWeek: number;
  weeklyTarget: number;
  weeklyEarned: number;
}

export const ShiftRecommendations: React.FC<ShiftRecommendationsProps> = ({
  monthlyIncome,
  monthlyTargetIncome,
  averagePerShift,
  shiftsWorkedThisMonth,
  daysLeftInWeek,
  weeklyTarget,
  weeklyEarned,
}) => {
  // Weekly calculations
  const weeklyShortfall = Math.max(0, weeklyTarget - weeklyEarned);
  const weeklyShiftsNeeded = averagePerShift > 0 ? Math.ceil(weeklyShortfall / averagePerShift) : 0;
  const weeklyProgress = weeklyTarget > 0 ? Math.min((weeklyEarned / weeklyTarget) * 100, 100) : 0;
  const weeklySurplus = Math.max(0, weeklyEarned - weeklyTarget);
  const isWeeklyOnTrack = weeklyProgress >= 100;

  // Monthly calculations for context
  const monthlyProgress = monthlyTargetIncome > 0 ? Math.min((monthlyIncome / monthlyTargetIncome) * 100, 100) : 0;
  const monthlyShortfall = Math.max(0, monthlyTargetIncome - monthlyIncome);
  const monthlyShiftsNeeded = averagePerShift > 0 ? Math.ceil(monthlyShortfall / averagePerShift) : 0;

  // Generate remaining days of the week with names
  const now = new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: 0 });
  const remainingDays = Array.from({ length: daysLeftInWeek }, (_, i) => {
    const day = addDays(now, i);
    return {
      name: format(day, 'EEE'),
      isToday: i === 0,
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
        {/* Hero section - Weekly Focus */}
        <div className={`p-5 rounded-t-lg ${isWeeklyOnTrack ? 'bg-gradient-to-r from-emerald-500 to-emerald-600' : 'bg-gradient-to-r from-primary to-primary/80'}`}>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              {isWeeklyOnTrack ? (
                <>
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle2 className="h-5 w-5 text-white" />
                    <span className="text-white/80 text-sm font-medium">Weekly Target Hit!</span>
                  </div>
                  <p className="text-white text-2xl font-bold">+${weeklySurplus.toFixed(0)} ahead</p>
                  <p className="text-white/70 text-sm mt-1">You're on pace this week</p>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2 mb-1">
                    <Target className="h-5 w-5 text-white/80" />
                    <span className="text-white/80 text-sm font-medium">This Week</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-white text-4xl font-bold">{weeklyShiftsNeeded}</span>
                    <span className="text-white/80 text-lg">shift{weeklyShiftsNeeded !== 1 ? 's' : ''} to go</span>
                  </div>
                  <p className="text-white/70 text-sm mt-1">
                    ${weeklyShortfall.toFixed(0)} needed to stay on pace
                  </p>
                </>
              )}
            </div>
            
            {/* Circular progress - Weekly */}
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
                  strokeDasharray={`${weeklyProgress * 1.76} 176`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-white text-sm font-bold">{Math.round(weeklyProgress)}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Days remaining visualization */}
        {!isWeeklyOnTrack && daysLeftInWeek > 0 && (
          <div className="p-4 border-b">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {daysLeftInWeek} day{daysLeftInWeek !== 1 ? 's'  : ''} left to work
              </span>
            </div>
            
            {/* Show remaining days */}
            <div className="flex gap-2">
              {remainingDays.map((day, i) => (
                <div
                  key={i}
                  className={`flex-1 py-2 rounded text-center ${
                    day.isToday 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted/50'
                  }`}
                >
                  <span className={`text-xs font-medium ${day.isToday ? '' : 'text-muted-foreground'}`}>
                    {day.name}
                  </span>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              ~${averagePerShift.toFixed(0)} per shift average
            </p>
          </div>
        )}

        {/* Weekly & Monthly Progress */}
        <div className="p-4 space-y-4">
          {/* Weekly Progress */}
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Weekly Progress
              </span>
              <span className="font-medium">${weeklyEarned.toFixed(0)} / ${weeklyTarget.toFixed(0)}</span>
            </div>
            <Progress value={weeklyProgress} className="h-2" />
          </div>

          {/* Monthly Progress - Secondary */}
          <div className="pt-3 border-t">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">Monthly Progress</span>
              <span className="font-medium">${monthlyIncome.toFixed(0)} / ${monthlyTargetIncome.toFixed(0)}</span>
            </div>
            <Progress value={monthlyProgress} className="h-1.5" />
            {!isWeeklyOnTrack && monthlyShiftsNeeded > 0 && (
              <p className="text-xs text-muted-foreground mt-2">
                {monthlyShiftsNeeded} shift{monthlyShiftsNeeded !== 1 ? 's' : ''} needed this month to hit ${monthlyTargetIncome.toFixed(0)}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
