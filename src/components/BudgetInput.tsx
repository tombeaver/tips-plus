import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Wallet, Target, ShoppingBag, Save } from 'lucide-react';
import { useState, useEffect } from 'react';

interface FinancialData {
  monthlyExpenses: number;
  monthlySavingsGoal: number;
  monthlySpendingLimit: number;
}

interface BudgetInputProps {
  monthlyExpenses: number;
  monthlySavingsGoal: number;
  monthlySpendingLimit: number;
  onSave: (data: FinancialData) => Promise<void>;
}

export const BudgetInput: React.FC<BudgetInputProps> = ({
  monthlyExpenses,
  monthlySavingsGoal,
  monthlySpendingLimit,
  onSave,
}) => {
  const [expenses, setExpenses] = useState(monthlyExpenses.toString());
  const [savingsGoal, setSavingsGoal] = useState(monthlySavingsGoal.toString());
  const [spendingLimit, setSpendingLimit] = useState(monthlySpendingLimit.toString());
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setExpenses(monthlyExpenses.toString());
    setSavingsGoal(monthlySavingsGoal.toString());
    setSpendingLimit(monthlySpendingLimit.toString());
  }, [monthlyExpenses, monthlySavingsGoal, monthlySpendingLimit]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave({
        monthlyExpenses: parseFloat(expenses) || 0,
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
        <div className="space-y-2">
          <Label htmlFor="expenses" className="flex items-center gap-2">
            <ShoppingBag className="h-4 w-4" />
            Monthly Expenses
          </Label>
          <Input
            id="expenses"
            type="number"
            step="0.01"
            placeholder="Enter total monthly expenses"
            value={expenses}
            onChange={(e) => setExpenses(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Rent, utilities, groceries, insurance, etc.
          </p>
        </div>

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

        <div className="space-y-2">
          <Label htmlFor="spendingLimit" className="flex items-center gap-2">
            <ShoppingBag className="h-4 w-4" />
            Discretionary Spending Limit
          </Label>
          <Input
            id="spendingLimit"
            type="number"
            step="0.01"
            placeholder="Max leisure/fun spending"
            value={spendingLimit}
            onChange={(e) => setSpendingLimit(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Optional limit for entertainment, dining out, shopping
          </p>
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
