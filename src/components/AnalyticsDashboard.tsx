
import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { TrendingUp, DollarSign, Users, Percent, Calendar, HandCoins, Clock, CalendarRange, Banknote, CreditCard, Wine, ShoppingBag } from 'lucide-react';
import { TipEntry } from '@/hooks/useTipEntries';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, subMonths, subDays, isWithinInterval, getDay, getYear, addWeeks, differenceInCalendarWeeks } from 'date-fns';
import { MetricDetailModal, MetricType } from './MetricDetailModal';

interface AnalyticsDashboardProps {
  tipEntries: TipEntry[];
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ tipEntries }) => {
  const [periodType, setPeriodType] = useState<'all' | 'week' | 'month' | 'year'>(() => {
    const saved = localStorage.getItem('analytics-period-type');
    return (saved as 'all' | 'week' | 'month' | 'year') || 'all';
  });
  const [selectedPeriod, setSelectedPeriod] = useState(() => {
    return localStorage.getItem('analytics-selected-period') || '';
  });
  const [selectedMetric, setSelectedMetric] = useState<MetricType | null>(null);
  
  const realEntries = tipEntries.filter(entry => !entry.isPlaceholder);
  
  // Week starts on Sunday.
  // Week numbering is constrained to 1–52 per calendar year:
  // - Week 1 = first *full* Sunday-starting week in the year
  // - The final partial week that crosses into next year is counted as Week 52
  const getWeekKey = (date: Date) => {
    const weekStart = startOfWeek(date, { weekStartsOn: 0 });
    const year = getYear(weekStart);

    // First Sunday on/after Jan 1 (i.e., first full Sunday-starting week)
    let firstSunday = startOfWeek(new Date(year, 0, 1), { weekStartsOn: 0 });
    if (getYear(firstSunday) < year) firstSunday = addWeeks(firstSunday, 1);

    const rawWeek = differenceInCalendarWeeks(weekStart, firstSunday, { weekStartsOn: 0 }) + 1;
    const week = Math.min(52, Math.max(1, rawWeek));

    return `${year}-W${String(week).padStart(2, '0')}`;
  };

  // Helper to get month key based on the Sunday that starts the entry's week
  const getMonthKeyBySunday = (date: Date) => {
    const weekStart = startOfWeek(date, { weekStartsOn: 0 });
    return format(weekStart, 'yyyy-MM');
  };

  // Get available options based on period type
  const availableOptions = useMemo(() => {
    const now = new Date();
    
    if (periodType === 'all') {
      return [];
    } else if (periodType === 'week') {
      // Use year-week key to properly distinguish weeks across years
      const weekKeys = new Set(realEntries.map(entry => getWeekKey(entry.date)));
      return Array.from(weekKeys).sort((a, b) => b.localeCompare(a)).map(weekKey => {
        const [year, weekPart] = weekKey.split('-W');
        const weekNum = parseInt(weekPart, 10);
        return {
          value: weekKey,
          label: `Week ${weekNum}, ${year}`
        };
      });
    } else if (periodType === 'month') {
      // Group by the month of the week's Sunday start date
      const months = new Set(realEntries.map(entry => getMonthKeyBySunday(entry.date)));
      return Array.from(months).sort((a, b) => b.localeCompare(a)).map(month => {
        // Parse in local timezone to avoid UTC offset issues
        const [year, monthNum] = month.split('-').map(Number);
        const monthDate = new Date(year, monthNum - 1, 1);
        return {
          value: month,
          label: format(monthDate, 'MMMM yyyy')
        };
      });
    } else {
      const years = new Set(realEntries.map(entry => getYear(entry.date)));
      return Array.from(years).sort((a, b) => b - a).map(year => ({
        value: year.toString(),
        label: year.toString()
      }));
    }
  }, [realEntries, periodType]);

  // Save to localStorage when period type changes
  React.useEffect(() => {
    localStorage.setItem('analytics-period-type', periodType);
  }, [periodType]);

  // Save to localStorage when selected period changes
  React.useEffect(() => {
    localStorage.setItem('analytics-selected-period', selectedPeriod);
  }, [selectedPeriod]);

  // Set default period when period type changes
  React.useEffect(() => {
    if (periodType === 'all') {
      setSelectedPeriod('');
    } else if (availableOptions.length > 0) {
      // Check if current selectedPeriod is valid for this period type
      const isValidPeriod = availableOptions.some(option => option.value === selectedPeriod);
      
      if (!selectedPeriod || !isValidPeriod) {
        const now = new Date();
        if (periodType === 'week') {
          setSelectedPeriod(getWeekKey(now));
        } else if (periodType === 'month') {
          setSelectedPeriod(getMonthKeyBySunday(now));
        } else {
          setSelectedPeriod(now.getFullYear().toString());
        }
      }
    }
  }, [periodType, availableOptions]);

  // Filter entries based on selected period
  const filteredEntries = useMemo(() => {
    if (periodType === 'all' || !selectedPeriod) return realEntries;
    
    if (periodType === 'week') {
      // Filter by year-week key
      return realEntries.filter(entry => getWeekKey(entry.date) === selectedPeriod);
    } else if (periodType === 'month') {
      // Filter by the month of the week's Sunday start date
      return realEntries.filter(entry => getMonthKeyBySunday(entry.date) === selectedPeriod);
    } else {
      const year = parseInt(selectedPeriod);
      return realEntries.filter(entry => getYear(entry.date) === year);
    }
  }, [realEntries, periodType, selectedPeriod]);

  const getTimeFrameLabel = () => {
    if (periodType === 'all') return 'All Time';
    if (!selectedPeriod) return 'Select a period';
    
    const option = availableOptions.find(opt => opt.value === selectedPeriod);
    return option ? option.label : selectedPeriod;
  };

  const stats = useMemo(() => {
    if (filteredEntries.length === 0) {
      return {
        totalTips: 0,
        totalCashTips: 0,
        totalCreditTips: 0,
        totalSales: 0,
        totalAlcoholSales: 0,
        totalMiscSales: 0,
        totalEarnings: 0,
        averageTipPercentage: 0,
        averagePerGuest: 0,
        totalGuests: 0,
        tipsPerHour: 0,
        earningsPerHour: 0,
        totalHours: 0,
        shiftsWorked: 0,
        hasAlcoholData: false,
        hasMiscData: false
      };
    }

    const totalCashTips = filteredEntries.reduce((sum, entry) => sum + entry.cashTips, 0);
    const totalCreditTips = filteredEntries.reduce((sum, entry) => sum + entry.creditTips, 0);
    const totalTips = totalCashTips + totalCreditTips;
    const totalSales = filteredEntries.reduce((sum, entry) => sum + entry.totalSales, 0);
    const totalAlcoholSales = filteredEntries.reduce((sum, entry) => sum + (entry.alcoholSales || 0), 0);
    const totalMiscSales = filteredEntries.reduce((sum, entry) => sum + (entry.salesBreakdown?.misc || 0), 0);
    const totalGuests = filteredEntries.reduce((sum, entry) => sum + entry.guestCount, 0);
    const totalHours = filteredEntries.reduce((sum, entry) => sum + entry.hoursWorked, 0);
    const totalWages = filteredEntries.reduce((sum, entry) => sum + (entry.hoursWorked * entry.hourlyRate), 0);
    const totalEarnings = totalTips + totalWages;
    
    // Check if any entry has alcohol or misc sales data
    const hasAlcoholData = filteredEntries.some(entry => entry.alcoholSales && entry.alcoholSales > 0);
    const hasMiscData = filteredEntries.some(entry => entry.salesBreakdown?.misc && entry.salesBreakdown.misc > 0);
    
    // Count doubles as 2 shifts for averaging
    const shiftsWorked = filteredEntries.reduce((sum, entry) => {
      return sum + (entry.shift === 'Double' ? 2 : 1);
    }, 0);
    
    return {
      totalTips,
      totalCashTips,
      totalCreditTips,
      totalSales,
      totalAlcoholSales,
      totalMiscSales,
      totalEarnings,
      averageTipPercentage: totalSales > 0 ? (totalTips / totalSales) * 100 : 0,
      averagePerGuest: totalGuests > 0 ? totalTips / totalGuests : 0,
      totalGuests,
      shiftsWorked,
      tipsPerHour: totalHours > 0 ? totalTips / totalHours : 0,
      earningsPerHour: totalHours > 0 ? totalEarnings / totalHours : 0,
      totalHours,
      hasAlcoholData,
      hasMiscData
    };
  }, [filteredEntries]);

  const sectionStats = useMemo(() => {
    const sectionMap = new Map();
    
    filteredEntries.forEach(entry => {
      const totalEarnings = entry.creditTips + entry.cashTips + (entry.hoursWorked * entry.hourlyRate);
      // Count doubles as 2 shifts
      const shiftCount = entry.shift === 'Double' ? 2 : 1;
      
      const existing = sectionMap.get(entry.section) || {
        section: entry.section,
        totalTips: 0,
        totalSales: 0,
        totalGuests: 0,
        totalEarnings: 0,
        shifts: 0
      };
      
      sectionMap.set(entry.section, {
        ...existing,
        totalTips: existing.totalTips + entry.creditTips + entry.cashTips,
        totalSales: existing.totalSales + entry.totalSales,
        totalGuests: existing.totalGuests + entry.guestCount,
        totalEarnings: existing.totalEarnings + totalEarnings,
        shifts: existing.shifts + shiftCount
      });
    });

    return Array.from(sectionMap.values()).map(section => ({
      ...section,
      averageTipPercentage: section.totalSales > 0 ? (section.totalTips / section.totalSales) * 100 : 0,
      averagePerGuest: section.totalGuests > 0 ? section.totalTips / section.totalGuests : 0,
      averageEarningsPerShift: section.shifts > 0 ? section.totalEarnings / section.shifts : 0
    })).sort((a, b) => b.averageEarningsPerShift - a.averageEarningsPerShift);
  }, [filteredEntries]);

  const dayStats = useMemo(() => {
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayMap = new Map();

    filteredEntries.forEach(entry => {
      const dayIndex = getDay(entry.date);
      const dayName = dayNames[dayIndex];
      const totalEarnings = entry.creditTips + entry.cashTips + (entry.hoursWorked * entry.hourlyRate);
      // Count doubles as 2 shifts
      const shiftCount = entry.shift === 'Double' ? 2 : 1;
      
      const existing = dayMap.get(dayName) || {
        day: dayName,
        dayIndex,
        totalTips: 0,
        totalSales: 0,
        totalGuests: 0,
        totalEarnings: 0,
        shifts: 0
      };
      
      dayMap.set(dayName, {
        ...existing,
        totalTips: existing.totalTips + entry.creditTips + entry.cashTips,
        totalSales: existing.totalSales + entry.totalSales,
        totalGuests: existing.totalGuests + entry.guestCount,
        totalEarnings: existing.totalEarnings + totalEarnings,
        shifts: existing.shifts + shiftCount
      });
    });

    return Array.from(dayMap.values()).map(day => ({
      ...day,
      averageTipPercentage: day.totalSales > 0 ? (day.totalTips / day.totalSales) * 100 : 0,
      averagePerGuest: day.totalGuests > 0 ? day.totalTips / day.totalGuests : 0,
      averageEarningsPerShift: day.shifts > 0 ? day.totalEarnings / day.shifts : 0
    })).sort((a, b) => b.averageEarningsPerShift - a.averageEarningsPerShift);
  }, [filteredEntries]);

  const trendData = useMemo(() => {
    if (periodType === 'all') {
      // Yearly trend
      const years = new Map();
      filteredEntries.forEach(entry => {
        const yearKey = getYear(entry.date).toString();
        const existing = years.get(yearKey) || { period: yearKey, tips: 0, wages: 0, sales: 0, guests: 0, hours: 0, date: new Date(parseInt(yearKey), 0, 1) };
        const entryWages = entry.hoursWorked * entry.hourlyRate;
        years.set(yearKey, {
          ...existing,
          tips: existing.tips + entry.creditTips + entry.cashTips,
          wages: existing.wages + entryWages,
          sales: existing.sales + entry.totalSales,
          guests: existing.guests + entry.guestCount,
          hours: existing.hours + entry.hoursWorked
        });
      });
      return Array.from(years.values()).map(item => ({
        ...item,
        total: item.tips + item.wages
      })).sort((a, b) => a.date.getTime() - b.date.getTime());
    } else if (periodType === 'year') {
      // Monthly trend for selected year
      const months = new Map();
      filteredEntries.forEach(entry => {
        const monthKey = format(entry.date, 'MMM yyyy');
        const monthStart = startOfMonth(entry.date);
        const existing = months.get(monthKey) || { period: monthKey, tips: 0, wages: 0, sales: 0, guests: 0, hours: 0, date: monthStart };
        const entryWages = entry.hoursWorked * entry.hourlyRate;
        months.set(monthKey, {
          ...existing,
          tips: existing.tips + entry.creditTips + entry.cashTips,
          wages: existing.wages + entryWages,
          sales: existing.sales + entry.totalSales,
          guests: existing.guests + entry.guestCount,
          hours: existing.hours + entry.hoursWorked
        });
      });
      return Array.from(months.values()).map(item => ({
        ...item,
        total: item.tips + item.wages
      })).sort((a, b) => a.date.getTime() - b.date.getTime());
    } else if (periodType === 'month') {
      // Weekly trend for selected month
      const weeks = new Map();
      filteredEntries.forEach(entry => {
        // Use Sunday as start of week, stay in local time
        const weekStart = startOfWeek(entry.date, { weekStartsOn: 0 });
        const weekKey = format(weekStart, 'MMM d');
        console.log('Week calculation:', {
          entryDate: entry.date.toString(),
          entryDateLocal: `${entry.date.getFullYear()}-${entry.date.getMonth()+1}-${entry.date.getDate()}`,
          weekStart: weekStart.toString(),
          weekStartLocal: `${weekStart.getFullYear()}-${weekStart.getMonth()+1}-${weekStart.getDate()}`,
          weekKey
        });
        const existing = weeks.get(weekKey) || { period: weekKey, tips: 0, wages: 0, sales: 0, guests: 0, hours: 0, date: weekStart };
        const entryWages = entry.hoursWorked * entry.hourlyRate;
        weeks.set(weekKey, {
          ...existing,
          tips: existing.tips + entry.creditTips + entry.cashTips,
          wages: existing.wages + entryWages,
          sales: existing.sales + entry.totalSales,
          guests: existing.guests + entry.guestCount,
          hours: existing.hours + entry.hoursWorked
        });
      });
      return Array.from(weeks.values()).map(item => ({
        ...item,
        total: item.tips + item.wages
      })).sort((a, b) => a.date.getTime() - b.date.getTime());
    } else {
      // Daily trend for selected week
      const days = new Map();
      filteredEntries.forEach(entry => {
        const dayKey = format(entry.date, 'MMM d');
        const existing = days.get(dayKey) || { period: dayKey, tips: 0, wages: 0, sales: 0, guests: 0, hours: 0, date: entry.date };
        const entryWages = entry.hoursWorked * entry.hourlyRate;
        days.set(dayKey, {
          ...existing,
          tips: existing.tips + entry.creditTips + entry.cashTips,
          wages: existing.wages + entryWages,
          sales: existing.sales + entry.totalSales,
          guests: existing.guests + entry.guestCount,
          hours: existing.hours + entry.hoursWorked
        });
      });
      return Array.from(days.values()).map(item => ({
        ...item,
        total: item.tips + item.wages
      })).sort((a, b) => a.date.getTime() - b.date.getTime());
    }
  }, [filteredEntries, periodType]);

  const getTrendTitle = () => {
    if (periodType === 'all') return 'Yearly Tips Trend';
    if (periodType === 'year') return 'Monthly Tips Trend';
    if (periodType === 'month') return 'Weekly Tips Trend';
    return 'Daily Tips Trend';
  };

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];


  return (
    <div className="space-y-4">
      {/* Header and Filter Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-6 w-6" />
            Analytics
          </CardTitle>
          <p className="body-md text-muted-foreground">
            Viewing data for: {getTimeFrameLabel()}
          </p>
          <div id="analytics-period-selector" className="flex items-center gap-2 mt-4">
            <Select value={periodType} onValueChange={(value: 'all' | 'week' | 'month' | 'year') => setPeriodType(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="week">Week</SelectItem>
                <SelectItem value="month">Month</SelectItem>
                <SelectItem value="year">Year</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod} disabled={periodType === 'all'}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder={periodType === 'all' ? 'All time data' : `Select ${periodType}`} />
              </SelectTrigger>
              <SelectContent>
                {availableOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
      </Card>

      {filteredEntries.length === 0 ? (
        <div className="text-center py-16">
          <TrendingUp className="h-16 w-16 text-muted-foreground/50 mx-auto mb-6" />
          <h3 className="text-xl font-medium text-muted-foreground mb-2">No data available for {getTimeFrameLabel()}</h3>
          <p className="text-muted-foreground/70">Try selecting a different time period or add some tip entries</p>
        </div>
      ) : (
        <>
          {/* Total Earnings Card with Stack Bar Chart */}
          <Card 
            id="analytics-charts"
            className="bg-gradient-to-r from-emerald-500 to-emerald-600 cursor-pointer hover:shadow-lg transition-shadow active:scale-[0.99]"
            onClick={() => setSelectedMetric('totalEarnings')}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-white/80 text-lg">Total Earnings</p>
                  <p className="text-4xl font-bold text-white">${stats.totalEarnings.toFixed(2)}</p>
                  <div className="flex items-center gap-4 mt-2">
                    <p className="text-white/70 text-sm">
                      Tips + Wages for {getTimeFrameLabel()}
                    </p>
                    <p className="text-white/80 text-sm font-medium">
                      {stats.averageTipPercentage.toFixed(1)}% avg tip
                    </p>
                  </div>
                </div>
                <div className="text-white/80">
                  <DollarSign className="h-12 w-12" />
                </div>
              </div>
              
              {/* Monochromatic Stack Bar Chart - Non-interactive */}
              <div className="h-48 pointer-events-none">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.2)" />
                    <XAxis dataKey="period" stroke="rgba(255,255,255,0.8)" fontSize={12} />
                    <YAxis stroke="rgba(255,255,255,0.8)" fontSize={12} />
                    <Bar dataKey="tips" stackId="earnings" fill="rgba(255,255,255,0.9)" name="tips" />
                    <Bar dataKey="wages" stackId="earnings" fill="rgba(255,255,255,0.6)" name="wages" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Highlight Cards: Average Hourly Rate and Average Daily Income */}
          <div className="grid grid-cols-2 gap-4">
            <Card 
              className="bg-gradient-to-br from-blue-500 to-blue-600 cursor-pointer hover:shadow-lg transition-shadow active:scale-[0.99]"
              onClick={() => setSelectedMetric('avgHourlyRate')}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/80 text-sm font-medium">Avg Hourly Rate</p>
                    <p className="text-3xl font-bold text-white">${stats.earningsPerHour.toFixed(2)}</p>
                    <p className="text-white/70 text-xs mt-1">
                      Total earnings ÷ Hours worked
                    </p>
                  </div>
                  <Clock className="h-10 w-10 text-white/80" />
                </div>
              </CardContent>
            </Card>
            
            <Card 
              className="bg-gradient-to-br from-purple-500 to-purple-600 cursor-pointer hover:shadow-lg transition-shadow active:scale-[0.99]"
              onClick={() => setSelectedMetric('avgDailyIncome')}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/80 text-sm font-medium">Avg Daily Income</p>
                    <p className="text-3xl font-bold text-white">
                      ${stats.shiftsWorked > 0 ? (stats.totalEarnings / stats.shiftsWorked).toFixed(2) : '0.00'}
                    </p>
                    <p className="text-white/70 text-xs mt-1">
                      Total earnings ÷ Days worked
                    </p>
                  </div>
                  <CalendarRange className="h-10 w-10 text-white/80" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Individual Metric Cards */}
          <div id="analytics-insights" className="grid grid-cols-2 gap-4">
            {stats.hasAlcoholData && (
              <Card 
                className="col-span-2 cursor-pointer hover:shadow-md transition-shadow active:scale-[0.99]"
                onClick={() => setSelectedMetric('totalAlcoholSales')}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Alcohol Sales</p>
                      <p className="text-xl font-bold text-rose-600">${stats.totalAlcoholSales.toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {stats.totalSales > 0 ? ((stats.totalAlcoholSales / stats.totalSales) * 100).toFixed(1) : 0}% of total sales
                      </p>
                    </div>
                    <Wine className="h-6 w-6 text-rose-600" />
                  </div>
                </CardContent>
              </Card>
            )}
            
            {stats.hasMiscData && (
              <Card 
                className="col-span-2 cursor-pointer hover:shadow-md transition-shadow active:scale-[0.99]"
                onClick={() => setSelectedMetric('totalMiscSales')}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Misc Sales</p>
                      <p className="text-xl font-bold text-amber-600">${stats.totalMiscSales.toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {stats.totalSales > 0 ? ((stats.totalMiscSales / stats.totalSales) * 100).toFixed(1) : 0}% of total sales
                      </p>
                    </div>
                    <ShoppingBag className="h-6 w-6 text-amber-600" />
                  </div>
                </CardContent>
              </Card>
            )}
            
            <Card
              className="cursor-pointer hover:shadow-md transition-shadow active:scale-[0.99]"
              onClick={() => setSelectedMetric('totalCashTips')}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Cash Tips</p>
                    <p className="text-xl font-bold text-emerald-600">${stats.totalCashTips.toFixed(2)}</p>
                  </div>
                  <Banknote className="h-6 w-6 text-emerald-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card 
              className="cursor-pointer hover:shadow-md transition-shadow active:scale-[0.99]"
              onClick={() => setSelectedMetric('totalCreditTips')}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Credit Tips</p>
                    <p className="text-xl font-bold text-blue-600">${stats.totalCreditTips.toFixed(2)}</p>
                  </div>
                  <CreditCard className="h-6 w-6 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card 
              className="cursor-pointer hover:shadow-md transition-shadow active:scale-[0.99]"
              onClick={() => setSelectedMetric('avgPerGuest')}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Avg per Guest</p>
                    <p className="text-xl font-bold text-orange-600">${stats.averagePerGuest.toFixed(2)}</p>
                  </div>
                  <Users className="h-6 w-6 text-orange-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card 
              className="cursor-pointer hover:shadow-md transition-shadow active:scale-[0.99]"
              onClick={() => setSelectedMetric('avgTipPercent')}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Avg Tip %</p>
                    <p className="text-xl font-bold text-purple-600">{stats.averageTipPercentage.toFixed(1)}%</p>
                  </div>
                  <Percent className="h-6 w-6 text-purple-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card 
              className="cursor-pointer hover:shadow-md transition-shadow active:scale-[0.99]"
              onClick={() => setSelectedMetric('totalShifts')}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Shifts</p>
                    <p className="text-xl font-bold text-slate-600">{stats.shiftsWorked}</p>
                  </div>
                  <Calendar className="h-6 w-6 text-slate-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card 
              className="cursor-pointer hover:shadow-md transition-shadow active:scale-[0.99]"
              onClick={() => setSelectedMetric('totalHours')}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Hours</p>
                    <p className="text-xl font-bold text-indigo-600">{stats.totalHours.toFixed(1)}</p>
                  </div>
                  <Clock className="h-6 w-6 text-indigo-600" />
                </div>
              </CardContent>
            </Card>
            
          </div>

          {/* Performance Analysis */}
          <Card id="analytics-insights">
            <CardHeader>
              <CardTitle className="text-lg">Performance Analysis</CardTitle>
              <CardDescription>Compare your earnings by section and day of week</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="sections" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="sections">By Section</TabsTrigger>
                  <TabsTrigger value="days">By Day</TabsTrigger>
                </TabsList>
                
                {/* Tips Distribution Chart */}
                <div className="mt-6 mb-6">
                  <TabsContent value="sections" className="mt-0">
                    {sectionStats.length > 1 && (
                      <div className="flex flex-col">
                        <div className="h-64">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={sectionStats}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ section, percent }) => `${section} ${(percent * 100).toFixed(0)}%`}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="averageEarningsPerShift"
                              >
                                {sectionStats.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                              </Pie>
                              <Tooltip formatter={(value) => [`$${value}`, 'Avg Earnings/Shift']} />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="days" className="mt-0">
                    {dayStats.length > 1 && (
                      <div className="flex flex-col">
                        <div className="h-64">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={dayStats}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ day, percent }) => `${day.slice(0, 3)} ${(percent * 100).toFixed(0)}%`}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="averageEarningsPerShift"
                              >
                                {dayStats.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                              </Pie>
                              <Tooltip formatter={(value) => [`$${value}`, 'Avg Earnings/Shift']} />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    )}
                  </TabsContent>
                </div>
                
                <TabsContent value="sections" className="mt-4">
                  <div className="space-y-4">
                    {sectionStats.map((section, index) => (
                      <div key={section.section} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">Section {section.section}</h4>
                          <span className="text-lg font-bold text-green-600">
                            ${section.averageEarningsPerShift.toFixed(2)}/shift
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-sm text-gray-600">
                          <div>
                            <span className="block">Avg Tip %</span>
                            <span className="font-medium">{section.averageTipPercentage.toFixed(1)}%</span>
                          </div>
                          <div>
                            <span className="block">Per Guest</span>
                            <span className="font-medium">${section.averagePerGuest.toFixed(2)}</span>
                          </div>
                          <div>
                            <span className="block">Shifts</span>
                            <span className="font-medium">{section.shifts}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="days" className="mt-4">
                  <div className="space-y-4">
                    {dayStats.map((day, index) => (
                      <div key={day.day} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            {day.day}
                          </h4>
                          <span className="text-lg font-bold text-green-600">
                            ${day.averageEarningsPerShift.toFixed(2)}/shift
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-sm text-gray-600">
                          <div>
                            <span className="block">Avg Tip %</span>
                            <span className="font-medium">{day.averageTipPercentage.toFixed(1)}%</span>
                          </div>
                          <div>
                            <span className="block">Per Guest</span>
                            <span className="font-medium">${day.averagePerGuest.toFixed(2)}</span>
                          </div>
                          <div>
                            <span className="block">Shifts</span>
                            <span className="font-medium">{day.shifts}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </>
      )}

      <MetricDetailModal
        isOpen={selectedMetric !== null}
        onClose={() => setSelectedMetric(null)}
        metricType={selectedMetric}
        filteredEntries={filteredEntries}
        timeFrameLabel={getTimeFrameLabel()}
      />
    </div>
  );
};
