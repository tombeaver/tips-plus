import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Calendar, MapPin, Lightbulb, DollarSign, Clock, Heart, Target, BarChart3, AlertTriangle, CheckCircle, Shuffle, Zap, TrendingDown } from 'lucide-react';
import { format, getDay, isAfter, startOfWeek, subDays, differenceInDays } from 'date-fns';
import { TipEntry } from '@/hooks/useTipEntries';

interface InsightsProps {
  tipEntries: TipEntry[];
  selectedDate?: Date;
}

export const Insights: React.FC<InsightsProps> = ({ tipEntries, selectedDate }) => {
  const insightsData = useMemo(() => {
    if (!tipEntries || !Array.isArray(tipEntries)) {
      return null;
    }
    
    const realEntries = tipEntries.filter(entry => entry && !entry.isPlaceholder);
    
    if (realEntries.length < 3) {
      return null;
    }

    // Helper functions
    const calculateTotalEarnings = (entry: TipEntry) => {
      const tips = (entry.creditTips || 0) + (entry.cashTips || 0);
      const wages = (entry.hoursWorked || 0) * (entry.hourlyRate || 0);
      return tips + wages;
    };

    const calculateTips = (entry: TipEntry) => (entry.creditTips || 0) + (entry.cashTips || 0);

    // Filter last 30 days
    const last30Days = realEntries.filter(entry => 
      differenceInDays(new Date(), entry.date) <= 30
    );

    // Get most recent shift for analysis
    const sortedEntries = realEntries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const mostRecentShift = sortedEntries[0];

    // Section Analysis
    const sectionAnalysis = last30Days.reduce((acc, entry) => {
      const section = entry.section?.toString() || 'Unknown';
      const earnings = calculateTotalEarnings(entry);
      const tips = calculateTips(entry);
      const tipPercentage = entry.totalSales > 0 ? (tips / entry.totalSales) * 100 : 0;
      
      if (!acc[section]) {
        acc[section] = { 
          totalEarnings: 0, 
          totalTips: 0, 
          totalHours: 0, 
          totalSales: 0,
          count: 0,
          moodSum: 0,
          moodCount: 0
        };
      }
      acc[section].totalEarnings += earnings;
      acc[section].totalTips += tips;
      acc[section].totalHours += entry.hoursWorked || 0;
      acc[section].totalSales += entry.totalSales || 0;
      acc[section].count += 1;
      
      if (entry.moodRating) {
        acc[section].moodSum += entry.moodRating;
        acc[section].moodCount += 1;
      }
      
      return acc;
    }, {} as { [key: string]: { totalEarnings: number; totalTips: number; totalHours: number; totalSales: number; count: number; moodSum: number; moodCount: number } });

    const sectionStats = Object.entries(sectionAnalysis).map(([section, stats]) => ({
      section,
      avgEarningsPerHour: stats.totalHours > 0 ? stats.totalEarnings / stats.totalHours : 0,
      avgTipPercentage: stats.totalSales > 0 ? (stats.totalTips / stats.totalSales) * 100 : 0,
      avgMood: stats.moodCount > 0 ? stats.moodSum / stats.moodCount : null,
      count: stats.count,
      avgEarnings: stats.totalEarnings / stats.count
    })).sort((a, b) => b.avgEarningsPerHour - a.avgEarningsPerHour);

    // Day + Shift Analysis
    const dayShiftAnalysis = last30Days.reduce((acc, entry) => {
      const dayOfWeek = getDay(entry.date);
      const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dayOfWeek];
      const shiftType = entry.shift || 'PM';
      const key = `${dayName}-${shiftType}`;
      const earnings = calculateTotalEarnings(entry);
      
      if (!acc[key]) {
        acc[key] = { totalEarnings: 0, count: 0, dayName, shiftType };
      }
      acc[key].totalEarnings += earnings;
      acc[key].count += 1;
      return acc;
    }, {} as { [key: string]: { totalEarnings: number; count: number; dayName: string; shiftType: string } });

    const dayShiftStats = Object.entries(dayShiftAnalysis).map(([key, stats]) => ({
      key,
      dayName: stats.dayName,
      shiftType: stats.shiftType,
      avgEarnings: stats.totalEarnings / stats.count,
      count: stats.count
    })).sort((a, b) => b.avgEarnings - a.avgEarnings);

    // Pattern analysis for change-it-up recommendations
    const recentShifts = sortedEntries.slice(0, 5);
    const consecutiveShiftType = recentShifts.every(shift => shift.shift === recentShifts[0].shift);
    const consecutiveSection = recentShifts.every(shift => shift.section === recentShifts[0].section);

    // Missing opportunities analysis
    const allDayShiftCombos = [
      'Sunday-AM', 'Sunday-PM', 'Sunday-Double',
      'Monday-AM', 'Monday-PM', 'Monday-Double',
      'Tuesday-AM', 'Tuesday-PM', 'Tuesday-Double',
      'Wednesday-AM', 'Wednesday-PM', 'Wednesday-Double',
      'Thursday-AM', 'Thursday-PM', 'Thursday-Double',
      'Friday-AM', 'Friday-PM', 'Friday-Double',
      'Saturday-AM', 'Saturday-PM', 'Saturday-Double'
    ];

    const workedCombos = new Set(Object.keys(dayShiftAnalysis));
    const missedOpportunities = allDayShiftCombos.filter(combo => !workedCombos.has(combo));

    // Guest count analysis for most recent shift
    const avgGuestCount = last30Days.reduce((sum, entry) => sum + (entry.guestCount || 0), 0) / last30Days.length;
    const recentGuestCount = mostRecentShift?.guestCount || 0;

    return {
      realEntries,
      last30Days,
      mostRecentShift,
      sectionStats,
      dayShiftStats,
      consecutiveShiftType,
      consecutiveSection,
      missedOpportunities,
      avgGuestCount,
      recentGuestCount
    };
  }, [tipEntries, selectedDate]);

  if (!insightsData) {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Keep logging your shifts! Smart insights will appear after you have at least 3 entries.
          </p>
        </CardContent>
      </Card>
    );
  }

  const { 
    realEntries, 
    last30Days, 
    mostRecentShift, 
    sectionStats, 
    dayShiftStats, 
    consecutiveShiftType, 
    consecutiveSection,
    missedOpportunities,
    avgGuestCount,
    recentGuestCount
  } = insightsData;

  // Helper functions for insights
  const calculateTotalEarnings = (entry: TipEntry) => {
    const tips = (entry.creditTips || 0) + (entry.cashTips || 0);
    const wages = (entry.hoursWorked || 0) * (entry.hourlyRate || 0);
    return tips + wages;
  };

  const getPerformanceFactors = (shift: TipEntry) => {
    const factors = [];
    const earnings = calculateTotalEarnings(shift);
    const avgEarnings = last30Days.reduce((sum, entry) => sum + calculateTotalEarnings(entry), 0) / last30Days.length;
    
    if (earnings > avgEarnings * 1.1) {
      factors.push({ type: 'positive', text: `Above average earnings (+${((earnings / avgEarnings - 1) * 100).toFixed(0)}%)` });
    } else if (earnings < avgEarnings * 0.9) {
      factors.push({ type: 'negative', text: `Below average earnings (-${((1 - earnings / avgEarnings) * 100).toFixed(0)}%)` });
    }

    const sectionData = sectionStats.find(s => s.section === shift.section?.toString());
    if (sectionData && sectionStats.indexOf(sectionData) < sectionStats.length / 2) {
      factors.push({ type: 'positive', text: `Section ${shift.section} is one of your better performers` });
    }

    if (shift.guestCount && shift.guestCount < 8) {
      factors.push({ type: 'positive', text: 'Lower guest count often leads to better service quality' });
    } else if (shift.guestCount && shift.guestCount > 15) {
      factors.push({ type: 'negative', text: 'High guest count can impact service quality' });
    }

    if (shift.moodRating && shift.moodRating >= 4) {
      factors.push({ type: 'positive', text: 'Great mood typically correlates with higher earnings' });
    } else if (shift.moodRating && shift.moodRating <= 2) {
      factors.push({ type: 'negative', text: 'Low mood may have impacted performance' });
    }

    return factors;
  };

  const recentShiftFactors = mostRecentShift ? getPerformanceFactors(mostRecentShift) : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-6 w-6" />
            Insights
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Smart recommendations based on your last 30 days ({last30Days.length} shifts)
          </p>
        </CardHeader>
      </Card>

      {/* 1. Shift Performance Breakdown */}
      {mostRecentShift && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Recent Shift Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 border rounded-lg">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="font-medium">
                    {format(mostRecentShift.date, 'EEEE, MMM d')} - {mostRecentShift.shift} Shift
                  </p>
                  <p className="text-sm text-muted-foreground">Section {mostRecentShift.section}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold">${calculateTotalEarnings(mostRecentShift).toFixed(0)}</p>
                  <p className="text-sm text-muted-foreground">Total earnings</p>
                </div>
              </div>
              
              {recentShiftFactors.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Performance factors:</p>
                  {recentShiftFactors.map((factor, index) => (
                    <div key={index} className={`flex items-center gap-2 text-sm ${
                      factor.type === 'positive' ? 'text-green-700' : 'text-red-700'
                    }`}>
                      {factor.type === 'positive' ? 
                        <CheckCircle className="h-4 w-4" /> : 
                        <AlertTriangle className="h-4 w-4" />
                      }
                      {factor.text}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 2. Recommended Sections */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Recommended Sections
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {sectionStats.slice(0, 4).map((section, index) => (
            <div key={section.section} className="flex justify-between items-center p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  index === 0 ? 'bg-yellow-100 text-yellow-800' :
                  index === 1 ? 'bg-gray-100 text-gray-800' :
                  index === 2 ? 'bg-orange-100 text-orange-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {index + 1}
                </div>
                <div>
                  <p className="font-medium">Section {section.section}</p>
                  <p className="text-sm text-muted-foreground">{section.count} shifts worked</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold">${section.avgEarningsPerHour.toFixed(0)}/hr</p>
                <p className="text-sm text-muted-foreground">{section.avgTipPercentage.toFixed(1)}% tip rate</p>
                {section.avgMood && (
                  <p className="text-xs text-muted-foreground">😊 {section.avgMood.toFixed(1)}/5</p>
                )}
              </div>
            </div>
          ))}
          
          {sectionStats.length > 1 && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm font-medium text-blue-800">
                💡 You earn {((sectionStats[0].avgEarningsPerHour / sectionStats[sectionStats.length - 1].avgEarningsPerHour - 1) * 100).toFixed(0)}% more per hour in Section {sectionStats[0].section} vs Section {sectionStats[sectionStats.length - 1].section}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 3. Smart Shift Suggestions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Smart Shift Suggestions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3">
            {dayShiftStats.slice(0, 3).map((combo, index) => (
              <div key={combo.key} className="flex justify-between items-center p-3 bg-green-50 border border-green-200 rounded-lg">
                <div>
                  <p className="font-medium">{combo.dayName} {combo.shiftType}</p>
                  <p className="text-sm text-muted-foreground">{combo.count} shifts worked</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-700">${combo.avgEarnings.toFixed(0)}</p>
                  <p className="text-sm text-green-600">avg earnings</p>
                </div>
              </div>
            ))}
          </div>

          {missedOpportunities.length > 0 && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm font-medium text-yellow-800 mb-2">Untapped opportunities:</p>
              <div className="grid grid-cols-2 gap-2">
                {missedOpportunities.slice(0, 4).map(combo => {
                  const [day, shift] = combo.split('-');
                  return (
                    <p key={combo} className="text-sm text-yellow-700">
                      {day} {shift}
                    </p>
                  );
                })}
              </div>
              <p className="text-xs text-yellow-600 mt-2">
                Try picking up one of these shift types to discover new earning potential
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 4. Change-It-Up Recommendations */}
      {(consecutiveShiftType || consecutiveSection) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shuffle className="h-5 w-5" />
              Change-It-Up Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {consecutiveShiftType && (
              <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <p className="text-sm font-medium text-orange-800">
                  🔄 You've worked {mostRecentShift?.shift} shifts recently
                </p>
                <p className="text-sm text-orange-700 mt-1">
                  Consider trying a different shift type to reset and potentially discover new earning patterns
                </p>
              </div>
            )}
            
            {consecutiveSection && (
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <p className="text-sm font-medium text-purple-800">
                  📍 You've been working Section {mostRecentShift?.section} frequently
                </p>
                <p className="text-sm text-purple-700 mt-1">
                  Try rotating to {sectionStats.find(s => s.section !== mostRecentShift?.section?.toString())?.section ? `Section ${sectionStats.find(s => s.section !== mostRecentShift?.section?.toString())?.section}` : 'a different section'} for variety
                </p>
              </div>
            )}

            {recentGuestCount > avgGuestCount * 1.2 && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm font-medium text-blue-800">
                  👥 Recent guest counts have been high ({recentGuestCount} vs {avgGuestCount.toFixed(0)} avg)
                </p>
                <p className="text-sm text-blue-700 mt-1">
                  Consider requesting a slower section to focus on service quality
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* 5. Insights Feed */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Quick Tips
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {dayShiftStats[0] && (
            <div className="p-3 bg-gradient-to-r from-green-50 to-blue-50 border rounded-lg">
              <p className="text-sm font-medium">
                🏆 {dayShiftStats[0].dayName} {dayShiftStats[0].shiftType} shifts are your top earners — try grabbing one this week!
              </p>
            </div>
          )}
          
          {sectionStats[0] && sectionStats[0].avgMood && sectionStats[0].avgMood > 4 && (
            <div className="p-3 bg-gradient-to-r from-yellow-50 to-green-50 border rounded-lg">
              <p className="text-sm font-medium">
                😊 Section {sectionStats[0].section} correlates with higher mood ratings ({sectionStats[0].avgMood.toFixed(1)}/5)
              </p>
            </div>
          )}
          
          {sectionStats.length > 1 && (
            <div className="p-3 bg-gradient-to-r from-orange-50 to-red-50 border rounded-lg">
              <p className="text-sm font-medium">
                📊 Section {sectionStats[sectionStats.length - 1].section} underperforms — consider switching when possible
              </p>
            </div>
          )}

          <div className="p-3 bg-gradient-to-r from-purple-50 to-pink-50 border rounded-lg">
            <p className="text-sm font-medium">
              💡 Based on {last30Days.length} recent shifts, your earning patterns show clear optimization opportunities
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};