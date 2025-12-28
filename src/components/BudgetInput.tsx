import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Wallet, Target, ShoppingBag, Save, Home, Zap, ShoppingCart, Car, CreditCard, MoreHorizontal, ChevronDown, ChevronUp } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';

interface FinancialData {
  monthlyExpenses: number;
  monthlySavingsGoal: number;
  monthlySpendingLimit: number;
}

interface ExpenseCategories {
  rent: number;
  utilities: number;
  groceries: number;
  transportation: number;
  subscriptions: number;
  other: number;
}

interface BudgetInputProps {
  monthlyExpenses: number;
  monthlySavingsGoal: number;
  monthlySpendingLimit: number;
  onSave: (data: FinancialData) => Promise<void>;
}

const expenseCategoryConfig = [
  { key: 'rent', label: 'Rent / Mortgage', icon: Home, placeholder: 'Monthly rent or mortgage' },
  { key: 'utilities', label: 'Utilities', icon: Zap, placeholder: 'Electric, water, internet, etc.' },
  { key: 'groceries', label: 'Groceries', icon: ShoppingCart, placeholder: 'Food and household items' },
  { key: 'transportation', label: 'Transportation', icon: Car, placeholder: 'Gas, transit, car payment' },
  { key: 'subscriptions', label: 'Subscriptions', icon: CreditCard, placeholder: 'Streaming, memberships, etc.' },
  { key: 'other', label: 'Other Fixed', icon: MoreHorizontal, placeholder: 'Insurance, loans, etc.' },
] as const;

export const BudgetInput: React.FC<BudgetInputProps> = ({
  monthlyExpenses,
  monthlySavingsGoal,
  monthlySpendingLimit,
  onSave,
}) => {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [useDetailedMode, setUseDetailedMode] = useState(false);
  const [simpleExpenses, setSimpleExpenses] = useState(monthlyExpenses.toString());
  const [categories, setCategories] = useState<ExpenseCategories>({
    rent: 0,
    utilities: 0,
    groceries: 0,
    transportation: 0,
    subscriptions: 0,
    other: 0,
  });
  const [savingsGoal, setSavingsGoal] = useState(monthlySavingsGoal.toString());
  const [spendingLimit, setSpendingLimit] = useState(monthlySpendingLimit.toString());
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setSimpleExpenses(monthlyExpenses.toString());
    setSavingsGoal(monthlySavingsGoal.toString());
    setSpendingLimit(monthlySpendingLimit.toString());
  }, [monthlyExpenses, monthlySavingsGoal, monthlySpendingLimit]);

  const categoryTotal = useMemo(() => {
    return Object.values(categories).reduce((sum, val) => sum + val, 0);
  }, [categories]);

  const effectiveExpenses = useDetailedMode ? categoryTotal : (parseFloat(simpleExpenses) || 0);

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
      await onSave({
        monthlyExpenses: effectiveExpenses,
        monthlySavingsGoal: parseFloat(savingsGoal) || 0,
        monthlySpendingLimit: parseFloat(spendingLimit) || 0,
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5" />
          Monthly Budget
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Main Expenses Field */}
        <div className="space-y-2">
          <Label htmlFor="expenses" className="flex items-center gap-2">
            <ShoppingBag className="h-4 w-4" />
            Monthly Expenses
          </Label>
          <div className="relative">
            <Input
              id="expenses"
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
          <p className="text-xs text-muted-foreground">
            {useDetailedMode 
              ? 'Total from expense categories below' 
              : 'Enter a total, or expand details below for categories'}
          </p>
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
              {expenseCategoryConfig.map(({ key, label, icon: Icon, placeholder }) => (
                <div key={key} className="grid grid-cols-[1fr_120px] gap-3 items-center">
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
              
              {/* Category Total */}
              <div className="pt-3 mt-3 border-t border-border/50">
                <div className="grid grid-cols-[1fr_120px] gap-3 items-center">
                  <span className="font-medium text-sm">Total</span>
                  <div className="text-right font-bold text-primary">
                    ${categoryTotal.toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Reset to simple mode */}
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
          <Label htmlFor="savingsGoal" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Savings Goal
          </Label>
          <Input
            id="savingsGoal"
            type="number"
            step="0.01"
            placeholder="How much to save per month"
            value={savingsGoal}
            onChange={(e) => setSavingsGoal(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Target amount to save each month
          </p>
        </div>

        {/* Additional Spending */}
        <div className="space-y-2">
          <Label htmlFor="spendingLimit" className="flex items-center gap-2">
            <ShoppingBag className="h-4 w-4" />
            Discretionary Spending
          </Label>
          <Input
            id="spendingLimit"
            type="number"
            step="0.01"
            placeholder="Entertainment, dining out, etc."
            value={spendingLimit}
            onChange={(e) => setSpendingLimit(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Non-essential spending budget
          </p>
        </div>

        {/* Summary */}
        <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
          <div className="text-sm text-muted-foreground mb-1">Monthly Target Income</div>
          <div className="text-2xl font-bold text-primary">
            ${(effectiveExpenses + (parseFloat(savingsGoal) || 0) + (parseFloat(spendingLimit) || 0)).toFixed(2)}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Expenses + Savings + Discretionary
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
  );
};