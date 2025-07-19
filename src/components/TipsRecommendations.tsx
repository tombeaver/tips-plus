import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Calendar, MapPin, Star } from 'lucide-react';
import { format, getDay, isAfter, startOfWeek } from 'date-fns';

interface TipEntry {
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
}

interface TipsRecommendationsProps {
  tipEntries: TipEntry[];
  selectedDate?: Date;
}

export const TipsRecommendations: React.FC<TipsRecommendationsProps> = ({ tipEntries, selectedDate }) => {
  const recommendations = useMemo(() => {
    // Add null safety check
    if (!tipEntries || !Array.isArray(tipEntries)) {
      return null;
    }
    
    const realEntries = tipEntries.filter(entry => entry && !entry.isPlaceholder);
    
    if (realEntries.length < 5) {
      return null; // Not enough data for meaningful recommendations
    }

    // Analyze by day of week
    const dayStats: { [key: number]: { total: number; count: number; earnings: number } } = {};
    const sectionStats: { [key: string]: { total: number; count: number } } = {};

    realEntries.forEach(entry => {
      // Add null safety for entry properties
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

    // Calculate averages and find best performers
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

    // Find best day and section - add safety checks
    if (dayAverages.length === 0 || sectionAverages.length === 0) {
      return null;
    }

    const bestDay = dayAverages.reduce((best, current) => 
      current.avgTips > best.avgTips ? current : best
    );

    const bestSection = sectionAverages.reduce((best, current) => 
      current.avgTips > best.avgTips ? current : best
    );

    // Get selected day's stats (or today if no date selected)
    const targetDate = selectedDate || new Date();
    const targetDayIndex = getDay(targetDate);
    const targetDayStats = dayAverages.find(d => d.day === targetDayIndex);
    
    // Find sections used on this day of week
    const targetDaySections = realEntries
      .filter(entry => entry.date && getDay(entry.date) === targetDayIndex)
      .map(entry => ({
        section: entry.section || 'Unknown',
        tips: (entry.creditTips || 0) + (entry.cashTips || 0)
      }));
      
    // Get alternative sections (ones not tried on this day)
    const usedSections = new Set(targetDaySections.map(s => s.section));
    const alternativeSections = sectionAverages.filter(s => !usedSections.has(s.section));

    return {
      bestDay,
      bestSection,
      targetDayStats,
      targetDayIndex,
      targetDaySections,
      alternativeSections,
      totalEntries: realEntries.length,
      isSelectedDay: !!selectedDate
    };
  }, [tipEntries, selectedDate]);

  if (!recommendations) {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            Tips & Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Keep logging your tips! Recommendations will appear after you have at least 5 entries.
          </p>
        </CardContent>
      </Card>
    );
  }

  const { bestDay, bestSection, targetDayStats, targetDayIndex, targetDaySections, alternativeSections, isSelectedDay } = recommendations;

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="h-5 w-5" />
          Tips & Recommendations
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Best Day Recommendation */}
          <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
            <div className="p-2 bg-primary/10 rounded-full">
              <Calendar className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-sm">Best Day to Work</h4>
              <p className="text-sm text-muted-foreground mb-2">
                {bestDay.dayName}s have been your most profitable
              </p>
              <div className="flex gap-2">
                <Badge variant="secondary" className="text-xs">
                  Avg: ${bestDay.avgTips.toFixed(0)} tips
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  ${bestDay.avgEarnings.toFixed(0)} earnings
                </Badge>
              </div>
            </div>
          </div>

          {/* Best Section Recommendation */}
          <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
            <div className="p-2 bg-primary/10 rounded-full">
              <MapPin className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-sm">Top Performing Section</h4>
              <p className="text-sm text-muted-foreground mb-2">
                {bestSection.section} consistently performs well
              </p>
              <div className="flex gap-2">
                <Badge variant="secondary" className="text-xs">
                  Avg: ${bestSection.avgTips.toFixed(0)} tips
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  {bestSection.workCount} shifts worked
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Selected Day Recommendation */}
        {targetDayStats && (
          <div className="flex items-start gap-3 p-3 bg-primary/5 border border-primary/20 rounded-lg">
            <div className="p-2 bg-primary/10 rounded-full">
              <TrendingUp className="h-4 w-4 text-primary" />
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
        )}
      </CardContent>
    </Card>
  );
};