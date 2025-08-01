import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Target, TrendingUp, Calendar, Edit, Trash2, Plus, Clock, DollarSign } from 'lucide-react';
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
    <div className="space-y-4">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-6 w-6" />
            Goals
          </CardTitle>
          <p className="body-md text-muted-foreground">
            Track your progress and stay motivated
          </p>
        </CardHeader>
      </Card>

      {/* Goals Tabs */}
      <Tabs defaultValue="goals" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-card/50 backdrop-blur-sm border shadow-sm">
          <TabsTrigger value="goals" className="flex items-center gap-1">
            <Target className="h-4 w-4" />
            Goals
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-1">
            <TrendingUp className="h-4 w-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="tips" className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            Tips
          </TabsTrigger>
        </TabsList>

        {/* Goals Tab */}
        <TabsContent value="goals" className="space-group">
          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardHeader>
              <CardTitle className="text-white text-lg">
                Goal Management
              </CardTitle>
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
                  <Target className="h-12 w-12 mx-auto text-white/60 mb-4" />
                  <h3 className="text-lg font-medium mb-2 text-white">No goals set yet</h3>
                  <p className="text-white/80 mb-4">Start by setting your first earning goal</p>
                  <Button onClick={() => setShowForm(true)} variant="secondary">
                    <Plus className="h-4 w-4 mr-2" />
                    Set Your First Goal
                  </Button>
                </div>
              )}
              
              {!showForm && goals.length > 0 && !allGoalTypesSet && (
                <div className="mb-4">
                  <Button onClick={() => setShowForm(true)} variant="secondary">
                    <Plus className="h-4 w-4 mr-2" />
                    Add New Goal
                  </Button>
                </div>
              )}
              
              {!showForm && allGoalTypesSet && (
                <div className="mb-4 p-3 bg-white/10 rounded-lg border border-white/20">
                  <p className="text-sm text-white/80">
                    All goal types are set! Edit or delete existing goals to add new ones.
                  </p>
                </div>
              )}

              {/* Goal Type Tabs */}
              {!showForm && (
                <Tabs defaultValue="daily" className="w-full">
                  <TabsList className="grid w-full grid-cols-4 bg-white/10 backdrop-blur-sm border border-white/20">
                    <TabsTrigger value="daily" className="text-white data-[state=active]:bg-white/20 data-[state=active]:text-white">
                      Daily
                    </TabsTrigger>
                    <TabsTrigger value="weekly" className="text-white data-[state=active]:bg-white/20 data-[state=active]:text-white">
                      Weekly
                    </TabsTrigger>
                    <TabsTrigger value="monthly" className="text-white data-[state=active]:bg-white/20 data-[state=active]:text-white">
                      Monthly
                    </TabsTrigger>
                    <TabsTrigger value="yearly" className="text-white data-[state=active]:bg-white/20 data-[state=active]:text-white">
                      Yearly
                    </TabsTrigger>
                  </TabsList>

                  {['daily', 'weekly', 'monthly', 'yearly'].map((type) => {
                    const progress = goalProgress.find(p => p.type === type);
                    
                    return (
                      <TabsContent key={type} value={type} className="mt-4">
                        {progress ? (
                          <div className="p-4 border border-white/20 rounded-lg bg-white/5">
                            <div className="flex justify-between items-start mb-4">
                              <div>
                                <h4 className="text-lg font-semibold capitalize flex items-center gap-2 text-white">
                                  {progress.type} Goal
                                  {progress.percentage >= 100 && (
                                    <span className="text-lg">🎉</span>
                                  )}
                                </h4>
                                <p className="text-sm text-white/70">
                                  Target: ${progress.amount.toFixed(2)}
                                </p>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="secondary"
                                  onClick={() => startEditing(progress)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => onDeleteGoal(progress.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                            
                            <div className="space-y-3">
                              <div className="flex justify-between text-sm font-medium text-white">
                                <span>Progress</span>
                                <span>${progress.achieved.toFixed(2)} / ${progress.amount.toFixed(2)}</span>
                              </div>
                              <Progress value={progress.percentage} className="h-3" />
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-white/70">
                                  {progress.percentage.toFixed(1)}% complete
                                </span>
                                {progress.percentage >= 100 && (
                                  <span className="text-sm text-green-300 font-semibold">Goal achieved!</span>
                                )}
                              </div>
                              
                              {progress.percentage < 100 && (
                                <div className="text-xs text-white/60">
                                  ${(progress.amount - progress.achieved).toFixed(2)} remaining to reach your goal
                                </div>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <Target className="h-8 w-8 mx-auto text-white/40 mb-3" />
                            <h4 className="text-md font-medium mb-2 text-white">No {type} goal set</h4>
                            <p className="text-white/70 mb-4 text-sm">Set a {type} earning target to track progress</p>
                            <Button 
                              onClick={() => {
                                setEditingGoal(null);
                                setShowForm(true);
                              }} 
                              variant="secondary"
                              size="sm"
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Set {type} Goal
                            </Button>
                          </div>
                        )}
                      </TabsContent>
                    );
                  })}
                </Tabs>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-group">
          <Card className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white">
            <CardHeader>
              <CardTitle className="text-white text-lg">
                Earnings Analytics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 border border-white/20 rounded-lg bg-white/10">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                      <DollarSign className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-white/80">Daily Average</span>
                  </div>
                  <div className="text-2xl font-bold text-white">
                    ${projectedEarnings.averageDaily.toFixed(2)}
                  </div>
                </div>
                <div className="p-4 border border-white/20 rounded-lg bg-white/10">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-white/80">This Week</span>
                  </div>
                  <div className="text-2xl font-bold text-white">
                    ${projectedEarnings.weekTotal.toFixed(2)}
                  </div>
                </div>
              </div>
              
              <div className="p-4 border border-white/20 rounded-lg bg-white/10">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-white/80">This Month (Projected)</span>
                </div>
                <div className="text-2xl font-bold text-white">
                  ${projectedEarnings.monthTotal.toFixed(2)}
                </div>
              </div>
              
              {tipEntries.some(entry => entry.isPlaceholder) && (
                <div className="p-3 bg-white/10 rounded-lg border border-white/20">
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="h-4 w-4 text-white" />
                    <p className="text-sm text-white font-medium">Planning Scenarios Included</p>
                  </div>
                  <p className="text-xs text-white/70">
                    Projections include your planned shifts as placeholders
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tips Tab */}
        <TabsContent value="tips" className="space-group">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardHeader>
              <CardTitle className="text-white text-lg">Goal Setting Tips</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 border border-white/20 rounded-lg bg-white/5">
                <p className="text-white text-sm">• Set realistic daily goals based on your average earnings</p>
              </div>
              <div className="p-3 border border-white/20 rounded-lg bg-white/5">
                <p className="text-white text-sm">• Use weekly goals to plan for busier periods</p>
              </div>
              <div className="p-3 border border-white/20 rounded-lg bg-white/5">
                <p className="text-white text-sm">• Monthly goals help with budgeting and financial planning</p>
              </div>
              <div className="p-3 border border-white/20 rounded-lg bg-white/5">
                <p className="text-white text-sm">• Add planning scenarios to project future earnings</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};