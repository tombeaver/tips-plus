
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Target, TrendingUp, Calendar, Edit, Trash2, Plus } from 'lucide-react';
import { Goal } from '@/hooks/useGoals';
import { TipEntry } from '@/hooks/useTipEntries';
import { GoalSettingsForm } from '@/components/GoalSettingsForm';
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, isWithinInterval } from 'date-fns';

interface GoalSettingsProps {
  goals: Goal[];
  onAddGoal: (goal: Omit<Goal, 'id'>) => Promise<void>;
  onUpdateGoal: (goalId: string, goal: Omit<Goal, 'id'>) => Promise<void>;
  onDeleteGoal: (goalId: string) => Promise<void>;
  tipEntries: TipEntry[];
}

export const GoalSettings: React.FC<GoalSettingsProps> = ({ goals, onAddGoal, onUpdateGoal, onDeleteGoal, tipEntries }) => {
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [showForm, setShowForm] = useState(false);

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

  const handleSubmitGoal = async (goalData: Omit<Goal, 'id'>) => {
    if (editingGoal) {
      await onUpdateGoal(editingGoal.id, goalData);
    } else {
      await onAddGoal(goalData);
    }
    
    setEditingGoal(null);
    setShowForm(false);
  };

  const startEditing = (goalWithProgress: typeof goalProgress[0]) => {
    // Extract the actual Goal object from progress data
    const originalGoal = goals.find(g => g.id === goalWithProgress.id);
    if (originalGoal) {
      setEditingGoal(originalGoal);
      setShowForm(true);
    }
  };

  const startCreating = (type: 'daily' | 'weekly' | 'monthly' | 'yearly') => {
    setEditingGoal(null);
    setShowForm(true);
  };

  const cancelForm = () => {
    setEditingGoal(null);
    setShowForm(false);
  };

  const existingGoalTypes = goals.map(goal => goal.type);
  const availableGoalTypes = (['daily', 'weekly', 'monthly', 'yearly'] as const)
    .filter(type => !existingGoalTypes.includes(type));
  const allGoalTypesSet = availableGoalTypes.length === 0;

  const projectedEarnings = useMemo(() => {
    const now = new Date();
    const allEntries = [...realEntries, ...tipEntries.filter(entry => entry.isPlaceholder)];
    
    // Calculate total earnings (tips + wages)
    const calculateTotalEarnings = (entry: TipEntry) => {
      const tips = entry.creditTips + entry.cashTips;
      const wages = entry.hoursWorked * entry.hourlyRate;
      return tips + wages;
    };
    
    // Calculate average daily earnings from real entries
    const averageDaily = realEntries.length > 0 ? 
      realEntries.reduce((sum, entry) => sum + calculateTotalEarnings(entry), 0) / realEntries.length : 
      0;
    
    // Project weekly earnings including placeholders
    const weekStart = startOfWeek(now);
    const weekEnd = endOfWeek(now);
    const weekEntries = allEntries.filter(entry => isWithinInterval(entry.date, { start: weekStart, end: weekEnd }));
    const weekTotal = weekEntries.reduce((sum, entry) => sum + calculateTotalEarnings(entry), 0);
    
    // Project monthly earnings
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);
    const monthEntries = allEntries.filter(entry => isWithinInterval(entry.date, { start: monthStart, end: monthEnd }));
    const monthTotal = monthEntries.reduce((sum, entry) => sum + calculateTotalEarnings(entry), 0);
    
    return {
      averageDaily,
      weekTotal,
      monthTotal
    };
  }, [realEntries, tipEntries]);

  return (
    <div className="space-y-6">
      {/* Goals Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-6 w-6" />
            Goals
          </CardTitle>
          <CardDescription>Set and track your earning goals for each time period</CardDescription>
        </CardHeader>
        <CardContent>
          {showForm && (
            <div className="mb-6">
              <GoalSettingsForm
                editingGoal={editingGoal}
                onSubmit={handleSubmitGoal}
                onCancel={cancelForm}
                availableGoalTypes={editingGoal ? [editingGoal.type] : availableGoalTypes}
              />
            </div>
          )}
          
          {!showForm && goals.length === 0 && (
            <div className="text-center py-8">
              <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No goals set yet</h3>
              <p className="text-muted-foreground mb-4">Start by setting your first earning goal</p>
              <Button onClick={() => setShowForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Set Your First Goal
              </Button>
            </div>
          )}
          
          {!showForm && goals.length > 0 && !allGoalTypesSet && (
            <div className="mb-4">
              <Button onClick={() => setShowForm(true)} variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Add New Goal
              </Button>
            </div>
          )}
          
          {!showForm && allGoalTypesSet && (
            <div className="mb-4 p-3 bg-muted/50 rounded-lg border">
              <p className="text-sm text-muted-foreground">
                All goal types are set! Edit or delete existing goals to add new ones.
              </p>
            </div>
          )}

          <div className="space-y-4">
            {goalProgress.map((progress) => (
              <div key={progress.id} className="p-6 border rounded-lg bg-card">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="text-lg font-semibold capitalize flex items-center gap-2">
                      {progress.type} Goal
                      {progress.percentage >= 100 && (
                        <span className="text-lg">🎉</span>
                      )}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Target: ${progress.amount.toFixed(2)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => startEditing(progress)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onDeleteGoal(progress.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between text-sm font-medium">
                    <span>Progress</span>
                    <span>${progress.achieved.toFixed(2)} / ${progress.amount.toFixed(2)}</span>
                  </div>
                  <Progress value={progress.percentage} className="h-3" />
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      {progress.percentage.toFixed(1)}% complete
                    </span>
                    {progress.percentage >= 100 && (
                      <span className="text-sm text-green-600 font-semibold">Goal achieved!</span>
                    )}
                  </div>
                  
                  {progress.percentage < 100 && (
                    <div className="text-xs text-muted-foreground">
                      ${(progress.amount - progress.achieved).toFixed(2)} remaining to reach your goal
                    </div>
                  )}
                </div>
              </div>
            ))}
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
