import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus, ChevronRight } from 'lucide-react';
import { format, getDaysInMonth, getDate } from 'date-fns';
import { Progress } from '@/components/ui/progress';

interface FinancialHealthScoreProps {
  monthlyIncome: number;
  monthlyExpenses: number;
  monthlySavings: number;
  savingsGoal: number;
  onClick?: () => void;
}

export const FinancialHealthScore: React.FC<FinancialHealthScoreProps> = ({
  monthlyIncome,
  monthlyExpenses,
  monthlySavings,
  savingsGoal,
  onClick,
}) => {
  const today = new Date();
  const dayOfMonth = getDate(today);
  const daysInMonth = getDaysInMonth(today);
  const monthProgress = dayOfMonth / daysInMonth;
  
  // Pro-rate expenses based on how far into the month we are (matches modal calculation)
  const proratedExpenses = monthlyExpenses * monthProgress;
  const proratedSavingsGoal = savingsGoal * monthProgress;

  // Calculate financial health score (0-100) - SAME logic as modal
  const calculateScore = () => {
    if (monthlyIncome === 0 && proratedExpenses === 0) return 50; // Neutral start
    if (monthlyIncome === 0) return 0;
    
    // Factor 1: Income vs Expenses ratio (40 points max)
    const incomeExpenseRatio = Math.min((monthlyIncome - proratedExpenses) / monthlyIncome * 100, 100);
    const incomeExpensePoints = Math.max(0, (incomeExpenseRatio / 100) * 40);
    
    // Factor 2: Savings rate (30 points max)
    const savingsRate = monthlyIncome > 0 ? (monthlySavings / monthlyIncome) * 100 : 0;
    const savingsPoints = Math.min(Math.max(0, (savingsRate / 20) * 30), 30);
    
    // Factor 3: Meeting savings goal (30 points max) - pro-rated
    const goalProgress = proratedSavingsGoal > 0 ? (monthlySavings / proratedSavingsGoal) * 100 : 100;
    const goalPoints = Math.min(Math.max(0, (goalProgress / 100) * 30), 30);
    
    return Math.round(incomeExpensePoints + savingsPoints + goalPoints);
  };

  const score = calculateScore();
  const netIncome = monthlyIncome - proratedExpenses;
  const currentMonth = format(new Date(), 'MMMM');
  
  const getScoreColor = () => {
    if (score >= 80) return 'text-emerald-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };
  
  const getScoreLabel = () => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Needs Improvement';
  };

  const getTrendIcon = () => {
    if (netIncome > proratedSavingsGoal) return <TrendingUp className="h-5 w-5 text-emerald-400" />;
    if (netIncome < 0) return <TrendingDown className="h-5 w-5 text-red-400" />;
    return <Minus className="h-5 w-5 text-yellow-400" />;
  };

  return (
    <Card 
      className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground cursor-pointer hover:shadow-lg transition-shadow"
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between">
          <span>{currentMonth} Health Score</span>
          <div className="flex items-center gap-2">
            {getTrendIcon()}
            <ChevronRight className="h-5 w-5 opacity-70" />
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <div className={`text-6xl font-bold ${getScoreColor()}`}>
            {score}
          </div>
          <p className="text-sm opacity-90 mt-1">{getScoreLabel()}</p>
          <div className="mt-3 mx-auto max-w-[200px]">
            <Progress value={score} className="h-2 bg-white/20" />
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-2 pt-4 border-t border-white/20">
          <div className="text-center">
            <p className="text-xs opacity-75">Income</p>
            <p className="font-semibold">${monthlyIncome.toFixed(0)}</p>
          </div>
          <div className="text-center">
            <p className="text-xs opacity-75">Expenses</p>
            <p className="font-semibold">${monthlyExpenses.toFixed(0)}</p>
          </div>
          <div className="text-center">
            <p className="text-xs opacity-75">Savings</p>
            <p className="font-semibold">${monthlySavings.toFixed(0)}</p>
          </div>
        </div>
        
        <p className="text-xs text-center opacity-60">Tap for details & learn what this score means</p>
      </CardContent>
    </Card>
  );
};
