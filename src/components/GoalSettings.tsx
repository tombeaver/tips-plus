
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Plus, Target, TrendingUp, Calendar } from 'lucide-react';
import { Goal, TipEntry } from '@/pages/Index';
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, isWithinInterval, addDays } from 'date-fns';

interface GoalSettingsProps {
  goals: Goal[];
  onAddGoal: (goal: Omit<Goal, 'id'>) => void;
  tipEntries: TipEntry[];
}

export const GoalSettings: React.FC<GoalSettingsProps> = ({ goals, onAddGoal, tipEntries }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newGoalType, setNewGoalType] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('daily');
  const [newGoalAmount, setNewGoalAmount] = useState('');

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

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newGoalAmount) return;
    
    const currentPeriod = new Date().toISOString().slice(0, 7); // YYYY-MM format
    
    onAddGoal({
      type: newGoalType,
      amount: parseFloat(newGoalAmount),
      period: currentPeriod
    });
    
    setNewGoalAmount('');
    setShowAddForm(false);
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
      {/* Add Goal Button */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Target className="h-5 w-5" />
            Your Goals
          </CardTitle>
          <CardDescription>Set and track your earning goals</CardDescription>
        </CardHeader>
        <CardContent>
          {!showAddForm ? (
            <Button onClick={() => setShowAddForm(true)} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Add New Goal
            </Button>
          ) : (
            <form onSubmit={handleAddGoal} className="space-y-4">
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
                <Button type="submit" className="flex-1">Add Goal</Button>
                <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>

      {/* Current Goals */}
      {goalProgress.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Goal Progress</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {goalProgress.map((goal) => (
              <div key={goal.id} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium capitalize">{goal.type} Goal</span>
                  <span className="text-sm text-gray-600">
                    ${goal.achieved.toFixed(2)} / ${goal.amount.toFixed(2)}
                  </span>
                </div>
                <Progress value={goal.percentage} className="h-2" />
                <div className="text-sm text-gray-600">
                  {goal.percentage.toFixed(1)}% complete
                  {goal.percentage >= 100 && (
                    <span className="text-green-600 font-medium ml-2">🎉 Goal achieved!</span>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

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
