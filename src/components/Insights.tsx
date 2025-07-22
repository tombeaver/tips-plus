import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, Calendar, MapPin, Lightbulb, DollarSign, Clock, Heart, Target, BarChart3, PieChart, Download, TrendingDown } from 'lucide-react';
import { format, getDay, isAfter, startOfWeek } from 'date-fns';
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

    // 1. Mood vs Earnings Analysis
    const moodAnalysis = realEntries
      .filter(entry => entry.moodRating)
      .reduce((acc, entry) => {
        const mood = entry.moodRating!;
        const earnings = calculateTotalEarnings(entry);
        const tips = calculateTips(entry);
        
        if (!acc[mood]) {
          acc[mood] = { totalEarnings: 0, totalTips: 0, count: 0, entries: [] };
        }
        acc[mood].totalEarnings += earnings;
        acc[mood].totalTips += tips;
        acc[mood].count += 1;
        acc[mood].entries.push(entry);
        return acc;
      }, {} as { [key: number]: { totalEarnings: number; totalTips: number; count: number; entries: TipEntry[] } });

    const moodStats = Object.entries(moodAnalysis).map(([mood, stats]) => ({
      mood: parseInt(mood),
      avgEarnings: stats.totalEarnings / stats.count,
      avgTips: stats.totalTips / stats.count,
      count: stats.count,
      totalEarnings: stats.totalEarnings
    })).sort((a, b) => b.avgEarnings - a.avgEarnings);

    // 2. Shift Type Performance (AM/PM/Double)
    const shiftAnalysis = realEntries.reduce((acc, entry) => {
      const shift = entry.shift || 'PM';
      const earnings = calculateTotalEarnings(entry);
      const tips = calculateTips(entry);
      const hourlyRate = earnings / (entry.hoursWorked || 1);
      
      if (!acc[shift]) {
        acc[shift] = { totalEarnings: 0, totalTips: 0, totalHours: 0, count: 0 };
      }
      acc[shift].totalEarnings += earnings;
      acc[shift].totalTips += tips;
      acc[shift].totalHours += entry.hoursWorked || 0;
      acc[shift].count += 1;
      return acc;
    }, {} as { [key: string]: { totalEarnings: number; totalTips: number; totalHours: number; count: number } });

    const shiftStats = Object.entries(shiftAnalysis).map(([shift, stats]) => ({
      shift,
      avgEarnings: stats.totalEarnings / stats.count,
      avgTips: stats.totalTips / stats.count,
      avgHourlyRate: stats.totalEarnings / stats.totalHours,
      count: stats.count
    })).sort((a, b) => b.avgEarnings - a.avgEarnings);

    // 3. Day of Week Analysis
    const dayAnalysis = realEntries.reduce((acc, entry) => {
      const dayOfWeek = getDay(entry.date);
      const earnings = calculateTotalEarnings(entry);
      const tips = calculateTips(entry);
      
      if (!acc[dayOfWeek]) {
        acc[dayOfWeek] = { totalEarnings: 0, totalTips: 0, count: 0, shifts: { AM: 0, PM: 0, Double: 0 } };
      }
      acc[dayOfWeek].totalEarnings += earnings;
      acc[dayOfWeek].totalTips += tips;
      acc[dayOfWeek].count += 1;
      acc[dayOfWeek].shifts[entry.shift || 'PM'] += 1;
      return acc;
    }, {} as { [key: number]: { totalEarnings: number; totalTips: number; count: number; shifts: { AM: number; PM: number; Double: number } } });

    const dayStats = Object.entries(dayAnalysis).map(([day, stats]) => ({
      day: parseInt(day),
      dayName: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][parseInt(day)],
      avgEarnings: stats.totalEarnings / stats.count,
      avgTips: stats.totalTips / stats.count,
      count: stats.count,
      shifts: stats.shifts
    })).sort((a, b) => b.avgEarnings - a.avgEarnings);

    // 5. Cash vs Credit Analysis
    const totalCash = realEntries.reduce((sum, entry) => sum + (entry.cashTips || 0), 0);
    const totalCredit = realEntries.reduce((sum, entry) => sum + (entry.creditTips || 0), 0);
    const totalTips = totalCash + totalCredit;
    const cashPercentage = totalTips > 0 ? (totalCash / totalTips) * 100 : 0;

    // 6. Next Shift Prediction
    const today = new Date();
    const todayDayOfWeek = getDay(today);
    const todayStats = dayStats.find(d => d.day === todayDayOfWeek);
    
    // 7. Wage vs Tip Breakdown
    const totalWages = realEntries.reduce((sum, entry) => sum + ((entry.hoursWorked || 0) * (entry.hourlyRate || 0)), 0);
    const totalTipsAmount = realEntries.reduce((sum, entry) => sum + calculateTips(entry), 0);
    const totalEarnings = totalWages + totalTipsAmount;
    const wagePercentage = totalEarnings > 0 ? (totalWages / totalEarnings) * 100 : 0;
    const tipPercentage = totalEarnings > 0 ? (totalTipsAmount / totalEarnings) * 100 : 0;

    return {
      moodStats,
      shiftStats,
      dayStats,
      cashPercentage,
      creditPercentage: 100 - cashPercentage,
      todayStats,
      wagePercentage,
      tipPercentage,
      totalEntries: realEntries.length,
      totalEarnings,
      totalTipsAmount,
      totalWages
    };
  }, [tipEntries, selectedDate]);

  if (!insightsData) {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Detailed Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Keep logging your shifts! Detailed insights will appear after you have at least 3 entries.
          </p>
        </CardContent>
      </Card>
    );
  }

  const { moodStats, shiftStats, dayStats, cashPercentage, creditPercentage, todayStats, wagePercentage, tipPercentage, totalEarnings, totalTipsAmount, totalWages } = insightsData;

  const bestMood = moodStats[0];
  const bestShift = shiftStats[0];
  const bestDay = dayStats[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-6 w-6" />
            Insights
          </CardTitle>
          <p className="body-md text-muted-foreground">Comprehensive insights from your {insightsData.totalEntries} logged shifts</p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Next Shift Prediction */}
          {todayStats && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-2">Today's Shift Prediction</h4>
              <p className="text-sm text-blue-700">
                Based on your past {todayStats.count} {todayStats.dayName} shifts, you typically earn ${todayStats.avgEarnings.toFixed(0)} in total earnings.
              </p>
              {bestShift && (
                <p className="text-xs text-blue-600 mt-1">
                  Tip: {bestShift.shift} shifts tend to be your most profitable overall.
                </p>
              )}
            </div>
          )}

          {/* Shift Match Score */}
          {bestDay && bestShift && (
            <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <h4 className="font-medium text-purple-800 mb-2">Your Best-Fit Shifts</h4>
              <p className="text-sm text-purple-700">
                For maximum earnings: {bestDay.dayName} {bestShift.shift} shifts
              </p>
              <div className="flex gap-2 mt-2">
                <Badge variant="secondary" className="text-xs">
                  ${bestDay.avgEarnings.toFixed(0)} avg day
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  ${bestShift.avgEarnings.toFixed(0)} avg shift
                </Badge>
              </div>
            </div>
          )}

          {/* Best Days */}
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <h4 className="font-medium text-green-800 mb-2">Best Days to Work</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {dayStats.slice(0, 4).map((day, index) => (
                <div key={day.day} className="text-center p-2 bg-white rounded">
                  <div className="text-sm font-medium">{day.dayName}</div>
                  <div className="text-xs text-green-700">${day.avgEarnings.toFixed(0)}</div>
                  <div className="text-xs text-muted-foreground">{day.count} shifts</div>
                </div>
              ))}
            </div>
            {bestDay && (
              <p className="text-sm text-green-700 mt-3">
                You average {((bestDay.avgEarnings / dayStats[dayStats.length - 1]?.avgEarnings - 1) * 100 || 0).toFixed(0)}% higher earnings on {bestDay.dayName}s.
              </p>
            )}
          </div>
        </CardContent>
      </Card>


      {/* Mood vs Earnings */}
      {moodStats.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5" />
              Mood vs Earnings Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {bestMood && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm font-medium text-green-800">
                  You earn the most when feeling good! On {bestMood.mood}/5 days, you average ${bestMood.avgEarnings.toFixed(0)} total earnings.
                </p>
                <p className="text-xs text-green-600 mt-1">
                  Morale matters — you've worked {bestMood.count} shifts at this mood level.
                </p>
              </div>
            )}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              {moodStats.map(mood => (
                <div key={mood.mood} className="text-center p-2 bg-muted/50 rounded">
                  <div className="text-lg font-bold">{mood.mood}/5</div>
                  <div className="text-xs text-muted-foreground">${mood.avgEarnings.toFixed(0)}</div>
                  <div className="text-xs text-muted-foreground">{mood.count} shifts</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Shift Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Performance by Shift Type
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {shiftStats.map(shift => (
            <div key={shift.shift} className="flex justify-between items-center p-3 bg-muted/30 rounded">
              <div>
                <div className="font-medium">{shift.shift} Shifts</div>
                <div className="text-xs text-muted-foreground">{shift.count} worked</div>
              </div>
              <div className="text-right">
                <div className="font-bold">${shift.avgEarnings.toFixed(0)}</div>
                <div className="text-xs text-muted-foreground">${shift.avgHourlyRate.toFixed(0)}/hr</div>
              </div>
            </div>
          ))}
          {bestShift && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg mt-3">
              <p className="text-sm font-medium text-blue-800">
                {bestShift.shift} shifts are your most profitable at ${bestShift.avgEarnings.toFixed(0)} average earnings
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment & Earnings Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Cash vs Credit */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Cash vs Credit Tips
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Cash Tips</span>
                <span>{cashPercentage.toFixed(1)}%</span>
              </div>
              <Progress value={cashPercentage} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Credit Tips</span>
                <span>{creditPercentage.toFixed(1)}%</span>
              </div>
              <Progress value={creditPercentage} className="h-2" />
            </div>
            <div className="text-xs text-muted-foreground">
              Helpful for planning cash-on-hand needs and payout timing
            </div>
          </CardContent>
        </Card>

        {/* Wage vs Tips */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Wage vs Tip Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="p-3 bg-green-50 rounded">
                <div className="text-2xl font-bold text-green-700">${totalTipsAmount.toFixed(0)}</div>
                <div className="text-xs text-green-600">Total Tips ({tipPercentage.toFixed(0)}%)</div>
              </div>
              <div className="p-3 bg-blue-50 rounded">
                <div className="text-2xl font-bold text-blue-700">${totalWages.toFixed(0)}</div>
                <div className="text-xs text-blue-600">Total Wages ({wagePercentage.toFixed(0)}%)</div>
              </div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold">${totalEarnings.toFixed(0)}</div>
              <div className="text-xs text-muted-foreground">Total Earnings</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};