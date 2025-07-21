
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Plus, Target, TrendingUp, Calendar, Edit, Trash2 } from 'lucide-react';
import { Goal } from '@/hooks/useGoals';
import { TipEntry } from '@/hooks/useTipEntries';
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, isWithinInterval, addDays } from 'date-fns';

interface GoalSettingsProps {
  goals: Goal[];
  onAddGoal: (goal: Omit<Goal, 'id'>) => void;
  onUpdateGoal: (goalId: string, goal: Omit<Goal, 'id'>) => void;
  onDeleteGoal: (goalId: string) => void;
  tipEntries: TipEntry[];
}

export const GoalSettings: React.FC<GoalSettingsProps> = ({ goals, onAddGoal, onUpdateGoal, onDeleteGoal, tipEntries }) => {
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [newGoalType, setNewGoalType] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('daily');
  const [newGoalAmount, setNewGoalAmount] = useState('');

  // Get one goal for each time period
  const goalsByType = useMemo(() => {
    const types: ('daily' | 'weekly' | 'monthly' | 'yearly')[] = ['daily', 'weekly', 'monthly', 'yearly'];
    return types.map(type => ({
      type,
      goal: goals.find(g => g.type === type)
    }));
  }, [goals]);

  const realEntries = tipEntries.filter(entry => !entry.isPlaceholder);

  const goalProgress = useMemo(() => {
    const now = new Date();
    
    return goals.map(goal => {
      let period: { start: Date; end: Date };
      let achieved = 0;
      
      switch (goal.type) {
        case 'daily':
          // Get today's earnings
          const todayEntries = realEntries.filter(entry => 
            entry.date.toDateString() === now.toDateString()
          );
          achieved = todayEntries.reduce((sum, entry) => sum + entry.creditTips + entry.cashTips, 0);
          period = { start: now, end: now };
          break;
          
        case 'weekly':
          period = { start: startOfWeek(now), end: endOfWeek(now) };
          achieved = realEntries
            .filter(entry => isWithinInterval(entry.date, period))
            .reduce((sum, entry) => sum + entry.creditTips + entry.cashTips, 0);
          break;
          
        case 'monthly':
          period = { start: startOfMonth(now), end: endOfMonth(now) };
          achieved = realEntries
            .filter(entry => isWithinInterval(entry.date, period))
            .reduce((sum, entry) => sum + entry.creditTips + entry.cashTips, 0);
          break;
          
        case 'yearly':
          period = { start: startOfYear(now), end: endOfYear(now) };
          achieved = realEntries
            .filter(entry => isWithinInterval(entry.date, period))
            .reduce((sum, entry) => sum + entry.creditTips + entry.cashTips, 0);
          break;
      }
      
      const percentage = goal.amount > 0 ? Math.min((achieved / goal.amount) * 100, 100) : 0;
      
      return {
        ...goal,
        achieved,
        percentage,
        period
      };
    });
  }, [goals, realEntries]);

  const handleSubmitGoal = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newGoalAmount) return;
    
    const currentPeriod = new Date().toISOString().slice(0, 7); // YYYY-MM format
    const goalData = {
      type: newGoalType,
      amount: parseFloat(newGoalAmount),
      period: currentPeriod
    };
    
    if (editingGoal) {
      onUpdateGoal(editingGoal.id, goalData);
    } else {
      onAddGoal(goalData);
    }
    
    setNewGoalAmount('');
    setEditingGoal(null);
  };

  const startEditing = (goal: Goal) => {
    setEditingGoal(goal);
    setNewGoalType(goal.type);
    setNewGoalAmount(goal.amount.toString());
  };

  const cancelEditing = () => {
    setEditingGoal(null);
    setNewGoalAmount('');
    setNewGoalType('daily');
  };

  const projectedEarnings = useMemo(() => {
    const now = new Date();
    const allEntries = [...realEntries, ...tipEntries.filter(entry => entry.isPlaceholder)];
    
    // Calculate average daily earnings from real entries
    const averageDaily = realEntries.length > 0 ? 
      realEntries.reduce((sum, entry) => sum + entry.creditTips + entry.cashTips, 0) / realEntries.length : 
      0;
    
    // Project weekly earnings including placeholders
    const weekStart = startOfWeek(now);
    const weekEnd = endOfWeek(now);
    const weekEntries = allEntries.filter(entry => isWithinInterval(entry.date, { start: weekStart, end: weekEnd }));
    const weekTotal = weekEntries.reduce((sum, entry) => sum + entry.creditTips + entry.cashTips, 0);
    
    // Project monthly earnings
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);
    const monthEntries = allEntries.filter(entry => isWithinInterval(entry.date, { start: monthStart, end: monthEnd }));
    const monthTotal = monthEntries.reduce((sum, entry) => sum + entry.creditTips + entry.cashTips, 0);
    
    return {
      averageDaily,
      weekTotal,
      monthTotal
    };
  }, [realEntries, tipEntries]);

  return (
    <div className="space-y-4">
      {/* Goals Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Your Goals
          </CardTitle>
          <CardDescription>Set and track your earning goals for each time period</CardDescription>
        </CardHeader>
        <CardContent>
          {editingGoal && (
            <form onSubmit={handleSubmitGoal} className="space-y-4 mb-6 p-4 border rounded-lg bg-muted/50">
              <div className="space-y-2">
                <Label>Goal Type</Label>
                <Select value={newGoalType} onValueChange={(value: any) => setNewGoalType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Target Amount ($)</Label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="Enter goal amount"
                  value={newGoalAmount}
                  onChange={(e) => setNewGoalAmount(e.target.value)}
                  required
                />
              </div>
              
              <div className="flex gap-2">
                <Button type="submit" className="flex-1">
                  {editingGoal ? 'Update Goal' : 'Add Goal'}
                </Button>
                <Button type="button" variant="outline" onClick={cancelEditing}>
                  Cancel
                </Button>
              </div>
            </form>
          )}

          <div className="space-y-3">
            {goalsByType.map(({ type, goal }) => {
              const progress = goalProgress.find(p => p.type === type);
              
              return (
                <div key={type} className="p-4 border rounded-lg">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-medium capitalize">{type} Goal</h4>
                      {goal ? (
                        <p className="text-sm text-muted-foreground">
                          Target: ${goal.amount.toFixed(2)}
                        </p>
                      ) : (
                        <p className="text-sm text-muted-foreground">No goal set</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {goal ? (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => startEditing(goal)}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onDeleteGoal(goal.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => {
                            setNewGoalType(type);
                            setEditingGoal({ id: '', type, amount: 0, period: '' } as Goal);
                          }}
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Set Goal
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  {progress && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>${progress.achieved.toFixed(2)} / ${progress.amount.toFixed(2)}</span>
                      </div>
                      <Progress value={progress.percentage} className="h-2" />
                      <div className="text-sm text-muted-foreground">
                        {progress.percentage.toFixed(1)}% complete
                        {progress.percentage >= 100 && (
                          <span className="text-green-600 font-medium ml-2">🎉 Goal achieved!</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Projections */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Earnings Projections
          </CardTitle>
          <CardDescription>Based on your current performance and planned shifts</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-600">Daily Average</p>
              <p className="text-xl font-bold text-blue-700">
                ${projectedEarnings.averageDaily.toFixed(2)}
              </p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <p className="text-sm text-green-600">This Week</p>
              <p className="text-xl font-bold text-green-700">
                ${projectedEarnings.weekTotal.toFixed(2)}
              </p>
            </div>
          </div>
          
          <div className="p-3 bg-purple-50 rounded-lg">
            <p className="text-sm text-purple-600">This Month (Projected)</p>
            <p className="text-xl font-bold text-purple-700">
              ${projectedEarnings.monthTotal.toFixed(2)}
            </p>
          </div>
          
          {tipEntries.some(entry => entry.isPlaceholder) && (
            <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="h-4 w-4 text-orange-600" />
                <p className="text-sm text-orange-600 font-medium">Planning Scenarios Included</p>
              </div>
              <p className="text-xs text-orange-700">
                Projections include your planned shifts as placeholders
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Goal Setting Tips</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-gray-600">
          <p>• Set realistic daily goals based on your average earnings</p>
          <p>• Use weekly goals to plan for busier periods</p>
          <p>• Monthly goals help with budgeting and financial planning</p>
          <p>• Add planning scenarios to project future earnings</p>
        </CardContent>
      </Card>
    </div>
  );
};
