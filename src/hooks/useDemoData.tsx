import { useMemo } from 'react';
import { subDays, startOfMonth, eachDayOfInterval } from 'date-fns';
import type { TipEntry } from './useTipEntries';

// Pre-filled entry for the onboarding form demo
export const getDemoFormEntry = (date: Date): Omit<TipEntry, 'id'> => ({
  date,
  totalSales: 850,
  alcoholSales: 285,
  salesBreakdown: {
    liquor: 120,
    beer: 95,
    wine: 70,
    misc: 0,
  },
  creditTips: 145,
  cashTips: 42,
  guestCount: 28,
  section: 'Section 3',
  shift: 'PM',
  hoursWorked: 7,
  hourlyRate: 15,
  moodRating: 4,
});

// Generate realistic demo data for the current month
export const useDemoData = () => {
  const demoEntries = useMemo((): TipEntry[] => {
    const today = new Date();
    const monthStart = startOfMonth(today);
    const monthEnd = subDays(today, 1); // Don't include today so add button shows
    
    // Return empty if today is the first of the month
    if (monthEnd < monthStart) {
      return [];
    }
    
    const daysInRange = eachDayOfInterval({ start: monthStart, end: monthEnd });
    const entries: TipEntry[] = [];
    
    // Work ~4-5 shifts per week (weekends + some weekdays)
    daysInRange.forEach((date, index) => {
      const dayOfWeek = date.getDay();
      const isWeekendDay = dayOfWeek === 5 || dayOfWeek === 6; // Fri, Sat
      const isRandomWeekday = !isWeekendDay && Math.random() > 0.6;
      
      if (isWeekendDay || isRandomWeekday) {
        const isBusy = isWeekendDay;
        const baseMultiplier = isBusy ? 1.3 : 1;
        
        const totalSales = Math.round((800 + Math.random() * 600) * baseMultiplier);
        const alcoholSales = Math.round(totalSales * (0.3 + Math.random() * 0.2));
        const tipRate = 0.18 + Math.random() * 0.04;
        const totalTips = Math.round(totalSales * tipRate);
        const cashTips = Math.round(totalTips * (0.2 + Math.random() * 0.2));
        const creditTips = totalTips - cashTips;
        
        entries.push({
          id: `demo-${index}`,
          date,
          totalSales,
          alcoholSales,
          salesBreakdown: {
            liquor: Math.round(alcoholSales * 0.4),
            beer: Math.round(alcoholSales * 0.35),
            wine: Math.round(alcoholSales * 0.25),
            misc: 0,
          },
          creditTips,
          cashTips,
          guestCount: Math.round(20 + Math.random() * 30),
          section: `Section ${Math.floor(Math.random() * 5) + 1}`,
          shift: isBusy ? 'PM' : (Math.random() > 0.5 ? 'PM' : 'AM'),
          hoursWorked: isBusy ? 8 : 6,
          hourlyRate: 15,
          moodRating: Math.floor(Math.random() * 2) + 4,
        });
      }
    });
    
    return entries;
  }, []);

  const demoGoals = useMemo(() => ([
    { id: 'demo-daily', type: 'daily' as const, amount: 200, period: 'daily' },
    { id: 'demo-weekly', type: 'weekly' as const, amount: 1000, period: 'weekly' },
    { id: 'demo-monthly', type: 'monthly' as const, amount: 4500, period: 'monthly' },
    { id: 'demo-yearly', type: 'yearly' as const, amount: 55000, period: 'yearly' },
  ]), []);

  const demoFinancialData = useMemo(() => ({
    monthlyExpenses: 2800,
    monthlySavingsGoal: 800,
    monthlySpendingLimit: 1500,
  }), []);

  // Empty states for interactive setup during onboarding
  const emptyGoals = useMemo(() => [], []);
  const emptyFinancialData = useMemo(() => ({
    monthlyExpenses: 0,
    monthlySavingsGoal: 0,
    monthlySpendingLimit: 0,
  }), []);

  return {
    demoEntries,
    demoGoals,
    demoFinancialData,
    emptyGoals,
    emptyFinancialData,
    getDemoFormEntry,
  };
};
