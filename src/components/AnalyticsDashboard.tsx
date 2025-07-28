import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  TrendingUp, 
  DollarSign, 
  Users, 
  Percent, 
  Calendar, 
  HandCoins, 
  Clock, 
  CalendarRange,
  BarChart3,
  Target,
  Info
} from 'lucide-react';
import { TipEntry } from '@/hooks/useTipEntries';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subDays, subMonths, isWithinInterval, getDay } from 'date-fns';

interface AnalyticsDashboardProps {
  tipEntries: TipEntry[];
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ tipEntries }) => {
  const [chartModalOpen, setChartModalOpen] = useState(false);
  const [dateRange, setDateRange] = useState<'30days' | '12months' | 'lifetime'>('30days');
  const [showCashTips, setShowCashTips] = useState(true);
  const [showCreditTips, setShowCreditTips] = useState(true);
  const [showHours, setShowHours] = useState(false);
  const [compareShifts, setCompareShifts] = useState(false);

  const realEntries = tipEntries.filter(entry => !entry.isPlaceholder);

  // Get chart data based on date range
  const chartData = useMemo(() => {
    const now = new Date();
    let filteredEntries = realEntries;

    if (dateRange === '30days') {
      const thirtyDaysAgo = subDays(now, 30);
      filteredEntries = realEntries.filter(entry => 
        isWithinInterval(entry.date, { start: thirtyDaysAgo, end: now })
      );
      
      // Group by day
      const dailyData = new Map();
      filteredEntries.forEach(entry => {
        const dayKey = format(entry.date, 'MMM d');
        const existing = dailyData.get(dayKey) || { 
          date: dayKey, 
          cashTips: 0, 
          creditTips: 0, 
          hours: 0,
          amShifts: { cashTips: 0, creditTips: 0 },
          pmShifts: { cashTips: 0, creditTips: 0 }
        };
        
        if (entry.shift === 'AM') {
          existing.amShifts.cashTips += entry.cashTips;
          existing.amShifts.creditTips += entry.creditTips;
        } else {
          existing.pmShifts.cashTips += entry.cashTips;
          existing.pmShifts.creditTips += entry.creditTips;
        }
        
        existing.cashTips += entry.cashTips;
        existing.creditTips += entry.creditTips;
        existing.hours += entry.hoursWorked;
        dailyData.set(dayKey, existing);
      });
      
      return Array.from(dailyData.values()).sort((a, b) => 
        new Date(a.date + ' 2024').getTime() - new Date(b.date + ' 2024').getTime()
      );
    } else if (dateRange === '12months') {
      const twelveMonthsAgo = subMonths(now, 12);
      filteredEntries = realEntries.filter(entry => 
        isWithinInterval(entry.date, { start: twelveMonthsAgo, end: now })
      );
      
      // Group by month
      const monthlyData = new Map();
      filteredEntries.forEach(entry => {
        const monthKey = format(entry.date, 'MMM yyyy');
        const existing = monthlyData.get(monthKey) || { 
          date: monthKey, 
          cashTips: 0, 
          creditTips: 0, 
          hours: 0,
          amShifts: { cashTips: 0, creditTips: 0 },
          pmShifts: { cashTips: 0, creditTips: 0 }
        };
        
        if (entry.shift === 'AM') {
          existing.amShifts.cashTips += entry.cashTips;
          existing.amShifts.creditTips += entry.creditTips;
        } else {
          existing.pmShifts.cashTips += entry.cashTips;
          existing.pmShifts.creditTips += entry.creditTips;
        }
        
        existing.cashTips += entry.cashTips;
        existing.creditTips += entry.creditTips;
        existing.hours += entry.hoursWorked;
        monthlyData.set(monthKey, existing);
      });
      
      return Array.from(monthlyData.values()).sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      );
    } else {
      // Lifetime - group by year
      const yearlyData = new Map();
      filteredEntries.forEach(entry => {
        const yearKey = format(entry.date, 'yyyy');
        const existing = yearlyData.get(yearKey) || { 
          date: yearKey, 
          cashTips: 0, 
          creditTips: 0, 
          hours: 0,
          amShifts: { cashTips: 0, creditTips: 0 },
          pmShifts: { cashTips: 0, creditTips: 0 }
        };
        
        if (entry.shift === 'AM') {
          existing.amShifts.cashTips += entry.cashTips;
          existing.amShifts.creditTips += entry.creditTips;
        } else {
          existing.pmShifts.cashTips += entry.cashTips;
          existing.pmShifts.creditTips += entry.creditTips;
        }
        
        existing.cashTips += entry.cashTips;
        existing.creditTips += entry.creditTips;
        existing.hours += entry.hoursWorked;
        yearlyData.set(yearKey, existing);
      });
      
      return Array.from(yearlyData.values()).sort((a, b) => 
        parseInt(a.date) - parseInt(b.date)
      );
    }
  }, [realEntries, dateRange]);

  // Calculate all metrics with smart handling of missing data
  const metrics = useMemo(() => {
    // Total earnings (all entries with tip data)
    const entriesWithTips = realEntries.filter(entry => 
      entry.cashTips > 0 || entry.creditTips > 0
    );
    const totalCashTips = entriesWithTips.reduce((sum, entry) => sum + entry.cashTips, 0);
    const totalCreditTips = entriesWithTips.reduce((sum, entry) => sum + entry.creditTips, 0);
    const totalTips = totalCashTips + totalCreditTips;

    // Average hourly rate (only entries with valid tip and hour data)
    const entriesWithTipsAndHours = realEntries.filter(entry => 
      (entry.cashTips > 0 || entry.creditTips > 0) && entry.hoursWorked > 0
    );
    const totalHoursWithTips = entriesWithTipsAndHours.reduce((sum, entry) => sum + entry.hoursWorked, 0);
    const avgHourlyRate = totalHoursWithTips > 0 ? totalTips / totalHoursWithTips : 0;

    // Average daily income (total earnings / unique days worked)
    const uniqueDays = new Set(realEntries.map(entry => format(entry.date, 'yyyy-MM-dd'))).size;
    const avgDailyIncome = uniqueDays > 0 ? totalTips / uniqueDays : 0;

    // Total shifts worked
    const totalShifts = realEntries.length;

    // Average hours per shift (only entries with hour data)
    const entriesWithHours = realEntries.filter(entry => entry.hoursWorked > 0);
    const totalHours = entriesWithHours.reduce((sum, entry) => sum + entry.hoursWorked, 0);
    const avgHoursPerShift = entriesWithHours.length > 0 ? totalHours / entriesWithHours.length : 0;

    // Average guests per day (only entries with guest data)
    const entriesWithGuests = realEntries.filter(entry => entry.guestCount > 0);
    const totalGuests = entriesWithGuests.reduce((sum, entry) => sum + entry.guestCount, 0);
    const avgGuestsPerDay = entriesWithGuests.length > 0 ? totalGuests / entriesWithGuests.length : 0;

    // Average tip percentage (only entries with sales data)
    const entriesWithSales = realEntries.filter(entry => entry.totalSales > 0);
    const totalSales = entriesWithSales.reduce((sum, entry) => sum + entry.totalSales, 0);
    const tipsFromSalesEntries = entriesWithSales.reduce((sum, entry) => sum + entry.cashTips + entry.creditTips, 0);
    const avgTipPercentage = totalSales > 0 ? (tipsFromSalesEntries / totalSales) * 100 : 0;

    // Most frequent section
    const sectionCounts = new Map();
    realEntries.forEach(entry => {
      sectionCounts.set(entry.section, (sectionCounts.get(entry.section) || 0) + 1);
    });
    const mostFrequentSection = Array.from(sectionCounts.entries()).reduce((max, current) => 
      current[1] > max[1] ? current : max, [1, 0]
    )[0];

    // Shift preference
    const amShifts = realEntries.filter(entry => entry.shift === 'AM').length;
    const pmShifts = realEntries.filter(entry => entry.shift === 'PM').length;
    const shiftPreference = amShifts > pmShifts ? 'AM' : 'PM';

    // Mood tracker (only entries with mood data)
    const entriesWithMood = realEntries.filter(entry => entry.moodRating !== null && entry.moodRating !== undefined);
    const avgMood = entriesWithMood.length > 0 ? 
      entriesWithMood.reduce((sum, entry) => sum + (entry.moodRating || 0), 0) / entriesWithMood.length : 0;

    // Highest grossing day
    const dailyEarnings = new Map();
    realEntries.forEach(entry => {
      const dayKey = format(entry.date, 'yyyy-MM-dd');
      const earnings = entry.cashTips + entry.creditTips;
      dailyEarnings.set(dayKey, (dailyEarnings.get(dayKey) || 0) + earnings);
    });
    const highestGrossingDay = Array.from(dailyEarnings.entries()).reduce((max, current) => 
      current[1] > max[1] ? current : max, ['', 0]
    );

    return {
      totalEarnings: totalTips,
      avgHourlyRate,
      avgDailyIncome,
      totalShifts,
      avgHoursPerShift,
      avgGuestsPerDay,
      avgTipPercentage,
      mostFrequentSection,
      shiftPreference: `${shiftPreference} (${Math.max(amShifts, pmShifts)} shifts)`,
      avgMood,
      highestGrossingDay: {
        date: highestGrossingDay[0] ? format(new Date(highestGrossingDay[0]), 'MMM d, yyyy') : 'N/A',
        amount: highestGrossingDay[1]
      }
    };
  }, [realEntries]);

  const chartTitle = useMemo(() => {
    switch (dateRange) {
      case '30days': return 'Last 30 Days';
      case '12months': return 'Last 12 Months';
      case 'lifetime': return 'Lifetime Data';
      default: return 'Earnings Breakdown';
    }
  }, [dateRange]);

  return (
    <div className="space-y-6">
      {/* 1. Summary Metrics (Top Section) */}
      <Card className="border-0 shadow-lg bg-gradient-to-br from-primary to-primary-foreground">
        <CardContent className="p-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-primary-foreground/80 text-lg font-medium">Total Earnings</p>
              <p className="text-5xl font-bold text-primary-foreground mt-2">
                ${metrics.totalEarnings.toFixed(2)}
              </p>
              <p className="text-primary-foreground/70 text-sm mt-2">
                From all cash + credit tips • Ignores missing data
              </p>
            </div>
            <div className="text-primary-foreground/80">
              <DollarSign className="h-16 w-16" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 2. Stacked Bar Chart */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Earnings Breakdown
              </CardTitle>
              <CardDescription>
                {chartTitle} • Tap to customize view
              </CardDescription>
            </div>
            <Dialog open={chartModalOpen} onOpenChange={setChartModalOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Customize
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Chart Customization</DialogTitle>
                </DialogHeader>
                
                <div className="space-y-6">
                  {/* Date Range Selector */}
                  <div className="space-y-2">
                    <Label>Date Range</Label>
                    <Tabs value={dateRange} onValueChange={(value) => setDateRange(value as any)}>
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="30days">Last 30 Days</TabsTrigger>
                        <TabsTrigger value="12months">Monthly (12mo)</TabsTrigger>
                        <TabsTrigger value="lifetime">Yearly (Lifetime)</TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>

                  {/* Filter Toggles */}
                  <div className="space-y-4">
                    <Label>Show/Hide Data</Label>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center space-x-2">
                        <Switch 
                          id="cash-tips" 
                          checked={showCashTips} 
                          onCheckedChange={setShowCashTips} 
                        />
                        <Label htmlFor="cash-tips">Cash Tips</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch 
                          id="credit-tips" 
                          checked={showCreditTips} 
                          onCheckedChange={setShowCreditTips} 
                        />
                        <Label htmlFor="credit-tips">Credit Tips</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch 
                          id="hours" 
                          checked={showHours} 
                          onCheckedChange={setShowHours} 
                        />
                        <Label htmlFor="hours">Hours Worked</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch 
                          id="compare-shifts" 
                          checked={compareShifts} 
                          onCheckedChange={setCompareShifts} 
                        />
                        <Label htmlFor="compare-shifts">Compare AM/PM</Label>
                      </div>
                    </div>
                  </div>

                  {/* Large Chart */}
                  <div className="h-96">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                        <XAxis 
                          dataKey="date" 
                          tick={{ fontSize: 12 }}
                          angle={-45}
                          textAnchor="end"
                          height={80}
                        />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip 
                          formatter={(value, name) => [`$${Number(value).toFixed(2)}`, name]}
                          labelFormatter={(label) => `Date: ${label}`}
                        />
                        
                        {!compareShifts ? (
                          <>
                            {showCashTips && (
                              <Bar dataKey="cashTips" stackId="tips" fill="hsl(var(--primary))" name="Cash Tips" />
                            )}
                            {showCreditTips && (
                              <Bar dataKey="creditTips" stackId="tips" fill="hsl(var(--secondary))" name="Credit Tips" />
                            )}
                          </>
                        ) : (
                          <>
                            <Bar dataKey="amShifts.cashTips" stackId="am" fill="hsl(var(--primary))" name="AM Cash" />
                            <Bar dataKey="amShifts.creditTips" stackId="am" fill="hsl(var(--primary-foreground))" name="AM Credit" />
                            <Bar dataKey="pmShifts.cashTips" stackId="pm" fill="hsl(var(--secondary))" name="PM Cash" />
                            <Bar dataKey="pmShifts.creditTips" stackId="pm" fill="hsl(var(--secondary-foreground))" name="PM Credit" />
                          </>
                        )}
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData.slice(-10)}> {/* Show last 10 data points */}
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip 
                  formatter={(value, name) => [`$${Number(value).toFixed(2)}`, name]}
                />
                <Bar dataKey="cashTips" stackId="tips" fill="hsl(var(--primary))" name="Cash Tips" />
                <Bar dataKey="creditTips" stackId="tips" fill="hsl(var(--secondary))" name="Credit Tips" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* 3. Highlight Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-l-4 border-l-primary">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  Average Hourly Rate
                  <Info className="h-3 w-3" />
                </p>
                <p className="text-3xl font-bold text-primary">
                  ${metrics.avgHourlyRate.toFixed(2)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  = (Credit + Cash Tips) ÷ Hours Worked
                </p>
              </div>
              <Clock className="h-10 w-10 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-secondary">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  Average Daily Income
                  <Info className="h-3 w-3" />
                </p>
                <p className="text-3xl font-bold text-secondary">
                  ${metrics.avgDailyIncome.toFixed(2)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  = Total Earnings ÷ Days Worked
                </p>
              </div>
              <Calendar className="h-10 w-10 text-secondary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 4. Detailed Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Detailed Metrics
          </CardTitle>
          <CardDescription>
            Smart handling: Only includes entries where relevant data exists
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Total Shifts Worked</p>
              <p className="text-2xl font-bold">{metrics.totalShifts}</p>
              <p className="text-xs text-muted-foreground">Based on unique entries</p>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Avg Hours per Shift</p>
              <p className="text-2xl font-bold">{metrics.avgHoursPerShift.toFixed(1)}</p>
              <p className="text-xs text-muted-foreground">From entries with valid hour data</p>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Avg Guests per Day</p>
              <p className="text-2xl font-bold">{metrics.avgGuestsPerDay.toFixed(0)}</p>
              <p className="text-xs text-muted-foreground">From entries with guest count</p>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Avg Tip %</p>
              <p className="text-2xl font-bold">{metrics.avgTipPercentage.toFixed(1)}%</p>
              <p className="text-xs text-muted-foreground">(Tips ÷ Sales) × 100</p>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Most Frequent Section</p>
              <p className="text-2xl font-bold">{metrics.mostFrequentSection}</p>
              <p className="text-xs text-muted-foreground">Based on shift count</p>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Shift Preference</p>
              <p className="text-2xl font-bold">{metrics.shiftPreference}</p>
              <p className="text-xs text-muted-foreground">Most selected shift type</p>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Mood Tracker</p>
              <p className="text-2xl font-bold">{metrics.avgMood.toFixed(1)}/5</p>
              <p className="text-xs text-muted-foreground">Average mood rating</p>
            </div>

            <div className="space-y-2 md:col-span-2">
              <p className="text-sm font-medium text-muted-foreground">Highest Grossing Day</p>
              <p className="text-2xl font-bold">${metrics.highestGrossingDay.amount.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground">{metrics.highestGrossingDay.date}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};