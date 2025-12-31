import React, { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, Minus, Target, ShoppingBag, Save, Home, Zap, ShoppingCart, Car, CreditCard, MoreHorizontal, ChevronDown, ChevronUp, Pencil, X } from 'lucide-react';
import { format } from 'date-fns';
import { FinancialData } from '@/hooks/useGoals';

interface FinancialHealthScoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  monthlyIncome: number;
  monthlyExpenses: number;
  monthlySavings: number;
  savingsGoal: number;
  financialData: FinancialData;
  onUpdateFinancialData: (data: FinancialData) => Promise<void>;
}

interface ExpenseCategories {
  rent: number;
  utilities: number;
  groceries: number;
  transportation: number;
  subscriptions: number;
  other: number;
}

const expenseCategoryConfig = [
  { key: 'rent', label: 'Rent / Mortgage', icon: Home, placeholder: 'Monthly rent or mortgage' },
  { key: 'utilities', label: 'Utilities', icon: Zap, placeholder: 'Electric, water, internet, etc.' },
  { key: 'groceries', label: 'Groceries', icon: ShoppingCart, placeholder: 'Food and household items' },
  { key: 'transportation', label: 'Transportation', icon: Car, placeholder: 'Gas, transit, car payment' },
  { key: 'subscriptions', label: 'Subscriptions', icon: CreditCard, placeholder: 'Streaming, memberships, etc.' },
  { key: 'other', label: 'Other Fixed', icon: MoreHorizontal, placeholder: 'Insurance, loans, etc.' },
] as const;

export const FinancialHealthScoreModal: React.FC<FinancialHealthScoreModalProps> = ({
  isOpen,
  onClose,
  monthlyIncome,
  monthlyExpenses,
  monthlySavings,
  savingsGoal,
  financialData,
  onUpdateFinancialData,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [useDetailedMode, setUseDetailedMode] = useState(false);
  const [simpleExpenses, setSimpleExpenses] = useState(financialData.monthlyExpenses.toString());
  const [categories, setCategories] = useState<ExpenseCategories>({
    rent: 0,
    utilities: 0,
    groceries: 0,
    transportation: 0,
    subscriptions: 0,
    other: 0,
  });
  const [savingsGoalInput, setSavingsGoalInput] = useState(financialData.monthlySavingsGoal.toString());
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSimpleExpenses(financialData.monthlyExpenses.toString());
      setSavingsGoalInput(financialData.monthlySavingsGoal.toString());
      setIsEditing(false);
    }
  }, [isOpen, financialData]);

  const categoryTotal = useMemo(() => {
    return Object.values(categories).reduce((sum, val) => sum + val, 0);
  }, [categories]);

  const effectiveExpenses = useDetailedMode ? categoryTotal : (parseFloat(simpleExpenses) || 0);

  // Calculate financial health score (0-100)
  const calculateScore = () => {
    if (monthlyIncome === 0) return 0;
    
    const incomeExpenseRatio = Math.min((monthlyIncome - monthlyExpenses) / monthlyIncome * 100, 100);
    const incomeExpensePoints = (incomeExpenseRatio / 100) * 40;
    
    const savingsRate = (monthlySavings / monthlyIncome) * 100;
    const savingsPoints = Math.min((savingsRate / 20) * 30, 30);
    
    const goalProgress = savingsGoal > 0 ? (monthlySavings / savingsGoal) * 100 : 100;
    const goalPoints = Math.min((goalProgress / 100) * 30, 30);
    
    return Math.round(incomeExpensePoints + savingsPoints + goalPoints);
  };

  const score = calculateScore();
  const netIncome = monthlyIncome - monthlyExpenses;
  const currentMonth = format(new Date(), 'MMMM');
  
  const getScoreColor = () => {
    if (score >= 80) return 'text-emerald-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getScoreBgColor = () => {
    if (score >= 80) return 'bg-emerald-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };
  
  const getScoreLabel = () => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Needs Improvement';
  };

  const handleCategoryChange = (key: keyof ExpenseCategories, value: string) => {
    const numValue = parseFloat(value) || 0;
    setCategories(prev => ({ ...prev, [key]: numValue }));
    setUseDetailedMode(true);
  };

  const handleSimpleExpenseChange = (value: string) => {
    setSimpleExpenses(value);
    setUseDetailedMode(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onUpdateFinancialData({
        monthlyExpenses: effectiveExpenses,
        monthlySavingsGoal: parseFloat(savingsGoalInput) || 0,
        monthlySpendingLimit: 0,
      });
      setIsEditing(false);
    } finally {
      setIsSaving(false);
    }
  };

  const savingsProgress = savingsGoal > 0 ? Math.min((monthlySavings / savingsGoal) * 100, 100) : 0;
  const expenseRatio = monthlyIncome > 0 ? (monthlyExpenses / monthlyIncome) * 100 : 0;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto" hideCloseButton>
        <DialogHeader className="bg-gradient-to-r from-emerald-500 to-emerald-600 -m-6 mb-0 p-6 rounded-t-lg">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold text-white">
              {currentMonth} Financial Health
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-white hover:bg-white/20"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          {/* Score Display */}
          <div className="text-center py-6">
            <div className={`text-7xl font-bold ${getScoreColor()}`}>
              {score}
            </div>
            <p className="text-lg text-muted-foreground mt-2">{getScoreLabel()}</p>
            <div className="mt-4 mx-auto max-w-xs">
              <Progress value={score} className={`h-2 ${getScoreBgColor()}`} />
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 gap-3">
            <Card className="bg-muted/30">
              <CardContent className="p-4 text-center">
                <p className="text-xs text-muted-foreground mb-1">Monthly Income</p>
                <p className="text-xl font-bold text-emerald-500">${monthlyIncome.toFixed(0)}</p>
              </CardContent>
            </Card>
            <Card className="bg-muted/30">
              <CardContent className="p-4 text-center">
                <p className="text-xs text-muted-foreground mb-1">Monthly Expenses</p>
                <p className="text-xl font-bold text-red-500">${monthlyExpenses.toFixed(0)}</p>
              </CardContent>
            </Card>
            <Card className="bg-muted/30">
              <CardContent className="p-4 text-center">
                <p className="text-xs text-muted-foreground mb-1">Net Income</p>
                <p className={`text-xl font-bold ${netIncome >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                  ${netIncome.toFixed(0)}
                </p>
              </CardContent>
            </Card>
            <Card className="bg-muted/30">
              <CardContent className="p-4 text-center">
                <p className="text-xs text-muted-foreground mb-1">Current Savings</p>
                <p className="text-xl font-bold text-blue-500">${monthlySavings.toFixed(0)}</p>
              </CardContent>
            </Card>
          </div>

          {/* Savings Goal Progress */}
          {savingsGoal > 0 && (
            <Card className="bg-muted/30">
              <CardContent className="p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-muted-foreground">Savings Goal Progress</span>
                  <span className="text-sm font-medium">${monthlySavings.toFixed(0)} / ${savingsGoal.toFixed(0)}</span>
                </div>
                <Progress value={savingsProgress} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1">{savingsProgress.toFixed(0)}% of goal</p>
              </CardContent>
            </Card>
          )}

          {/* Score Breakdown */}
          <Card className="bg-muted/30">
            <CardContent className="p-4 space-y-3">
              <p className="text-sm font-medium text-muted-foreground">Score Breakdown</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Income vs Expenses</span>
                  <span className="font-medium">{Math.round((Math.min((monthlyIncome - monthlyExpenses) / monthlyIncome * 100, 100) / 100) * 40)}/40 pts</span>
                </div>
                <div className="flex justify-between">
                  <span>Savings Rate</span>
                  <span className="font-medium">{Math.round(Math.min(((monthlySavings / monthlyIncome) * 100 / 20) * 30, 30))}/30 pts</span>
                </div>
                <div className="flex justify-between">
                  <span>Savings Goal Progress</span>
                  <span className="font-medium">{Math.round(Math.min((savingsProgress / 100) * 30, 30))}/30 pts</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Edit Budget Button / Form */}
          {!isEditing ? (
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setIsEditing(true)}
            >
              <Pencil className="h-4 w-4 mr-2" />
              Edit Budget
            </Button>
          ) : (
            <Card className="border-primary/50">
              <CardContent className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <p className="font-medium">Edit Budget</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditing(false)}
                  >
                    Cancel
                  </Button>
                </div>

                {/* Main Expenses Field */}
                <div className="space-y-2">
                  <Label htmlFor="modal-expenses" className="flex items-center gap-2">
                    <ShoppingBag className="h-4 w-4" />
                    Monthly Expenses
                  </Label>
                  <div className="relative">
                    <Input
                      id="modal-expenses"
                      type="number"
                      step="0.01"
                      placeholder="Enter total monthly expenses"
                      value={useDetailedMode ? categoryTotal.toFixed(2) : simpleExpenses}
                      onChange={(e) => handleSimpleExpenseChange(e.target.value)}
                      className={useDetailedMode ? 'bg-muted/50' : ''}
                      readOnly={useDetailedMode}
                    />
                    {useDetailedMode && (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                        Auto-calculated
                      </span>
                    )}
                  </div>
                </div>

                {/* Collapsible Expense Categories */}
                <Collapsible open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
                  <CollapsibleTrigger asChild>
                    <Button 
                      variant="outline" 
                      className="w-full justify-between"
                      type="button"
                    >
                      <span className="flex items-center gap-2">
                        <MoreHorizontal className="h-4 w-4" />
                        Expense Details
                      </span>
                      {isDetailsOpen ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pt-4">
                    <div className="space-y-3 p-4 bg-muted/30 rounded-lg border border-border/50">
                      {expenseCategoryConfig.map(({ key, label, icon: Icon }) => (
                        <div key={key} className="grid grid-cols-[1fr_100px] gap-3 items-center">
                          <Label className="flex items-center gap-2 text-sm">
                            <Icon className="h-4 w-4 text-muted-foreground" />
                            {label}
                          </Label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="0"
                              value={categories[key] || ''}
                              onChange={(e) => handleCategoryChange(key, e.target.value)}
                              className="pl-7 h-9 text-right"
                            />
                          </div>
                        </div>
                      ))}
                      
                      <div className="pt-3 mt-3 border-t border-border/50">
                        <div className="grid grid-cols-[1fr_100px] gap-3 items-center">
                          <span className="font-medium text-sm">Total</span>
                          <div className="text-right font-bold text-primary">
                            ${categoryTotal.toFixed(2)}
                          </div>
                        </div>
                      </div>

                      {useDetailedMode && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full mt-2 text-muted-foreground"
                          onClick={() => {
                            setUseDetailedMode(false);
                            setCategories({
                              rent: 0,
                              utilities: 0,
                              groceries: 0,
                              transportation: 0,
                              subscriptions: 0,
                              other: 0,
                            });
                          }}
                        >
                          Clear categories & use simple total
                        </Button>
                      )}
                    </div>
                  </CollapsibleContent>
                </Collapsible>

                {/* Savings Goal */}
                <div className="space-y-2">
                  <Label htmlFor="modal-savingsGoal" className="flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Savings Goal
                  </Label>
                  <Input
                    id="modal-savingsGoal"
                    type="number"
                    step="0.01"
                    placeholder="How much to save per month"
                    value={savingsGoalInput}
                    onChange={(e) => setSavingsGoalInput(e.target.value)}
                  />
                </div>

                {/* Summary */}
                <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
                  <div className="text-sm text-muted-foreground mb-1">Monthly Target Income</div>
                  <div className="text-2xl font-bold text-primary">
                    ${(effectiveExpenses + (parseFloat(savingsGoalInput) || 0)).toFixed(2)}
                  </div>
                </div>

                <Button 
                  onClick={handleSave} 
                  disabled={isSaving}
                  className="w-full"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isSaving ? 'Saving...' : 'Save Budget'}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
