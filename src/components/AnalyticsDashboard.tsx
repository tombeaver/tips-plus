
import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { TrendingUp, DollarSign, Users, Percent, Calendar, HandCoins, Clock, CalendarRange } from 'lucide-react';
import { TipEntry } from '@/hooks/useTipEntries';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, subMonths, subDays, isWithinInterval, getDay, getYear, getWeek, getISOWeek } from 'date-fns';

interface AnalyticsDashboardProps {
  tipEntries: TipEntry[];
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ tipEntries }) => {
  const [periodType, setPeriodType] = useState<'all' | 'week' | 'month' | 'year'>('all');
  const [selectedPeriod, setSelectedPeriod] = useState('');
  
  const realEntries = tipEntries.filter(entry => !entry.isPlaceholder);
  
  // Helper function to get week starting on Sunday
  const getSundayWeek = (date: Date) => {
    const startOfYear = new Date(date.getFullYear(), 0, 1);
    const firstSunday = new Date(startOfYear);
    const dayOfWeek = startOfYear.getDay();
    if (dayOfWeek !== 0) {
      firstSunday.setDate(startOfYear.getDate() + (7 - dayOfWeek));
    }
    const diffTime = date.getTime() - firstSunday.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return Math.floor(diffDays / 7) + 1;
  };

  // Get available options based on period type
  const availableOptions = useMemo(() => {
    const now = new Date();
    
    if (periodType === 'all') {
      return [];
    } else if (periodType === 'week') {
      const weeks = new Set(realEntries.map(entry => getSundayWeek(entry.date)));
      return Array.from(weeks).sort((a, b) => b - a).map(week => ({
        value: week.toString(),
        label: `Week ${week}`
      }));
    } else if (periodType === 'month') {
      const months = new Set(realEntries.map(entry => format(entry.date, 'yyyy-MM')));
      return Array.from(months).sort((a, b) => b.localeCompare(a)).map(month => ({
        value: month,
        label: format(new Date(month + '-01'), 'MMMM yyyy')
      }));
    } else {
      const years = new Set(realEntries.map(entry => getYear(entry.date)));
      return Array.from(years).sort((a, b) => b - a).map(year => ({
        value: year.toString(),
        label: year.toString()
      }));
    }
  }, [realEntries, periodType]);

  // Set default period when period type changes
  React.useEffect(() => {
    if (periodType === 'all') {
      setSelectedPeriod('');
    } else if (availableOptions.length > 0) {
      const now = new Date();
      if (periodType === 'week') {
        setSelectedPeriod(getSundayWeek(now).toString());
      } else if (periodType === 'month') {
        setSelectedPeriod(format(now, 'yyyy-MM'));
      } else {
        setSelectedPeriod(now.getFullYear().toString());
      }
    }
  }, [periodType, availableOptions]);

  // Filter entries based on selected period
  const filteredEntries = useMemo(() => {
    if (periodType === 'all' || !selectedPeriod) return realEntries;
    
    if (periodType === 'week') {
      const weekNumber = parseInt(selectedPeriod);
      return realEntries.filter(entry => getSundayWeek(entry.date) === weekNumber);
    } else if (periodType === 'month') {
      const [year, month] = selectedPeriod.split('-');
      return realEntries.filter(entry => 
        format(entry.date, 'yyyy-MM') === selectedPeriod
      );
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
        totalSales: 0,
        totalEarnings: 0,
        averageTipPercentage: 0,
        averagePerGuest: 0,
        totalGuests: 0,
        tipsPerHour: 0,
        earningsPerHour: 0,
        totalHours: 0
      };
    }

    const totalTips = filteredEntries.reduce((sum, entry) => sum + entry.creditTips + entry.cashTips, 0);
    const totalSales = filteredEntries.reduce((sum, entry) => sum + entry.totalSales, 0);
    const totalGuests = filteredEntries.reduce((sum, entry) => sum + entry.guestCount, 0);
    const totalHours = filteredEntries.reduce((sum, entry) => sum + entry.hoursWorked, 0);
    const totalWages = filteredEntries.reduce((sum, entry) => sum + (entry.hoursWorked * entry.hourlyRate), 0);
    const totalEarnings = totalTips + totalWages;
    
    return {
      totalTips,
      totalSales,
      totalEarnings,
      averageTipPercentage: totalSales > 0 ? (totalTips / totalSales) * 100 : 0,
      averagePerGuest: totalGuests > 0 ? totalTips / totalGuests : 0,
      totalGuests,
      shiftsWorked: filteredEntries.length,
      tipsPerHour: totalHours > 0 ? totalTips / totalHours : 0,
      earningsPerHour: totalHours > 0 ? totalEarnings / totalHours : 0,
      totalHours
    };
  }, [filteredEntries]);

  const sectionStats = useMemo(() => {
    const sectionMap = new Map();
    
    filteredEntries.forEach(entry => {
      const existing = sectionMap.get(entry.section) || {
        section: entry.section,
        totalTips: 0,
        totalSales: 0,
        totalGuests: 0,
        shifts: 0
      };
      
      sectionMap.set(entry.section, {
        ...existing,
        totalTips: existing.totalTips + entry.creditTips + entry.cashTips,
        totalSales: existing.totalSales + entry.totalSales,
        totalGuests: existing.totalGuests + entry.guestCount,
        shifts: existing.shifts + 1
      });
    });

    return Array.from(sectionMap.values()).map(section => ({
      ...section,
      averageTipPercentage: section.totalSales > 0 ? (section.totalTips / section.totalSales) * 100 : 0,
      averagePerGuest: section.totalGuests > 0 ? section.totalTips / section.totalGuests : 0,
      averageTipsPerShift: section.shifts > 0 ? section.totalTips / section.shifts : 0
    })).sort((a, b) => b.totalTips - a.totalTips);
  }, [filteredEntries]);

  const dayStats = useMemo(() => {
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayMap = new Map();

    filteredEntries.forEach(entry => {
      const dayIndex = getDay(entry.date);
      const dayName = dayNames[dayIndex];
      
      const existing = dayMap.get(dayName) || {
        day: dayName,
        dayIndex,
        totalTips: 0,
        totalSales: 0,
        totalGuests: 0,
        shifts: 0
      };
      
      dayMap.set(dayName, {
        ...existing,
        totalTips: existing.totalTips + entry.creditTips + entry.cashTips,
        totalSales: existing.totalSales + entry.totalSales,
        totalGuests: existing.totalGuests + entry.guestCount,
        shifts: existing.shifts + 1
      });
    });

    return Array.from(dayMap.values()).map(day => ({
      ...day,
      averageTipPercentage: day.totalSales > 0 ? (day.totalTips / day.totalSales) * 100 : 0,
      averagePerGuest: day.totalGuests > 0 ? day.totalTips / day.totalGuests : 0,
      averageTipsPerShift: day.shifts > 0 ? day.totalTips / day.shifts : 0
    })).sort((a, b) => b.averageTipsPerShift - a.averageTipsPerShift);
  }, [filteredEntries]);

  const trendData = useMemo(() => {
    if (periodType === 'all') {
      // Yearly trend
      const years = new Map();
      filteredEntries.forEach(entry => {
        const yearKey = getYear(entry.date).toString();
        const existing = years.get(yearKey) || { period: yearKey, tips: 0, wages: 0, sales: 0, guests: 0, date: new Date(parseInt(yearKey), 0, 1) };
        const entryWages = entry.hoursWorked * entry.hourlyRate;
        years.set(yearKey, {
          ...existing,
          tips: existing.tips + entry.creditTips + entry.cashTips,
          wages: existing.wages + entryWages,
          sales: existing.sales + entry.totalSales,
          guests: existing.guests + entry.guestCount
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
        const existing = months.get(monthKey) || { period: monthKey, tips: 0, wages: 0, sales: 0, guests: 0, date: monthStart };
        const entryWages = entry.hoursWorked * entry.hourlyRate;
        months.set(monthKey, {
          ...existing,
          tips: existing.tips + entry.creditTips + entry.cashTips,
          wages: existing.wages + entryWages,
          sales: existing.sales + entry.totalSales,
          guests: existing.guests + entry.guestCount
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
        const weekStart = startOfWeek(entry.date);
        const weekKey = format(weekStart, 'MMM d');
        const existing = weeks.get(weekKey) || { period: weekKey, tips: 0, wages: 0, sales: 0, guests: 0, date: weekStart };
        const entryWages = entry.hoursWorked * entry.hourlyRate;
        weeks.set(weekKey, {
          ...existing,
          tips: existing.tips + entry.creditTips + entry.cashTips,
          wages: existing.wages + entryWages,
          sales: existing.sales + entry.totalSales,
          guests: existing.guests + entry.guestCount
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
        const existing = days.get(dayKey) || { period: dayKey, tips: 0, wages: 0, sales: 0, guests: 0, date: entry.date };
        const entryWages = entry.hoursWorked * entry.hourlyRate;
        days.set(dayKey, {
          ...existing,
          tips: existing.tips + entry.creditTips + entry.cashTips,
          wages: existing.wages + entryWages,
          sales: existing.sales + entry.totalSales,
          guests: existing.guests + entry.guestCount
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
          <div className="flex items-center gap-2 mt-4">
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
          {/* Analytics Cards */}
          <div className="space-y-4">
            {/* Row 1: Total Earnings (full width) */}
            <Card className="bg-gradient-to-r from-green-500 to-emerald-600">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
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
              </CardContent>
            </Card>

            {/* Row 2: Total Tips | Tips per Hour */}
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Tips</p>
                      <p className="text-2xl font-bold text-green-600">${stats.totalTips.toFixed(2)}</p>
                    </div>
                    <HandCoins className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Earnings per Hour</p>
                      <p className="text-2xl font-bold text-purple-600">${stats.earningsPerHour.toFixed(2)}</p>
                    </div>
                    <Clock className="h-8 w-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Row 3: Per Guest | Shifts */}
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Per Guest</p>
                      <p className="text-2xl font-bold">${stats.averagePerGuest.toFixed(2)}</p>
                    </div>
                    <Users className="h-8 w-8 text-orange-600" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Shifts</p>
                      <p className="text-2xl font-bold">{stats.shiftsWorked}</p>
                    </div>
                    <Calendar className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Trend Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{getTrendTitle()}</CardTitle>
              <CardDescription>Your tip earnings over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value, name) => {
                        if (name === 'tips') return [`$${Number(value).toFixed(2)}`, 'Tips'];
                        if (name === 'wages') return [`$${Number(value).toFixed(2)}`, 'Wages'];
                        if (name === 'total') return [`$${Number(value).toFixed(2)}`, 'Total'];
                        return [`$${value}`, name];
                      }}
                      labelFormatter={(label) => `Period: ${label}`}
                      contentStyle={{
                        backgroundColor: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '6px'
                      }}
                    />
                    <Line type="monotone" dataKey="tips" stroke="#10B981" strokeWidth={2} name="tips" />
                    <Line type="monotone" dataKey="wages" stroke="#3B82F6" strokeWidth={2} name="wages" />
                    <Line type="monotone" dataKey="total" stroke="#8B5CF6" strokeWidth={2} name="total" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Performance Analysis */}
          <Card>
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
                                dataKey="averageTipsPerShift"
                              >
                                {sectionStats.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                              </Pie>
                              <Tooltip formatter={(value) => [`$${value}`, 'Avg Tips/Shift']} />
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
                                dataKey="averageTipsPerShift"
                              >
                                {dayStats.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                              </Pie>
                              <Tooltip formatter={(value) => [`$${value}`, 'Avg Tips/Shift']} />
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
                            ${section.totalTips.toFixed(2)}
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
                            ${day.averageTipsPerShift.toFixed(2)}/shift
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

    </div>
  );
};
