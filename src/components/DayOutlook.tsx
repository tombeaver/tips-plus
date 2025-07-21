import React, { useMemo } from 'react';
import { Compass } from 'lucide-react';
import { getDay } from 'date-fns';

interface TipEntry {
  id: string;
  date: Date;
  totalSales: number;
  creditTips: number;
  cashTips: number;
  guestCount: number;
  section: string;
  isPlaceholder?: boolean;
  shift: 'AM' | 'PM' | 'Double';
  hoursWorked: number;
  hourlyRate: number;
}

interface DayOutlookProps {
  tipEntries: TipEntry[];
  selectedDate?: Date;
}

export const DayOutlook: React.FC<DayOutlookProps> = ({ tipEntries, selectedDate }) => {
  const outlook = useMemo(() => {
    if (!tipEntries || !Array.isArray(tipEntries)) {
      return null;
    }
    
    const realEntries = tipEntries.filter(entry => entry && !entry.isPlaceholder);
    
    if (realEntries.length < 5) {
      return null;
    }

    // Analyze by day of week
    const dayStats: { [key: number]: { total: number; count: number; earnings: number } } = {};
    const sectionStats: { [key: string]: { total: number; count: number } } = {};

    realEntries.forEach(entry => {
      if (!entry || !entry.date) return;
      
      const dayOfWeek = getDay(entry.date);
      const totalTips = (entry.creditTips || 0) + (entry.cashTips || 0);
      const totalEarnings = totalTips + ((entry.hoursWorked || 0) * (entry.hourlyRate || 0));
      
      // Day statistics
      if (!dayStats[dayOfWeek]) {
        dayStats[dayOfWeek] = { total: 0, count: 0, earnings: 0 };
      }
      dayStats[dayOfWeek].total += totalTips;
      dayStats[dayOfWeek].earnings += totalEarnings;
      dayStats[dayOfWeek].count += 1;

      // Section statistics
      const section = entry.section || 'Unknown';
      if (totalTips > 0) {
        if (!sectionStats[section]) {
          sectionStats[section] = { total: 0, count: 0 };
        }
        sectionStats[section].total += totalTips;
        sectionStats[section].count += 1;
      }
    });

    // Calculate averages
    const dayAverages = Object.entries(dayStats).map(([day, stats]) => ({
      day: parseInt(day),
      avgTips: stats.total / stats.count,
      avgEarnings: stats.earnings / stats.count,
      dayName: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][parseInt(day)]
    }));

    const sectionAverages = Object.entries(sectionStats).map(([section, stats]) => ({
      section,
      avgTips: stats.total / stats.count,
      workCount: stats.count
    }));

    if (dayAverages.length === 0 || sectionAverages.length === 0) {
      return null;
    }

    const bestDay = dayAverages.reduce((best, current) => 
      current.avgTips > best.avgTips ? current : best
    );

    const bestSection = sectionAverages.reduce((best, current) => 
      current.avgTips > best.avgTips ? current : best
    );

    // Get selected day's stats
    const targetDate = selectedDate || new Date();
    const targetDayIndex = getDay(targetDate);
    const targetDayStats = dayAverages.find(d => d.day === targetDayIndex);
    
    // Find alternative sections
    const targetDaySections = realEntries
      .filter(entry => entry.date && getDay(entry.date) === targetDayIndex)
      .map(entry => ({
        section: entry.section || 'Unknown',
        tips: (entry.creditTips || 0) + (entry.cashTips || 0)
      }));
      
    const usedSections = new Set(targetDaySections.map(s => s.section));
    const alternativeSections = sectionAverages.filter(s => !usedSections.has(s.section));

    return {
      bestDay,
      bestSection,
      targetDayStats,
      alternativeSections,
      isSelectedDay: !!selectedDate
    };
  }, [tipEntries, selectedDate]);

  if (!outlook || !outlook.targetDayStats) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <Compass className="h-5 w-5" />
          <h3 className="text-2xl font-semibold leading-none tracking-tight">Day Outlook</h3>
        </div>
        <p className="text-muted-foreground">
          Keep logging your tips to see personalized outlook for this day!
        </p>
      </div>
    );
  }

  const { bestDay, bestSection, targetDayStats, alternativeSections, isSelectedDay } = outlook;

  return (
    <div className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <Compass className="h-5 w-5" />
        <h3 className="text-2xl font-semibold leading-none tracking-tight">Day Outlook</h3>
      </div>
      <div className="flex items-start gap-3 p-3 bg-primary/5 border border-primary/20 rounded-lg">
        <div className="p-2 bg-primary/10 rounded-full">
          <Compass className="h-4 w-4 text-primary" />
        </div>
        <div className="flex-1">
          <h4 className="font-medium text-sm">
            {isSelectedDay ? `${targetDayStats.dayName} Outlook` : "Today's Outlook"}
          </h4>
          <p className="text-sm text-muted-foreground">
            {targetDayStats.day === bestDay.day ? (
              <>
                {isSelectedDay ? 'This' : 'Today'} is your best day! 
                Consider working {bestSection.section} for optimal earnings.
              </>
            ) : targetDayStats.avgTips >= bestDay.avgTips * 0.8 ? (
              <>
                On {targetDayStats.dayName}s you typically earn ${targetDayStats.avgTips.toFixed(0)} in tips. 
                Try {bestSection.section} for best results.
              </>
            ) : (
              <>
                {targetDayStats.dayName}s are slower (avg ${targetDayStats.avgTips.toFixed(0)} tips). 
                {alternativeSections.length > 0 ? (
                  <>Consider trying {alternativeSections[0].section} - you haven't worked it on {targetDayStats.dayName}s yet!</>
                ) : (
                  <>Consider requesting {bestSection.section} for better results.</>
                )}
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};