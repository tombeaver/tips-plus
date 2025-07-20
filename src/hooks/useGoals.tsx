import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Goal {
  id: string;
  type: 'daily' | 'weekly' | 'monthly' | 'yearly';
  amount: number;
  period: string;
}

export const useGoals = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchGoals = async () => {
    try {
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedGoals = (data || []).map(goal => ({
        id: goal.id,
        type: 'daily' as const, // We'll map based on the amounts later
        amount: Number(goal.daily_goal),
        period: 'daily',
      }));

      setGoals(formattedGoals);
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

  const addGoal = async (goal: Omit<Goal, 'id'>) => {
    try {
      const goalData: any = {
        daily_goal: 0,
        weekly_goal: 0,
        monthly_goal: 0,
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

  useEffect(() => {
    fetchGoals();
  }, []);

  return {
    goals,
    loading,
    addGoal,
    refetch: fetchGoals,
  };
};