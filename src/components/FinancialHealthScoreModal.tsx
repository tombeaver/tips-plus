import React, { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Progress } from '@/components/ui/progress';
import { Target, ShoppingBag, Save, Home, Zap, ShoppingCart, Car, CreditCard, MoreHorizontal, ChevronDown, ChevronUp, Pencil, X, TrendingUp, Trash2 } from 'lucide-react';
import { format, getDaysInMonth, getDate } from 'date-fns';
import { FinancialData } from '@/hooks/useGoals';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface FinancialHealthScoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  monthlyIncome: number;
  monthlyExpenses: number;
  monthlySavings: number;
  savingsGoal: number;
  financialData: FinancialData;
  onUpdateFinancialData: (data: FinancialData) => Promise<void>;
  // Cross-linking props
  hasGoalSet?: boolean;
  onNavigateToGoal?: () => void;
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
  hasGoalSet = false,
  onNavigateToGoal,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [useDetailedMode, setUseDetailedMode] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
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
      setShowDeleteConfirm(false);
    }
  }, [isOpen, financialData]);

  const categoryTotal = useMemo(() => {
    return Object.values(categories).reduce((sum, val) => sum + val, 0);
  }, [categories]);

  const effectiveExpenses = useDetailedMode ? categoryTotal : (parseFloat(simpleExpenses) || 0);

  // Calculate pro-rated expenses based on how far into the month we are
  const today = new Date();
  const dayOfMonth = getDate(today);
  const daysInMonth = getDaysInMonth(today);
  const monthProgress = dayOfMonth / daysInMonth;
  const proratedExpenses = monthlyExpenses * monthProgress;

  // Calculate financial health score (0-100) using pro-rated expenses
  const calculateScore = () => {
    if (monthlyIncome === 0 && proratedExpenses === 0) return 50; // Neutral start
    if (monthlyIncome === 0) return 0;
    
    // Compare income against pro-rated expenses for fair early-month comparison
    const incomeExpenseRatio = Math.min((monthlyIncome - proratedExpenses) / monthlyIncome * 100, 100);
    const incomeExpensePoints = Math.max(0, (incomeExpenseRatio / 100) * 40);
    
    const savingsRate = monthlyIncome > 0 ? (monthlySavings / monthlyIncome) * 100 : 0;
    const savingsPoints = Math.min(Math.max(0, (savingsRate / 20) * 30), 30);
    
    // Pro-rate savings goal progress too
    const proratedSavingsGoal = savingsGoal * monthProgress;
    const goalProgress = proratedSavingsGoal > 0 ? (monthlySavings / proratedSavingsGoal) * 100 : 100;
    const goalPoints = Math.min(Math.max(0, (goalProgress / 100) * 30), 30);
    
    return Math.round(incomeExpensePoints + savingsPoints + goalPoints);
  };

  const score = calculateScore();
  const netIncome = monthlyIncome - proratedExpenses;
  const currentMonth = format(new Date(), 'MMMM');
  
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

  const handleDelete = async () => {
    await onUpdateFinancialData({
      monthlyExpenses: 0,
      monthlySavingsGoal: 0,
      monthlySpendingLimit: 0,
    });
    onClose();
  };

  const proratedSavingsGoal = savingsGoal * monthProgress;
  const savingsProgress = proratedSavingsGoal > 0 ? Math.min((monthlySavings / proratedSavingsGoal) * 100, 100) : 0;

  // Score breakdown calculations (using pro-rated values)
  const incomeExpenseRatio = monthlyIncome > 0 ? Math.min((monthlyIncome - proratedExpenses) / monthlyIncome * 100, 100) : 0;
  const incomeExpensePoints = Math.round(Math.max(0, (incomeExpenseRatio / 100) * 40));
  const savingsRate = monthlyIncome > 0 ? (monthlySavings / monthlyIncome) * 100 : 0;
  const savingsPoints = Math.round(Math.min(Math.max(0, (savingsRate / 20) * 30), 30));
  const goalPoints = Math.round(Math.min(Math.max(0, (savingsProgress / 100) * 30), 30));

  // Chart data for income breakdown (show pro-rated expenses)
  const incomeBreakdownData = [
    { name: 'Income', value: monthlyIncome, fill: '#10B981' },
    { name: 'Expenses (pro-rated)', value: proratedExpenses, fill: '#EF4444' },
    { name: 'Savings', value: monthlySavings, fill: '#3B82F6' },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-screen h-screen max-w-none p-0 gap-0 border-0 flex flex-col" hideCloseButton>
        {/* Gradient Header */}
        <div className="sticky top-0 z-10 h-[130px] bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-600 px-6 pt-[50px] flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-white">
            {currentMonth} Financial Health
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 text-white"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto flex-1 bg-background">
          <div className="p-4 pb-[50px] space-y-4">
            {/* Main Score */}
            <div className="text-center py-2">
              <p className="text-5xl font-bold text-foreground">{score}</p>
              <p className="text-muted-foreground text-sm mt-1">{getScoreLabel()}</p>
              <div className="mt-4 mx-auto max-w-xs">
                <Progress value={score} className="h-2" />
              </div>
            </div>

            {/* Income Breakdown Chart */}
            <div className="bg-muted/30 rounded-lg p-4">
              <p className="text-sm font-medium mb-3 text-muted-foreground">Monthly Overview</p>
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={incomeBreakdownData}
                    layout="vertical"
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis type="number" fontSize={10} stroke="hsl(var(--muted-foreground))" tickFormatter={(v) => `$${v}`} />
                    <YAxis type="category" dataKey="name" fontSize={10} stroke="hsl(var(--muted-foreground))" width={70} />
                    <Tooltip 
                      formatter={(value) => [`$${Number(value).toFixed(2)}`, 'Amount']}
                      contentStyle={{
                        backgroundColor: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                      {incomeBreakdownData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
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
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">Score Breakdown</p>
                <span className="text-xs text-muted-foreground">Day {dayOfMonth} of {daysInMonth}</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center py-2 border-b border-border/50">
                  <span className="text-sm text-muted-foreground">Income vs Expenses</span>
                  <span className="font-medium">{incomeExpensePoints}/40 pts</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border/50">
                  <span className="text-sm text-muted-foreground">Savings Rate</span>
                  <span className="font-medium">{savingsPoints}/30 pts</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border/50">
                  <span className="text-sm text-muted-foreground">Savings Goal Progress</span>
                  <span className="font-medium">{goalPoints}/30 pts</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground pt-2">
                Expenses and savings goals are pro-rated based on how far into the month you are, so your score reflects a fair comparison at any point.
              </p>
            </div>

            {/* Goal Setup Prompt (if goal not set) */}
            {!hasGoalSet && (
              <Card className="border-purple-500/50 bg-purple-500/10">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <TrendingUp className="h-5 w-5 text-purple-500 mt-0.5 shrink-0" />
                    <div className="flex-1">
                      <p className="font-medium text-sm">Set Your Income Goal</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Set an annual income goal to see if your earnings can cover your budget and savings targets.
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-3"
                        onClick={() => {
                          onClose();
                          onNavigateToGoal?.();
                        }}
                      >
                        <Target className="h-4 w-4 mr-2" />
                        Set Income Goal
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Edit Budget Button / Form */}
            {!isEditing && !showDeleteConfirm ? (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    // Reset form values to current saved data before editing
                    setSimpleExpenses(financialData.monthlyExpenses.toString());
                    setSavingsGoalInput(financialData.monthlySavingsGoal.toString());
                    setUseDetailedMode(false);
                    setIsEditing(true);
                  }}
                >
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit Budget
                </Button>
                <Button
                  variant="outline"
                  className="text-destructive hover:bg-destructive/10"
                  onClick={() => setShowDeleteConfirm(true)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ) : showDeleteConfirm ? (
              <Card className="border-destructive/50">
                <CardContent className="p-4 space-y-3">
                  <p className="text-sm text-center">Are you sure you want to delete your budget?</p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => setShowDeleteConfirm(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="destructive"
                      className="flex-1"
                      onClick={handleDelete}
                    >
                      Delete Budget
                    </Button>
                  </div>
                </CardContent>
              </Card>
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
        </div>
      </DialogContent>
    </Dialog>
  );
};
