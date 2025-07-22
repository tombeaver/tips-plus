
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
        shiftsWorked: 0
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
      shiftsWorked: filteredEntries.length
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

  if (filteredEntries.length === 0) {
    return (
      <Card className="card-enhanced">
        <CardHeader>
          <CardTitle className="heading-xs flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Analytics Dashboard
          </CardTitle>
          <CardDescription className="body-md">Add some tip entries to see your analytics</CardDescription>
        </CardHeader>
        <CardContent className="text-center py-8">
          <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="body-md text-muted-foreground">No data yet for {getTimeFrameLabel()}. Start tracking your tips!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-section">
      {/* Header Card */}
      <Card className="card-enhanced">
        <CardHeader>
          <CardTitle className="heading-xs flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Analytics Dashboard
          </CardTitle>
          <CardDescription className="body-md">
            Track your earnings, tips, and performance metrics
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Time Frame Filter */}
      <Card className="card-enhanced">
        <CardContent className="p-space-group">
          <div className="flex items-center justify-between">
            <div>
              <p className="body-md font-medium text-foreground">Viewing Period</p>
              <p className="label-md text-muted-foreground">{getTimeFrameLabel()}</p>
            </div>
            <div className="flex items-center gap-2">
              <Select value={timeFrame} onValueChange={setTimeFrame}>
                <SelectTrigger className="w-48 bg-card/50 backdrop-blur-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card/90 backdrop-blur-md border-border/50">
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
                  <SelectTrigger className="w-24 bg-card/50 backdrop-blur-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-card/90 backdrop-blur-md border-border/50">
                    {availableYears.map(year => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Total Earnings Highlight */}
      <Card className="bg-gradient-primary border-0 shadow-glow">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="body-lg text-primary-foreground/80">Total Earnings</p>
              <p className="text-4xl font-bold text-primary-foreground">${stats.totalEarnings.toFixed(2)}</p>
              <p className="body-sm text-primary-foreground/70 mt-1">
                Tips + Wages for {getTimeFrameLabel()}
              </p>
            </div>
            <div className="text-primary-foreground/80">
              <DollarSign className="h-12 w-12" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-space-group">
        <Card className="card-enhanced interactive-rise">
          <CardContent className="p-space-group">
            <div className="flex items-center justify-between">
              <div>
                <p className="label-md text-muted-foreground">Total Tips</p>
                <p className="display-md text-success">${stats.totalTips.toFixed(2)}</p>
              </div>
              <HandCoins className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="card-enhanced interactive-rise">
          <CardContent className="p-space-group">
            <div className="flex items-center justify-between">
              <div>
                <p className="label-md text-muted-foreground">Avg Tip %</p>
                <p className="display-md text-primary">{stats.averageTipPercentage.toFixed(1)}%</p>
              </div>
              <Percent className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="card-enhanced interactive-rise">
          <CardContent className="p-space-group">
            <div className="flex items-center justify-between">
              <div>
                <p className="label-md text-muted-foreground">Per Guest</p>
                <p className="display-md">${stats.averagePerGuest.toFixed(2)}</p>
              </div>
              <Users className="h-8 w-8 text-prism-cyan" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="card-enhanced interactive-rise">
          <CardContent className="p-space-group">
            <div className="flex items-center justify-between">
              <div>
                <p className="label-md text-muted-foreground">Shifts</p>
                <p className="display-md">{stats.shiftsWorked}</p>
              </div>
              <Clock className="h-8 w-8 text-warning" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Trend */}
      <Card className="card-enhanced">
        <CardHeader>
          <CardTitle className="heading-xs">Weekly Tips Trend</CardTitle>
          <CardDescription className="body-md">Your tip earnings over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="week" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <Tooltip 
                  formatter={(value, name) => [`$${value}`, name === 'tips' ? 'Tips' : name]}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    backdropFilter: 'blur(8px)'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="tips" 
                  stroke="hsl(var(--success))" 
                  strokeWidth={3}
                  dot={{ fill: 'hsl(var(--success))', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Performance Analysis */}
      <Card className="card-enhanced">
        <CardHeader>
          <CardTitle className="heading-xs">Performance Analysis</CardTitle>
          <CardDescription className="body-md">Compare your earnings by section and day of week</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="sections" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-muted/50">
              <TabsTrigger value="sections" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">By Section</TabsTrigger>
              <TabsTrigger value="days" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">By Day</TabsTrigger>
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
                            fill="hsl(var(--primary))"
                            dataKey="totalTips"
                          >
                            {sectionStats.map((entry, index) => {
                              const prismColors = [
                                'hsl(var(--prism-violet))',
                                'hsl(var(--prism-blue))', 
                                'hsl(var(--prism-cyan))',
                                'hsl(var(--prism-emerald))',
                                'hsl(var(--prism-amber))',
                                'hsl(var(--prism-rose))'
                              ];
                              return <Cell key={`cell-${index}`} fill={prismColors[index % prismColors.length]} />;
                            })}
                          </Pie>
                          <Tooltip 
                            formatter={(value) => [`$${value}`, 'Tips']}
                            contentStyle={{
                              backgroundColor: 'hsl(var(--card))',
                              border: '1px solid hsl(var(--border))',
                              borderRadius: '8px',
                              backdropFilter: 'blur(8px)'
                            }}
                          />
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
                            fill="hsl(var(--primary))"
                            dataKey="totalTips"
                          >
                            {dayStats.map((entry, index) => {
                              const prismColors = [
                                'hsl(var(--prism-violet))',
                                'hsl(var(--prism-blue))', 
                                'hsl(var(--prism-cyan))',
                                'hsl(var(--prism-emerald))',
                                'hsl(var(--prism-amber))',
                                'hsl(var(--prism-rose))',
                                'hsl(var(--primary))'
                              ];
                              return <Cell key={`cell-${index}`} fill={prismColors[index % prismColors.length]} />;
                            })}
                          </Pie>
                          <Tooltip 
                            formatter={(value) => [`$${value}`, 'Tips']}
                            contentStyle={{
                              backgroundColor: 'hsl(var(--card))',
                              border: '1px solid hsl(var(--border))',
                              borderRadius: '8px',
                              backdropFilter: 'blur(8px)'
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}
              </TabsContent>
            </div>
            
            <TabsContent value="sections" className="mt-4">
              <div className="space-group">
                {sectionStats.map((section, index) => (
                  <Card key={section.section} className="card-enhanced interactive-rise">
                    <CardContent className="p-space-group">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="body-lg font-medium">Section {section.section}</h4>
                        <span className="display-sm text-success">
                          ${section.totalTips.toFixed(2)}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-space-item">
                        <div>
                          <span className="label-md text-muted-foreground block">Avg Tip %</span>
                          <span className="body-lg font-medium">{section.averageTipPercentage.toFixed(1)}%</span>
                        </div>
                        <div>
                          <span className="label-md text-muted-foreground block">Per Guest</span>
                          <span className="body-lg font-medium">${section.averagePerGuest.toFixed(2)}</span>
                        </div>
                        <div>
                          <span className="label-md text-muted-foreground block">Shifts</span>
                          <span className="body-lg font-medium">{section.shifts}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="days" className="mt-4">
              <div className="space-group">
                {dayStats.map((day, index) => (
                  <Card key={day.day} className="card-enhanced interactive-rise">
                    <CardContent className="p-space-group">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="body-lg font-medium flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-primary" />
                          {day.day}
                        </h4>
                        <span className="display-sm text-success">
                          ${day.averageTipsPerShift.toFixed(2)}/shift
                        </span>
                      </div>
                      <div className="grid grid-cols-4 gap-space-item">
                        <div>
                          <span className="label-md text-muted-foreground block">Total Tips</span>
                          <span className="body-lg font-medium">${day.totalTips.toFixed(2)}</span>
                        </div>
                        <div>
                          <span className="label-md text-muted-foreground block">Avg Tip %</span>
                          <span className="body-lg font-medium">{day.averageTipPercentage.toFixed(1)}%</span>
                        </div>
                        <div>
                          <span className="label-md text-muted-foreground block">Per Guest</span>
                          <span className="body-lg font-medium">${day.averagePerGuest.toFixed(2)}</span>
                        </div>
                        <div>
                          <span className="label-md text-muted-foreground block">Shifts</span>
                          <span className="body-lg font-medium">{day.shifts}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

    </div>
  );
};
