import React, { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, TrendingUp, Brain, Clock } from 'lucide-react';
import { TipEntry } from '@/hooks/useTipEntries';
import { format, addDays, getDay, startOfWeek, endOfWeek, differenceInWeeks, isSameDay } from 'date-fns';

interface PredictivePlanningProps {
  tipEntries: TipEntry[];
  onAddProjectedEntries: (entries: TipEntry[]) => void;
}

export const PredictivePlanning: React.FC<PredictivePlanningProps> = ({ 
  tipEntries, 
  onAddProjectedEntries 
}) => {
  const realEntries = tipEntries.filter(entry => !entry.isPlaceholder);

  const workPatternAnalysis = useMemo(() => {
    if (realEntries.length < 10) { // Need at least 10 entries for pattern analysis
      return null;
    }

    // Group entries by day of week
    const dayOfWeekStats = new Map();
    const shiftStats = new Map(); // For AM/PM patterns
    
    realEntries.forEach(entry => {
      const dayOfWeek = getDay(entry.date); // 0 = Sunday, 1 = Monday, etc.
      const key = `${dayOfWeek}-${entry.shift}`;
      
      if (!dayOfWeekStats.has(dayOfWeek)) {
        dayOfWeekStats.set(dayOfWeek, {
          dayName: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dayOfWeek],
          totalShifts: 0,
          amShifts: 0,
          pmShifts: 0,
          totalTips: 0,
          totalSales: 0,
          totalGuests: 0,
          totalHours: 0,
          totalEarnings: 0
        });
      }
      
      if (!shiftStats.has(key)) {
        shiftStats.set(key, {
          dayOfWeek,
          shift: entry.shift,
          count: 0,
          totalTips: 0,
          totalSales: 0,
          totalGuests: 0,
          totalHours: 0,
          avgHourlyRate: 0
        });
      }

      const dayStats = dayOfWeekStats.get(dayOfWeek);
      const shiftStat = shiftStats.get(key);
      
      dayStats.totalShifts++;
      if (entry.shift === 'AM') dayStats.amShifts++;
      else dayStats.pmShifts++;
      
      const tips = entry.creditTips + entry.cashTips;
      const earnings = tips + (entry.hoursWorked * entry.hourlyRate);
      
      dayStats.totalTips += tips;
      dayStats.totalSales += entry.totalSales;
      dayStats.totalGuests += entry.guestCount;
      dayStats.totalHours += entry.hoursWorked;
      dayStats.totalEarnings += earnings;
      
      shiftStat.count++;
      shiftStat.totalTips += tips;
      shiftStat.totalSales += entry.totalSales;
      shiftStat.totalGuests += entry.guestCount;
      shiftStat.totalHours += entry.hoursWorked;
      shiftStat.avgHourlyRate = (shiftStat.avgHourlyRate * (shiftStat.count - 1) + entry.hourlyRate) / shiftStat.count;
    });

    // Calculate averages and identify patterns
    const patterns = Array.from(dayOfWeekStats.entries()).map(([dayOfWeek, stats]) => {
      const avgTipsPerShift = stats.totalShifts > 0 ? stats.totalTips / stats.totalShifts : 0;
      const avgHoursPerShift = stats.totalShifts > 0 ? stats.totalHours / stats.totalShifts : 0;
      const avgEarningsPerShift = stats.totalShifts > 0 ? stats.totalEarnings / stats.totalShifts : 0;
      const workProbability = stats.totalShifts / realEntries.length;
      
      return {
        dayOfWeek,
        dayName: stats.dayName,
        workProbability,
        avgTipsPerShift,
        avgHoursPerShift,
        avgEarningsPerShift,
        preferredShift: stats.amShifts > stats.pmShifts ? 'AM' : 'PM',
        totalShifts: stats.totalShifts
      };
    }).filter(pattern => pattern.workProbability > 0.1); // Only days worked at least 10% of the time

    return {
      patterns: patterns.sort((a, b) => b.workProbability - a.workProbability),
      shiftDetails: Array.from(shiftStats.values()),
      totalWeeksAnalyzed: Math.max(1, differenceInWeeks(new Date(), realEntries[0]?.date || new Date()))
    };
  }, [realEntries]);

  const projectedEntries = useMemo(() => {
    if (!workPatternAnalysis) return [];

    const projections: TipEntry[] = [];
    const today = new Date();
    
    // Project for the next 4 weeks
    for (let week = 0; week < 4; week++) {
      const weekStart = addDays(today, week * 7);
      
      workPatternAnalysis.patterns.forEach(pattern => {
        // Only project if probability is reasonable (>20%) and we have enough data
        if (pattern.workProbability > 0.2 && pattern.totalShifts >= 3) {
          const projectedDate = addDays(weekStart, pattern.dayOfWeek);
          
          // Don't project for dates that already have entries
          const hasExistingEntry = tipEntries.some(entry => isSameDay(entry.date, projectedDate));
          if (hasExistingEntry) return;
          
          // Find the most common section for this day/shift combo
          const dayShiftEntries = realEntries.filter(entry => 
            getDay(entry.date) === pattern.dayOfWeek && 
            entry.shift === pattern.preferredShift
          );
          
          const mostCommonSection = dayShiftEntries.reduce((acc, entry) => {
            acc[entry.section] = (acc[entry.section] || 0) + 1;
            return acc;
          }, {} as Record<string, number>);
          
          const section = Object.keys(mostCommonSection).reduce((a, b) => 
            mostCommonSection[a] > mostCommonSection[b] ? a : b, 
            dayShiftEntries[0]?.section || 'Main'
          );

          // Get average hourly rate from recent entries
          const recentEntries = realEntries.slice(-10);
          const avgHourlyRate = recentEntries.length > 0 ? 
            recentEntries.reduce((sum, entry) => sum + entry.hourlyRate, 0) / recentEntries.length : 
            15; // Default fallback

          // Calculate projected values with some variance
          const baseVariance = 0.85 + (Math.random() * 0.3); // 85% to 115% of average
          const projectedTips = Math.round(pattern.avgTipsPerShift * baseVariance);
          const projectedSales = Math.round(projectedTips / 0.18); // Assume 18% tip rate
          const projectedGuests = Math.round((projectedTips / 8) + (Math.random() * 4)); // ~$8 per guest +/- variance
          
          projections.push({
            id: `projected-${projectedDate.getTime()}-${pattern.dayOfWeek}`,
            date: projectedDate,
            totalSales: projectedSales,
            creditTips: Math.round(projectedTips * 0.8), // 80% credit
            cashTips: Math.round(projectedTips * 0.2), // 20% cash
            guestCount: Math.max(1, projectedGuests),
            section,
            shift: pattern.preferredShift as 'AM' | 'PM',
            hoursWorked: Math.round(pattern.avgHoursPerShift * 4) / 4, // Round to nearest 0.25
            hourlyRate: Math.round(avgHourlyRate * 100) / 100,
            isPlaceholder: true
          });
        }
      });
    }

    return projections.sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [workPatternAnalysis, tipEntries, realEntries]);

  const projectionSummary = useMemo(() => {
    const totalProjectedTips = projectedEntries.reduce((sum, entry) => 
      sum + entry.creditTips + entry.cashTips, 0
    );
    const totalProjectedEarnings = projectedEntries.reduce((sum, entry) => 
      sum + entry.creditTips + entry.cashTips + (entry.hoursWorked * entry.hourlyRate), 0
    );
    const projectedShifts = projectedEntries.length;

    return {
      totalProjectedTips,
      totalProjectedEarnings,
      projectedShifts,
      avgPerShift: projectedShifts > 0 ? totalProjectedEarnings / projectedShifts : 0
    };
  }, [projectedEntries]);

  if (!workPatternAnalysis) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Predictive Planning
          </CardTitle>
          <CardDescription>AI-powered work pattern analysis</CardDescription>
        </CardHeader>
        <CardContent className="text-center py-8">
          <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 mb-2">Need more data for predictions</p>
          <p className="text-sm text-gray-400">
            Add at least 10 shifts (3-4 weeks of data) to enable pattern analysis
          </p>
          <Badge variant="outline" className="mt-3">
            {realEntries.length}/10 entries needed
          </Badge>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Work Pattern Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Work Pattern Analysis
          </CardTitle>
          <CardDescription>
            Based on {workPatternAnalysis.totalWeeksAnalyzed} weeks of data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {workPatternAnalysis.patterns.map((pattern) => (
              <div key={pattern.dayOfWeek} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{pattern.dayName}s</span>
                    <Badge variant="secondary" className="text-xs">
                      {pattern.preferredShift}
                    </Badge>
                  </div>
                  <span className="text-sm font-medium text-green-600">
                    ${pattern.avgEarningsPerShift.toFixed(0)}/shift
                  </span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>{Math.round(pattern.workProbability * 100)}% work frequency</span>
                  <span>{pattern.avgHoursPerShift.toFixed(1)}h avg</span>
                  <span>{pattern.totalShifts} shifts total</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Projected Schedule */}
      {projectedEntries.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Projected Schedule (Next 4 Weeks)
            </CardTitle>
            <CardDescription>
              Predicted shifts based on your work patterns
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 mb-4">
              {projectedEntries.slice(0, 8).map((entry) => (
                <div key={entry.id} className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex justify-between items-center mb-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {format(entry.date, 'EEE, MMM d')}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {entry.shift}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {entry.section}
                      </Badge>
                    </div>
                    <span className="text-sm font-medium text-blue-700">
                      ${(entry.creditTips + entry.cashTips + (entry.hoursWorked * entry.hourlyRate)).toFixed(0)}
                    </span>
                  </div>
                  <div className="text-xs text-blue-600">
                    {entry.hoursWorked}h • ${(entry.creditTips + entry.cashTips).toFixed(0)} tips • {entry.guestCount} guests
                  </div>
                </div>
              ))}
              
              {projectedEntries.length > 8 && (
                <p className="text-sm text-gray-500 text-center">
                  + {projectedEntries.length - 8} more projected shifts
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="p-3 bg-green-50 rounded-lg">
                <p className="text-sm text-green-600">Projected Tips</p>
                <p className="text-xl font-bold text-green-700">
                  ${projectionSummary.totalProjectedTips.toFixed(0)}
                </p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <p className="text-sm text-purple-600">Total Earnings</p>
                <p className="text-xl font-bold text-purple-700">
                  ${projectionSummary.totalProjectedEarnings.toFixed(0)}
                </p>
              </div>
            </div>

            <Button 
              onClick={() => onAddProjectedEntries(projectedEntries)}
              className="w-full"
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              Add Projections to Calendar
            </Button>
            
            <p className="text-xs text-gray-500 mt-2 text-center">
              These are planning scenarios and won't affect your analytics
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};