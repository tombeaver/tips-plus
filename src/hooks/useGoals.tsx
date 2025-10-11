import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Goal {
  id: string;
  type: 'daily' | 'weekly' | 'monthly' | 'yearly';
  amount: number;
  period: string;
}

export interface FinancialData {
  monthlyExpenses: number;
  monthlySavingsGoal: number;
  monthlySpendingLimit: number;
}

export const useGoals = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [financialData, setFinancialData] = useState<FinancialData>({
    monthlyExpenses: 0,
    monthlySavingsGoal: 0,
    monthlySpendingLimit: 0,
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchGoals = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedGoals: Goal[] = [];
      let latestFinancialData: FinancialData = {
        monthlyExpenses: 0,
        monthlySavingsGoal: 0,
        monthlySpendingLimit: 0,
      };
      
      (data || []).forEach(goal => {
        // Store financial data from the most recent goal row
        latestFinancialData = {
          monthlyExpenses: Number(goal.monthly_expenses) || 0,
          monthlySavingsGoal: Number(goal.monthly_savings_goal) || 0,
          monthlySpendingLimit: Number(goal.monthly_spending_limit) || 0,
        };

        if (goal.daily_goal > 0) {
          formattedGoals.push({
            id: goal.id,
            type: 'daily',
            amount: Number(goal.daily_goal),
            period: 'daily',
          });
        }
        if (goal.weekly_goal > 0) {
          formattedGoals.push({
            id: goal.id,
            type: 'weekly',
            amount: Number(goal.weekly_goal),
            period: 'weekly',
          });
        }
        if (goal.monthly_goal > 0) {
          formattedGoals.push({
            id: goal.id,
            type: 'monthly',
            amount: Number(goal.monthly_goal),
            period: 'monthly',
          });
        }
        if (goal.yearly_goal > 0) {
          formattedGoals.push({
            id: goal.id,
            type: 'yearly',
            amount: Number(goal.yearly_goal),
            period: 'yearly',
          });
        }
      });

      setGoals(formattedGoals);
      setFinancialData(latestFinancialData);
    } catch (error) {
      console.error('Error fetching goals:', error);
      toast({
        title: "Error",
        description: "Failed to load goals. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addOrUpdateGoal = async (goal: Omit<Goal, 'id'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Check if a goal for this type already exists
      const existingGoal = goals.find(g => g.type === goal.type);

      if (existingGoal) {
        return updateGoal(existingGoal.id, goal);
      }

      const goalData: any = {
        user_id: user.id,
        daily_goal: 0,
        weekly_goal: 0,
        monthly_goal: 0,
        yearly_goal: 0,
      };

      // Map the goal type to the appropriate field
      switch (goal.type) {
        case 'daily':
          goalData.daily_goal = goal.amount;
          break;
        case 'weekly':
          goalData.weekly_goal = goal.amount;
          break;
        case 'monthly':
          goalData.monthly_goal = goal.amount;
          break;
        case 'yearly':
          goalData.yearly_goal = goal.amount;
          break;
      }

      const { data, error } = await supabase
        .from('goals')
        .insert([goalData])
        .select()
        .single();

      if (error) throw error;

      const newGoal: Goal = {
        id: data.id,
        type: goal.type,
        amount: goal.amount,
        period: goal.period,
      };

      setGoals(prev => [newGoal, ...prev]);
      
      toast({
        title: "Success",
        description: "Goal added successfully!",
      });

      return newGoal;
    } catch (error) {
      console.error('Error adding goal:', error);
      toast({
        title: "Error",
        description: "Failed to add goal. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateGoal = async (goalId: string, updatedGoal: Omit<Goal, 'id'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const goalData: any = {
        daily_goal: 0,
        weekly_goal: 0,
        monthly_goal: 0,
        yearly_goal: 0,
      };

      // Map the goal type to the appropriate field
      switch (updatedGoal.type) {
        case 'daily':
          goalData.daily_goal = updatedGoal.amount;
          break;
        case 'weekly':
          goalData.weekly_goal = updatedGoal.amount;
          break;
        case 'monthly':
          goalData.monthly_goal = updatedGoal.amount;
          break;
        case 'yearly':
          goalData.yearly_goal = updatedGoal.amount;
          break;
      }

      const { data, error } = await supabase
        .from('goals')
        .update(goalData)
        .eq('id', goalId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      const newGoal: Goal = {
        id: data.id,
        type: updatedGoal.type,
        amount: updatedGoal.amount,
        period: updatedGoal.period,
      };

      setGoals(prev => prev.map(goal => goal.id === goalId ? newGoal : goal));
      
      toast({
        title: "Success",
        description: "Goal updated successfully!",
      });

      return newGoal;
    } catch (error) {
      console.error('Error updating goal:', error);
      toast({
        title: "Error",
        description: "Failed to update goal. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteGoal = async (goalId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from('goals')
        .delete()
        .eq('id', goalId)
        .eq('user_id', user.id);

      if (error) throw error;

      setGoals(prev => prev.filter(goal => goal.id !== goalId));
      
      toast({
        title: "Success",
        description: "Goal deleted successfully!",
      });
    } catch (error) {
      console.error('Error deleting goal:', error);
      toast({
        title: "Error",
        description: "Failed to delete goal. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const updateFinancialData = async (data: FinancialData) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Get or create a goal row to store financial data
      let goalId: string;
      const { data: existingGoals } = await supabase
        .from('goals')
        .select('id')
        .eq('user_id', user.id)
        .limit(1);

      if (existingGoals && existingGoals.length > 0) {
        goalId = existingGoals[0].id;
      } else {
        // Create a new goal row if none exists
        const { data: newGoal, error: insertError } = await supabase
          .from('goals')
          .insert([{
            user_id: user.id,
            daily_goal: 0,
            weekly_goal: 0,
            monthly_goal: 0,
            yearly_goal: 0,
            monthly_expenses: data.monthlyExpenses,
            monthly_savings_goal: data.monthlySavingsGoal,
            monthly_spending_limit: data.monthlySpendingLimit,
          }])
          .select()
          .single();

        if (insertError) throw insertError;
        goalId = newGoal.id;
      }

      // Update financial data
      const { error } = await supabase
        .from('goals')
        .update({
          monthly_expenses: data.monthlyExpenses,
          monthly_savings_goal: data.monthlySavingsGoal,
          monthly_spending_limit: data.monthlySpendingLimit,
        })
        .eq('id', goalId)
        .eq('user_id', user.id);

      if (error) throw error;

      setFinancialData(data);
      
      toast({
        title: "Success",
        description: "Budget updated successfully!",
      });
    } catch (error) {
      console.error('Error updating financial data:', error);
      toast({
        title: "Error",
        description: "Failed to update budget. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  return {
    goals,
    financialData,
    loading,
    addGoal: addOrUpdateGoal,
    updateGoal,
    deleteGoal,
    updateFinancialData,
    refetch: fetchGoals,
  };
};