import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, ChevronRight, CheckCircle2 } from 'lucide-react';
import { differenceInDays, startOfYear } from 'date-fns';

interface AnnualGoalCardProps {
  yearlyGoal: number;
  yearlyAchieved: number;
  yearlyPercentage: number;
  onClick?: () => void;
}

export const AnnualGoalCard: React.FC<AnnualGoalCardProps> = ({
  yearlyGoal,
  yearlyAchieved,
  yearlyPercentage,
  onClick,
}) => {
  const now = new Date();
  const yearStart = startOfYear(now);
  const weeksInYear = 52;
  const weeksPassed = Math.floor(differenceInDays(now, yearStart) / 7);
  const weeksRemaining = Math.max(0, weeksInYear - weeksPassed);
  
  const isOnTrack = yearlyPercentage >= (weeksPassed / weeksInYear) * 100;
  const isComplete = yearlyPercentage >= 100;

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
      <CardContent className="space-y-3">
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
        
        <p className="text-xs text-center text-white/60">Tap for details & breakdown</p>
      </CardContent>
    </Card>
  );
};
