import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, ChevronRight, CheckCircle2 } from 'lucide-react';
import { differenceInDays, startOfYear } from 'date-fns';

interface AnnualGoalCardProps {
  yearlyGoal: number;
  yearlyAchieved: number;
  yearlyPercentage: number;
  weeklyTarget: number;
  weeklyEarned: number;
  monthlyTarget: number;
  monthlyEarned: number;
  onClick?: () => void;
}

export const AnnualGoalCard: React.FC<AnnualGoalCardProps> = ({
  yearlyGoal,
  yearlyAchieved,
  yearlyPercentage,
  weeklyTarget,
  weeklyEarned,
  monthlyTarget,
  monthlyEarned,
  onClick,
}) => {
  const now = new Date();
  const yearStart = startOfYear(now);
  const weeksInYear = 52;
  const weeksPassed = Math.floor(differenceInDays(now, yearStart) / 7);
  const weeksRemaining = Math.max(0, weeksInYear - weeksPassed);
  
  const isOnTrack = yearlyPercentage >= (weeksPassed / weeksInYear) * 100;
  const isComplete = yearlyPercentage >= 100;

  const weeklyProgress = weeklyTarget > 0 ? Math.min((weeklyEarned / weeklyTarget) * 100, 100) : 0;
  const monthlyProgress = monthlyTarget > 0 ? Math.min((monthlyEarned / monthlyTarget) * 100, 100) : 0;

  return (
    <Card 
      className="bg-gradient-to-br from-purple-500 to-purple-600 text-white cursor-pointer hover:shadow-lg transition-shadow"
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            <span className="text-lg">Annual Income Goal</span>
          </div>
          <div className="flex items-center gap-2">
            {isComplete ? (
              <CheckCircle2 className="h-5 w-5 text-green-300" />
            ) : isOnTrack ? (
              <span className="text-xs bg-green-500/30 px-2 py-0.5 rounded-full">On Track</span>
            ) : (
              <span className="text-xs bg-amber-500/30 px-2 py-0.5 rounded-full">Behind</span>
            )}
            <ChevronRight className="h-5 w-5 opacity-70" />
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress bar with amount */}
        <div className="space-y-2">
          <div className="flex justify-between items-end">
            <div>
              <p className="text-3xl font-bold">${yearlyAchieved.toLocaleString()}</p>
              <p className="text-sm text-white/70">of ${yearlyGoal.toLocaleString()}</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">{yearlyPercentage.toFixed(0)}%</p>
              <p className="text-xs text-white/70">{weeksRemaining} weeks left</p>
            </div>
          </div>
          <Progress value={yearlyPercentage} className="h-3 bg-white/20" />
        </div>
        
        {/* Weekly & Monthly breakdown */}
        <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/20">
          <div className="text-center">
            <p className="text-xs text-white/60 mb-1">This Week</p>
            <p className="font-semibold">${weeklyEarned.toFixed(0)}</p>
            <p className="text-xs text-white/60">of ${weeklyTarget.toFixed(0)}</p>
            <div className="mt-1.5 h-1 bg-white/20 rounded-full overflow-hidden">
              <div 
                className="h-full bg-green-300 rounded-full transition-all" 
                style={{ width: `${weeklyProgress}%` }}
              />
            </div>
          </div>
          <div className="text-center">
            <p className="text-xs text-white/60 mb-1">This Month</p>
            <p className="font-semibold">${monthlyEarned.toFixed(0)}</p>
            <p className="text-xs text-white/60">of ${monthlyTarget.toFixed(0)}</p>
            <div className="mt-1.5 h-1 bg-white/20 rounded-full overflow-hidden">
              <div 
                className="h-full bg-green-300 rounded-full transition-all" 
                style={{ width: `${monthlyProgress}%` }}
              />
            </div>
          </div>
        </div>
        
        <p className="text-xs text-center text-white/60">Tap for details</p>
      </CardContent>
    </Card>
  );
};
