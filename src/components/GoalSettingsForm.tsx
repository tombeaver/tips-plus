import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Target } from 'lucide-react';
import { Goal } from '@/hooks/useGoals';

interface GoalSettingsFormProps {
  editingGoal?: Goal | null;
  onSubmit: (goal: Omit<Goal, 'id'>) => Promise<void>;
  onCancel: () => void;
  existingGoalTypes: string[];
}

export const GoalSettingsForm: React.FC<GoalSettingsFormProps> = ({
  editingGoal,
  onSubmit,
  onCancel,
  existingGoalTypes
}) => {
  const [goalType, setGoalType] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('daily');
  const [goalAmount, setGoalAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ amount?: string; type?: string }>({});

  useEffect(() => {
    if (editingGoal) {
      setGoalType(editingGoal.type);
      setGoalAmount(editingGoal.amount.toString());
    } else {
      setGoalType('daily');
      setGoalAmount('');
    }
    setErrors({});
  }, [editingGoal]);

  const validateForm = () => {
    const newErrors: { amount?: string; type?: string } = {};
    
    if (!goalAmount || parseFloat(goalAmount) <= 0) {
      newErrors.amount = 'Please enter a valid amount greater than 0';
    }
    
    if (!editingGoal && existingGoalTypes.includes(goalType)) {
      newErrors.type = 'A goal for this period already exists. Please edit the existing goal.';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    try {
      const currentPeriod = new Date().toISOString().slice(0, 7); // YYYY-MM format
      await onSubmit({
        type: goalType,
        amount: parseFloat(goalAmount),
        period: currentPeriod
      });
      
      // Reset form
      setGoalAmount('');
      setGoalType('daily');
      setErrors({});
    } catch (error) {
      console.error('Error submitting goal:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setGoalAmount('');
    setGoalType('daily');
    setErrors({});
    onCancel();
  };

  return (
    <Card className="border-2 border-primary/20">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Target className="h-5 w-5" />
          {editingGoal ? 'Edit Goal' : 'Set New Goal'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="goalType">Goal Period</Label>
            <Select 
              value={goalType} 
              onValueChange={(value: any) => {
                setGoalType(value);
                setErrors(prev => ({ ...prev, type: undefined }));
              }}
              disabled={!!editingGoal}
            >
              <SelectTrigger id="goalType">
                <SelectValue placeholder="Select goal period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily Goal</SelectItem>
                <SelectItem value="weekly">Weekly Goal</SelectItem>
                <SelectItem value="monthly">Monthly Goal</SelectItem>
                <SelectItem value="yearly">Yearly Goal</SelectItem>
              </SelectContent>
            </Select>
            {errors.type && (
              <p className="text-sm text-destructive">{errors.type}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="goalAmount">Target Amount</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">$</span>
              <Input
                id="goalAmount"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                value={goalAmount}
                onChange={(e) => {
                  setGoalAmount(e.target.value);
                  setErrors(prev => ({ ...prev, amount: undefined }));
                }}
                className="pl-8"
                required
              />
            </div>
            {errors.amount && (
              <p className="text-sm text-destructive">{errors.amount}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Enter your target earnings for this {goalType} period
            </p>
          </div>
          
          <div className="flex gap-3 pt-2">
            <Button 
              type="submit" 
              className="flex-1"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                'Saving...'
              ) : (
                <>
                  {editingGoal ? 'Update Goal' : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Set Goal
                    </>
                  )}
                </>
              )}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};