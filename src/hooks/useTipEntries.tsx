import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format, parseISO } from 'date-fns';

export interface SalesBreakdown {
  liquor: number;
  beer: number;
  wine: number;
  misc: number;
}

export interface TipEntry {
  id: string;
  date: Date;
  totalSales: number;
  alcoholSales?: number; // Computed: liquor + beer + wine (not misc)
  salesBreakdown?: SalesBreakdown;
  creditTips: number;
  cashTips: number;
  guestCount: number;
  section: string;
  isPlaceholder?: boolean;
  shift: 'AM' | 'PM' | 'Double';
  hoursWorked: number;
  hourlyRate: number;
  moodRating?: number;
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

      const formattedEntries = (data || []).map(entry => {
        // Parse date at midnight local time to prevent timezone shifting
        const [year, month, day] = entry.date.split('-').map(Number);
        const date = new Date(year, month - 1, day);
        
        // Build sales breakdown
        const salesBreakdown: SalesBreakdown = {
          liquor: Number(entry.liquor_sales) || 0,
          beer: Number(entry.beer_sales) || 0,
          wine: Number(entry.wine_sales) || 0,
          misc: Number(entry.cocktail_sales) || 0, // Using cocktail_sales column for misc
        };
        
        // Calculate alcohol sales as sum of liquor, beer, wine (not misc)
        const alcoholSales = salesBreakdown.liquor + salesBreakdown.beer + salesBreakdown.wine;
        
        return {
          id: entry.id,
          date,
          totalSales: Number(entry.sales) || 0,
          alcoholSales: alcoholSales > 0 ? alcoholSales : undefined,
          salesBreakdown,
          creditTips: Number(entry.tips) || 0,
          cashTips: Number(entry.cash_tips) || 0,
          guestCount: Number(entry.guest_count) || 0,
          section: `Section ${entry.section}`,
          shift: entry.shift as 'AM' | 'PM' | 'Double' || 'PM',
          hoursWorked: Number(entry.hours_worked) || 8,
          hourlyRate: Number(entry.hourly_rate) || 15,
          moodRating: entry.mood_rating ? Number(entry.mood_rating) : undefined,
        };
      });

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

      // Format date using date-fns to ensure consistent formatting
      const dateString = format(entry.date, 'yyyy-MM-dd');
      
      console.log('Saving entry for date:', dateString, 'Original date object:', entry.date);
      console.log('Entry.date details:', {
        toString: entry.date.toString(),
        toISOString: entry.date.toISOString(),
        toLocaleDateString: entry.date.toLocaleDateString(),
        getTimezoneOffset: entry.date.getTimezoneOffset()
      });
      console.log('Shift value being saved:', entry.shift, 'Type:', typeof entry.shift);

      // Calculate alcohol sales from breakdown (liquor + beer + wine, not misc)
      const alcoholSales = entry.salesBreakdown 
        ? (entry.salesBreakdown.liquor + entry.salesBreakdown.beer + entry.salesBreakdown.wine)
        : (entry.alcoholSales || 0);

      const { data, error } = await supabase
        .from('tip_entries')
        .insert([{
          user_id: user.id,
          date: dateString,
          sales: entry.totalSales,
          alcohol_sales: alcoholSales,
          food_sales: 0, // No longer tracking food separately
          liquor_sales: entry.salesBreakdown?.liquor || 0,
          beer_sales: entry.salesBreakdown?.beer || 0,
          wine_sales: entry.salesBreakdown?.wine || 0,
          cocktail_sales: entry.salesBreakdown?.misc || 0, // Using cocktail_sales column for misc
          tips: entry.creditTips,
          cash_tips: entry.cashTips,
          guest_count: entry.guestCount,
          section: parseInt(entry.section.replace('Section ', '')) || 1,
          shift: entry.shift,
          hours_worked: entry.hoursWorked,
          hourly_rate: entry.hourlyRate,
          mood_rating: entry.moodRating,
        }])
        .select()
        .single();

      if (error) throw error;

      // Parse date at midnight local time
      const [year, month, day] = data.date.split('-').map(Number);
      const dateObj = new Date(year, month - 1, day);
      
      // Build sales breakdown from response
      const salesBreakdown: SalesBreakdown = {
        liquor: Number(data.liquor_sales) || 0,
        beer: Number(data.beer_sales) || 0,
        wine: Number(data.wine_sales) || 0,
        misc: Number(data.cocktail_sales) || 0,
      };
      
      const newAlcoholSales = salesBreakdown.liquor + salesBreakdown.beer + salesBreakdown.wine;
      
      const newEntry: TipEntry = {
        id: data.id,
        date: dateObj,
        totalSales: Number(data.sales),
        alcoholSales: newAlcoholSales > 0 ? newAlcoholSales : undefined,
        salesBreakdown,
        creditTips: Number(data.tips),
        cashTips: Number(data.cash_tips),
        guestCount: Number(data.guest_count),
        section: `Section ${data.section}`,
        shift: data.shift as 'AM' | 'PM' | 'Double',
        hoursWorked: Number(data.hours_worked),
        hourlyRate: Number(data.hourly_rate),
        moodRating: data.mood_rating ? Number(data.mood_rating) : undefined,
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
      
      if (updates.date) {
        updateData.date = format(updates.date, 'yyyy-MM-dd');
        console.log('Updating entry for date:', updateData.date, 'Original date object:', updates.date);
      }
      if (updates.totalSales !== undefined) updateData.sales = updates.totalSales;
      if (updates.salesBreakdown) {
        updateData.food_sales = 0;
        updateData.liquor_sales = updates.salesBreakdown.liquor || 0;
        updateData.beer_sales = updates.salesBreakdown.beer || 0;
        updateData.wine_sales = updates.salesBreakdown.wine || 0;
        updateData.cocktail_sales = updates.salesBreakdown.misc || 0; // misc uses cocktail_sales column
        updateData.alcohol_sales = (updates.salesBreakdown.liquor || 0) + 
                                   (updates.salesBreakdown.beer || 0) + 
                                   (updates.salesBreakdown.wine || 0); // misc excluded from alcohol
      } else if (updates.alcoholSales !== undefined) {
        updateData.alcohol_sales = updates.alcoholSales;
      }
      if (updates.creditTips !== undefined) updateData.tips = updates.creditTips;
      if (updates.cashTips !== undefined) updateData.cash_tips = updates.cashTips;
      if (updates.guestCount !== undefined) updateData.guest_count = updates.guestCount;
      if (updates.section) updateData.section = parseInt(updates.section.replace('Section ', '')) || 1;
      if (updates.shift !== undefined) updateData.shift = updates.shift;
      if (updates.hoursWorked !== undefined) updateData.hours_worked = updates.hoursWorked;
      if (updates.hourlyRate !== undefined) updateData.hourly_rate = updates.hourlyRate;
      if (updates.moodRating !== undefined) updateData.mood_rating = updates.moodRating;

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
