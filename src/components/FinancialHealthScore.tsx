import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface FinancialHealthScoreProps {
  monthlyIncome: number;
  monthlyExpenses: number;
  monthlySavings: number;
  savingsGoal: number;
}

export const FinancialHealthScore: React.FC<FinancialHealthScoreProps> = ({
  monthlyIncome,
  monthlyExpenses,
  monthlySavings,
  savingsGoal,
}) => {
  // Calculate financial health score (0-100)
  const calculateScore = () => {
    if (monthlyIncome === 0) return 0;
    
    // Factors:
    // 1. Income vs Expenses ratio (40 points max)
    const incomeExpenseRatio = Math.min((monthlyIncome - monthlyExpenses) / monthlyIncome * 100, 100);
    const incomeExpensePoints = (incomeExpenseRatio / 100) * 40;
    
    // 2. Savings rate (30 points max)
    const savingsRate = (monthlySavings / monthlyIncome) * 100;
    const savingsPoints = Math.min((savingsRate / 20) * 30, 30); // 20% savings = full points
    
    // 3. Meeting savings goal (30 points max)
    const goalProgress = savingsGoal > 0 ? (monthlySavings / savingsGoal) * 100 : 100;
    const goalPoints = Math.min((goalProgress / 100) * 30, 30);
    
    return Math.round(incomeExpensePoints + savingsPoints + goalPoints);
  };

  const score = calculateScore();
  const netIncome = monthlyIncome - monthlyExpenses;
  
  const getScoreColor = () => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };
  
  const getScoreLabel = () => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Needs Improvement';
  };

  const getTrendIcon = () => {
    if (netIncome > savingsGoal) return <TrendingUp className="h-5 w-5 text-green-600" />;
    if (netIncome < 0) return <TrendingDown className="h-5 w-5 text-red-600" />;
    return <Minus className="h-5 w-5 text-yellow-600" />;
  };

  return (
    <Card className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Financial Health Score</span>
          {getTrendIcon()}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <div className={`text-6xl font-bold ${getScoreColor()}`}>
            {score}
          </div>
          <p className="text-sm opacity-90 mt-2">{getScoreLabel()}</p>
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
      </CardContent>
    </Card>
  );
};
