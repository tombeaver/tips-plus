
import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { TrendingUp, DollarSign, Users, Percent, Calendar, HandCoins, Clock, CalendarRange } from 'lucide-react';
import { TipEntry } from '@/hooks/useTipEntries';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, subMonths, subDays, isWithinInterval, getDay, getYear } from 'date-fns';

interface AnalyticsDashboardProps {
  tipEntries: TipEntry[];
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ tipEntries }) => {
  const [timeFrame, setTimeFrame] = useState('currentYear');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  
  const realEntries = tipEntries.filter(entry => !entry.isPlaceholder);
  
  // Get available years from data
  const availableYears = useMemo(() => {
    const years = new Set(realEntries.map(entry => getYear(entry.date)));
    return Array.from(years).sort((a, b) => b - a);
  }, [realEntries]);

  // Filter entries based on selected time frame
  const filteredEntries = useMemo(() => {
    const now = new Date();
    
    switch (timeFrame) {
      case 'last30Days':
        const thirtyDaysAgo = subDays(now, 30);
        return realEntries.filter(entry => 
          isWithinInterval(entry.date, { start: thirtyDaysAgo, end: now })
        );
      
      case 'currentMonth':
        const monthStart = startOfMonth(now);
        const monthEnd = endOfMonth(now);
        return realEntries.filter(entry => 
          isWithinInterval(entry.date, { start: monthStart, end: monthEnd })
        );
      
      case 'lastMonth':
        const lastMonth = subMonths(now, 1);
        const lastMonthStart = startOfMonth(lastMonth);
        const lastMonthEnd = endOfMonth(lastMonth);
        return realEntries.filter(entry => 
          isWithinInterval(entry.date, { start: lastMonthStart, end: lastMonthEnd })
        );
      
      case 'currentYear':
        const yearStart = startOfYear(now);
        const yearEnd = endOfYear(now);
        return realEntries.filter(entry => 
          isWithinInterval(entry.date, { start: yearStart, end: yearEnd })
        );
      
      case 'specificYear':
        const specificYearStart = startOfYear(new Date(parseInt(selectedYear), 0, 1));
        const specificYearEnd = endOfYear(new Date(parseInt(selectedYear), 11, 31));
        return realEntries.filter(entry => 
          isWithinInterval(entry.date, { start: specificYearStart, end: specificYearEnd })
        );
      
      case 'allTime':
      default:
        return realEntries;
    }
  }, [realEntries, timeFrame, selectedYear]);

  const getTimeFrameLabel = () => {
    switch (timeFrame) {
      case 'last30Days': return 'Last 30 Days';
      case 'currentMonth': return format(new Date(), 'MMMM yyyy');
      case 'lastMonth': return format(subMonths(new Date(), 1), 'MMMM yyyy');
      case 'currentYear': return new Date().getFullYear().toString();
      case 'specificYear': return selectedYear;
      case 'allTime': return 'All Time';
      default: return 'Current Year';
    }
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

  const weeklyData = useMemo(() => {
    const weeks = new Map();
    
    filteredEntries.forEach(entry => {
      const weekStart = startOfWeek(entry.date);
      const weekKey = format(weekStart, 'MMM d');
      
      const existing = weeks.get(weekKey) || { week: weekKey, tips: 0, sales: 0, guests: 0, weekStart };
      weeks.set(weekKey, {
        ...existing,
        tips: existing.tips + entry.creditTips + entry.cashTips,
        sales: existing.sales + entry.totalSales,
        guests: existing.guests + entry.guestCount,
        weekStart
      });
    });

    return Array.from(weeks.values()).sort((a, b) => a.weekStart.getTime() - b.weekStart.getTime());
  }, [filteredEntries]);

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];


  return (
    <div className="space-y-4">
      {/* Header and Filter Card */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Analytics Dashboard
            </CardTitle>
            <CardDescription>
              Viewing data for: {getTimeFrameLabel()}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2 mt-4">
            <Select value={timeFrame} onValueChange={setTimeFrame}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="last30Days">Last 30 Days</SelectItem>
                <SelectItem value="currentMonth">Current Month</SelectItem>
                <SelectItem value="lastMonth">Last Month</SelectItem>
                <SelectItem value="currentYear">Current Year</SelectItem>
                {availableYears.length > 1 && (
                  <SelectItem value="specificYear">Specific Year</SelectItem>
                )}
                <SelectItem value="allTime">All Time</SelectItem>
              </SelectContent>
            </Select>
            
            {timeFrame === 'specificYear' && (
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availableYears.map(year => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
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

          {/* Weekly Trend */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Weekly Tips Trend</CardTitle>
              <CardDescription>Your tip earnings over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value, name) => [`$${value}`, name === 'tips' ? 'Tips' : name]}
                    />
                    <Line type="monotone" dataKey="tips" stroke="#10B981" strokeWidth={2} />
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
                                dataKey="totalTips"
                              >
                                {sectionStats.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                              </Pie>
                              <Tooltip formatter={(value) => [`$${value}`, 'Tips']} />
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
                                dataKey="totalTips"
                              >
                                {dayStats.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                              </Pie>
                              <Tooltip formatter={(value) => [`$${value}`, 'Tips']} />
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
                        <div className="grid grid-cols-4 gap-2 text-sm text-gray-600">
                          <div>
                            <span className="block">Total Tips</span>
                            <span className="font-medium">${day.totalTips.toFixed(2)}</span>
                          </div>
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
