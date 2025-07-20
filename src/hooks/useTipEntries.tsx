import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface TipEntry {
  id: string;
  date: Date;
  totalSales: number;
  creditTips: number;
  cashTips: number;
  guestCount: number;
  section: string;
  isPlaceholder?: boolean;
  shift: 'AM' | 'PM';
  hoursWorked: number;
  hourlyRate: number;
  weather?: any;
}

export const useTipEntries = () => {
  const [tipEntries, setTipEntries] = useState<TipEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchTipEntries = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('tip_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (error) throw error;

      const formattedEntries = (data || []).map(entry => ({
        id: entry.id,
        date: new Date(entry.date),
        totalSales: Number(entry.sales) || 0,
        creditTips: Number(entry.tips) || 0,
        cashTips: 0, // We'll update schema later to include this
        guestCount: 0, // We'll update schema later to include this
        section: `Section ${entry.section}`,
        shift: 'PM' as const, // We'll update schema later to include this
        hoursWorked: 8, // We'll update schema later to include this
        hourlyRate: 15, // We'll update schema later to include this
      }));

      setTipEntries(formattedEntries);
    } catch (error) {
      console.error('Error fetching tip entries:', error);
      toast({
        title: "Error",
        description: "Failed to load tip entries. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addTipEntry = async (entry: Omit<TipEntry, 'id'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('tip_entries')
        .insert([{
          user_id: user.id,
          date: entry.date.getFullYear() + '-' + 
                String(entry.date.getMonth() + 1).padStart(2, '0') + '-' + 
                String(entry.date.getDate()).padStart(2, '0'),
          sales: entry.totalSales,
          tips: entry.creditTips,
          section: parseInt(entry.section.replace('Section ', '')) || 1,
        }])
        .select()
        .single();

      if (error) throw error;

      const newEntry: TipEntry = {
        id: data.id,
        date: new Date(data.date),
        totalSales: Number(data.sales),
        creditTips: Number(data.tips),
        cashTips: entry.cashTips,
        guestCount: entry.guestCount,
        section: `Section ${data.section}`,
        shift: entry.shift,
        hoursWorked: entry.hoursWorked,
        hourlyRate: entry.hourlyRate,
      };

      setTipEntries(prev => [newEntry, ...prev]);
      
      toast({
        title: "Success",
        description: "Tip entry added successfully!",
      });

      return newEntry;
    } catch (error) {
      console.error('Error adding tip entry:', error);
      toast({
        title: "Error",
        description: "Failed to add tip entry. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateTipEntry = async (id: string, updates: Partial<TipEntry>) => {
    try {
      const updateData: any = {};
      
      if (updates.date) updateData.date = updates.date.getFullYear() + '-' + 
                                        String(updates.date.getMonth() + 1).padStart(2, '0') + '-' + 
                                        String(updates.date.getDate()).padStart(2, '0');
      if (updates.totalSales !== undefined) updateData.sales = updates.totalSales;
      if (updates.creditTips !== undefined) updateData.tips = updates.creditTips;
      if (updates.section) updateData.section = parseInt(updates.section.replace('Section ', '')) || 1;

      const { error } = await supabase
        .from('tip_entries')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;

      setTipEntries(prev => prev.map(entry => 
        entry.id === id ? { ...entry, ...updates } : entry
      ));

      toast({
        title: "Success",
        description: "Tip entry updated successfully!",
      });
    } catch (error) {
      console.error('Error updating tip entry:', error);
      toast({
        title: "Error",
        description: "Failed to update tip entry. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteTipEntry = async (id: string) => {
    try {
      const { error } = await supabase
        .from('tip_entries')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setTipEntries(prev => prev.filter(entry => entry.id !== id));
      
      toast({
        title: "Success",
        description: "Tip entry deleted successfully!",
      });
    } catch (error) {
      console.error('Error deleting tip entry:', error);
      toast({
        title: "Error",
        description: "Failed to delete tip entry. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchTipEntries();
  }, []);

  return {
    tipEntries,
    loading,
    addTipEntry,
    updateTipEntry,
    deleteTipEntry,
    refetch: fetchTipEntries,
  };
};