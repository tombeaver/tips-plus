import React, { useMemo } from 'react';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { TipEntry } from '@/hooks/useTipEntries';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { format, getDay } from 'date-fns';
import { DollarSign, Clock, Users, Percent, HandCoins, Calendar, CalendarRange, ArrowUp, ArrowDown, X, Banknote, CreditCard, Wine } from 'lucide-react';

export type MetricType = 
  | 'totalEarnings' 
  | 'avgHourlyRate' 
  | 'avgDailyIncome' 
  | 'totalTips' 
  | 'totalCashTips'
  | 'totalCreditTips'
  | 'totalAlcoholSales'
  | 'tipsPerHour' 
  | 'avgPerGuest' 
  | 'avgTipPercent' 
  | 'totalShifts' 
  | 'totalHours';

interface MetricDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  metricType: MetricType | null;
  filteredEntries: TipEntry[];
  timeFrameLabel: string;
}

export const MetricDetailModal: React.FC<MetricDetailModalProps> = ({
  isOpen,
  onClose,
  metricType,
  filteredEntries,
  timeFrameLabel,
}) => {
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  // Sort entries by date for trend analysis
  const sortedEntries = useMemo(() => {
    return [...filteredEntries].sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [filteredEntries]);

  // Calculate cumulative and per-entry data
  const detailData = useMemo(() => {
    if (!metricType || sortedEntries.length === 0) return null;

    const entries = sortedEntries.map((entry, index) => {
      const tips = entry.creditTips + entry.cashTips;
      const cashTips = entry.cashTips;
      const creditTips = entry.creditTips;
      const wages = entry.hoursWorked * entry.hourlyRate;
      const earnings = tips + wages;
      const shiftCount = entry.shift === 'Double' ? 2 : 1;

      return {
        date: format(entry.date, 'MMM d'),
        dayOfWeek: dayNames[getDay(entry.date)],
        tips,
        cashTips,
        creditTips,
        alcoholSales: entry.alcoholSales || 0,
        wages,
        earnings,
        hoursWorked: entry.hoursWorked,
        hourlyRate: entry.hourlyRate,
        guestCount: entry.guestCount,
        totalSales: entry.totalSales,
        tipPercent: entry.totalSales > 0 ? (tips / entry.totalSales) * 100 : 0,
        tipsPerHour: entry.hoursWorked > 0 ? tips / entry.hoursWorked : 0,
        earningsPerHour: entry.hoursWorked > 0 ? earnings / entry.hoursWorked : 0,
        perGuest: entry.guestCount > 0 ? tips / entry.guestCount : 0,
        shiftCount,
        section: entry.section,
        shift: entry.shift,
      };
    });

    // Calculate totals and averages
    const totals = entries.reduce((acc, entry) => ({
      tips: acc.tips + entry.tips,
      cashTips: acc.cashTips + entry.cashTips,
      creditTips: acc.creditTips + entry.creditTips,
      alcoholSales: acc.alcoholSales + entry.alcoholSales,
      wages: acc.wages + entry.wages,
      earnings: acc.earnings + entry.earnings,
      hours: acc.hours + entry.hoursWorked,
      guests: acc.guests + entry.guestCount,
      sales: acc.sales + entry.totalSales,
      shifts: acc.shifts + entry.shiftCount,
    }), { tips: 0, cashTips: 0, creditTips: 0, alcoholSales: 0, wages: 0, earnings: 0, hours: 0, guests: 0, sales: 0, shifts: 0 });

    // Calculate stats by day of week
    const byDayOfWeek = dayNames.map(day => {
      const dayEntries = entries.filter(e => e.dayOfWeek === day);
      if (dayEntries.length === 0) return { day: day.slice(0, 3), value: 0, count: 0 };
      
      let value = 0;
      let totalShifts = dayEntries.reduce((sum, e) => sum + e.shiftCount, 0);
      
      switch (metricType) {
        case 'totalEarnings':
        case 'avgDailyIncome':
          value = dayEntries.reduce((sum, e) => sum + e.earnings, 0) / totalShifts;
          break;
        case 'avgHourlyRate':
          const totalHours = dayEntries.reduce((sum, e) => sum + e.hoursWorked, 0);
          const totalEarnings = dayEntries.reduce((sum, e) => sum + e.earnings, 0);
          value = totalHours > 0 ? totalEarnings / totalHours : 0;
          break;
        case 'totalTips':
          value = dayEntries.reduce((sum, e) => sum + e.tips, 0) / totalShifts;
          break;
        case 'totalCashTips':
          value = dayEntries.reduce((sum, e) => sum + e.cashTips, 0) / totalShifts;
          break;
        case 'totalCreditTips':
          value = dayEntries.reduce((sum, e) => sum + e.creditTips, 0) / totalShifts;
          break;
        case 'totalAlcoholSales':
          value = dayEntries.reduce((sum, e) => sum + e.alcoholSales, 0) / totalShifts;
          break;
        case 'tipsPerHour':
          const tipTotal = dayEntries.reduce((sum, e) => sum + e.tips, 0);
          const hours = dayEntries.reduce((sum, e) => sum + e.hoursWorked, 0);
          value = hours > 0 ? tipTotal / hours : 0;
          break;
        case 'avgPerGuest':
          const tips = dayEntries.reduce((sum, e) => sum + e.tips, 0);
          const guests = dayEntries.reduce((sum, e) => sum + e.guestCount, 0);
          value = guests > 0 ? tips / guests : 0;
          break;
        case 'avgTipPercent':
          const tipSum = dayEntries.reduce((sum, e) => sum + e.tips, 0);
          const salesSum = dayEntries.reduce((sum, e) => sum + e.totalSales, 0);
          value = salesSum > 0 ? (tipSum / salesSum) * 100 : 0;
          break;
        case 'totalShifts':
          value = totalShifts;
          break;
        case 'totalHours':
          value = dayEntries.reduce((sum, e) => sum + e.hoursWorked, 0) / dayEntries.length;
          break;
      }
      
      return { day: day.slice(0, 3), value, count: dayEntries.length };
    });

    // Calculate best/worst entries
    let rankedEntries = [...entries];
    switch (metricType) {
      case 'totalEarnings':
      case 'avgDailyIncome':
        rankedEntries.sort((a, b) => b.earnings - a.earnings);
        break;
      case 'avgHourlyRate':
        rankedEntries.sort((a, b) => b.earningsPerHour - a.earningsPerHour);
        break;
      case 'totalTips':
        rankedEntries.sort((a, b) => b.tips - a.tips);
        break;
      case 'totalCashTips':
        rankedEntries.sort((a, b) => b.cashTips - a.cashTips);
        break;
      case 'totalCreditTips':
        rankedEntries.sort((a, b) => b.creditTips - a.creditTips);
        break;
      case 'totalAlcoholSales':
        rankedEntries.sort((a, b) => b.alcoholSales - a.alcoholSales);
        break;
      case 'tipsPerHour':
        rankedEntries.sort((a, b) => b.tipsPerHour - a.tipsPerHour);
        break;
      case 'avgPerGuest':
        rankedEntries.sort((a, b) => b.perGuest - a.perGuest);
        break;
      case 'avgTipPercent':
        rankedEntries.sort((a, b) => b.tipPercent - a.tipPercent);
        break;
      case 'totalShifts':
      case 'totalHours':
        rankedEntries.sort((a, b) => b.hoursWorked - a.hoursWorked);
        break;
    }

    return {
      entries,
      totals,
      byDayOfWeek,
      best: rankedEntries[0],
      worst: rankedEntries[rankedEntries.length - 1],
    };
  }, [sortedEntries, metricType]);

  if (!metricType || !detailData) return null;

  const getMetricConfig = () => {
    const { totals, entries } = detailData;
    
    switch (metricType) {
      case 'totalEarnings':
        return {
          title: 'Total Earnings',
          icon: DollarSign,
          mainValue: `$${totals.earnings.toFixed(2)}`,
          subtitle: 'Tips + Wages combined',
          color: 'emerald',
          chartDataKey: 'earnings',
          chartColor: '#10B981',
          formatValue: (v: number) => `$${v.toFixed(2)}`,
          breakdown: [
            { label: 'Total Tips', value: `$${totals.tips.toFixed(2)}` },
            { label: 'Total Wages', value: `$${totals.wages.toFixed(2)}` },
            { label: 'Tip Ratio', value: `${((totals.tips / totals.earnings) * 100).toFixed(1)}%` },
          ],
        };
      case 'avgHourlyRate':
        const avgHourly = totals.hours > 0 ? totals.earnings / totals.hours : 0;
        return {
          title: 'Average Hourly Rate',
          icon: Clock,
          mainValue: `$${avgHourly.toFixed(2)}/hr`,
          subtitle: 'Total earnings ÷ Hours worked',
          color: 'blue',
          chartDataKey: 'earningsPerHour',
          chartColor: '#3B82F6',
          formatValue: (v: number) => `$${v.toFixed(2)}`,
          breakdown: [
            { label: 'Total Earnings', value: `$${totals.earnings.toFixed(2)}` },
            { label: 'Total Hours', value: totals.hours.toFixed(1) },
            { label: 'Shifts Worked', value: totals.shifts.toString() },
          ],
        };
      case 'avgDailyIncome':
        const avgDaily = totals.shifts > 0 ? totals.earnings / totals.shifts : 0;
        return {
          title: 'Average Daily Income',
          icon: CalendarRange,
          mainValue: `$${avgDaily.toFixed(2)}`,
          subtitle: 'Per shift average',
          color: 'purple',
          chartDataKey: 'earnings',
          chartColor: '#8B5CF6',
          formatValue: (v: number) => `$${v.toFixed(2)}`,
          breakdown: [
            { label: 'Total Earnings', value: `$${totals.earnings.toFixed(2)}` },
            { label: 'Shifts Worked', value: totals.shifts.toString() },
            { label: 'Best Day', value: detailData.best ? `$${detailData.best.earnings.toFixed(2)}` : '-' },
          ],
        };
      case 'totalTips':
        return {
          title: 'Total Tips',
          icon: HandCoins,
          mainValue: `$${totals.tips.toFixed(2)}`,
          subtitle: 'Credit + Cash tips',
          color: 'emerald',
          chartDataKey: 'tips',
          chartColor: '#10B981',
          formatValue: (v: number) => `$${v.toFixed(2)}`,
          breakdown: [
            { label: 'Average per Shift', value: `$${(totals.tips / totals.shifts).toFixed(2)}` },
            { label: 'Tip % of Sales', value: `${((totals.tips / totals.sales) * 100).toFixed(1)}%` },
            { label: 'Best Day Tips', value: detailData.best ? `$${detailData.best.tips.toFixed(2)}` : '-' },
          ],
        };
      case 'totalCashTips':
        return {
          title: 'Total Cash Tips',
          icon: Banknote,
          mainValue: `$${totals.cashTips.toFixed(2)}`,
          subtitle: 'Cash tips received',
          color: 'emerald',
          chartDataKey: 'cashTips',
          chartColor: '#10B981',
          formatValue: (v: number) => `$${v.toFixed(2)}`,
          breakdown: [
            { label: 'Average per Shift', value: `$${(totals.cashTips / totals.shifts).toFixed(2)}` },
            { label: '% of Total Tips', value: `${totals.tips > 0 ? ((totals.cashTips / totals.tips) * 100).toFixed(1) : 0}%` },
            { label: 'Best Day Cash', value: detailData.best ? `$${detailData.best.cashTips.toFixed(2)}` : '-' },
          ],
        };
      case 'totalCreditTips':
        return {
          title: 'Total Credit Tips',
          icon: CreditCard,
          mainValue: `$${totals.creditTips.toFixed(2)}`,
          subtitle: 'Credit card tips',
          color: 'blue',
          chartDataKey: 'creditTips',
          chartColor: '#3B82F6',
          formatValue: (v: number) => `$${v.toFixed(2)}`,
          breakdown: [
            { label: 'Average per Shift', value: `$${(totals.creditTips / totals.shifts).toFixed(2)}` },
            { label: '% of Total Tips', value: `${totals.tips > 0 ? ((totals.creditTips / totals.tips) * 100).toFixed(1) : 0}%` },
            { label: 'Best Day Credit', value: detailData.best ? `$${detailData.best.creditTips.toFixed(2)}` : '-' },
          ],
        };
      case 'totalAlcoholSales':
        return {
          title: 'Total Alcohol Sales',
          icon: Wine,
          mainValue: `$${totals.alcoholSales.toFixed(2)}`,
          subtitle: `${totals.sales > 0 ? ((totals.alcoholSales / totals.sales) * 100).toFixed(1) : 0}% of total sales`,
          color: 'rose',
          chartDataKey: 'alcoholSales',
          chartColor: '#E11D48',
          formatValue: (v: number) => `$${v.toFixed(2)}`,
          breakdown: [
            { label: 'Average per Shift', value: `$${(totals.alcoholSales / totals.shifts).toFixed(2)}` },
            { label: 'Total Sales', value: `$${totals.sales.toFixed(2)}` },
            { label: 'Best Day', value: detailData.best ? `$${detailData.best.alcoholSales.toFixed(2)}` : '-' },
          ],
        };
      case 'tipsPerHour':
        const tph = totals.hours > 0 ? totals.tips / totals.hours : 0;
        return {
          title: 'Tips per Hour',
          icon: Clock,
          mainValue: `$${tph.toFixed(2)}/hr`,
          subtitle: 'Tip earnings rate',
          color: 'blue',
          chartDataKey: 'tipsPerHour',
          chartColor: '#3B82F6',
          formatValue: (v: number) => `$${v.toFixed(2)}`,
          breakdown: [
            { label: 'Total Tips', value: `$${totals.tips.toFixed(2)}` },
            { label: 'Total Hours', value: totals.hours.toFixed(1) },
            { label: 'Best Rate', value: detailData.best ? `$${detailData.best.tipsPerHour.toFixed(2)}/hr` : '-' },
          ],
        };
      case 'avgPerGuest':
        const apg = totals.guests > 0 ? totals.tips / totals.guests : 0;
        return {
          title: 'Average per Guest',
          icon: Users,
          mainValue: `$${apg.toFixed(2)}`,
          subtitle: 'Tip per guest served',
          color: 'orange',
          chartDataKey: 'perGuest',
          chartColor: '#F59E0B',
          formatValue: (v: number) => `$${v.toFixed(2)}`,
          breakdown: [
            { label: 'Total Tips', value: `$${totals.tips.toFixed(2)}` },
            { label: 'Total Guests', value: totals.guests.toString() },
            { label: 'Best per Guest', value: detailData.best ? `$${detailData.best.perGuest.toFixed(2)}` : '-' },
          ],
        };
      case 'avgTipPercent':
        const atp = totals.sales > 0 ? (totals.tips / totals.sales) * 100 : 0;
        return {
          title: 'Average Tip Percentage',
          icon: Percent,
          mainValue: `${atp.toFixed(1)}%`,
          subtitle: 'Tips as % of sales',
          color: 'purple',
          chartDataKey: 'tipPercent',
          chartColor: '#8B5CF6',
          formatValue: (v: number) => `${v.toFixed(1)}%`,
          breakdown: [
            { label: 'Total Tips', value: `$${totals.tips.toFixed(2)}` },
            { label: 'Total Sales', value: `$${totals.sales.toFixed(2)}` },
            { label: 'Best Tip %', value: detailData.best ? `${detailData.best.tipPercent.toFixed(1)}%` : '-' },
          ],
        };
      case 'totalShifts':
        return {
          title: 'Total Shifts',
          icon: Calendar,
          mainValue: totals.shifts.toString(),
          subtitle: 'Shifts worked this period',
          color: 'slate',
          chartDataKey: 'shiftCount',
          chartColor: '#64748B',
          formatValue: (v: number) => v.toString(),
          breakdown: [
            { label: 'Singles', value: entries.filter(e => e.shift !== 'Double').length.toString() },
            { label: 'Doubles', value: entries.filter(e => e.shift === 'Double').length.toString() },
            { label: 'Total Hours', value: totals.hours.toFixed(1) },
          ],
        };
      case 'totalHours':
        return {
          title: 'Total Hours',
          icon: Clock,
          mainValue: totals.hours.toFixed(1),
          subtitle: 'Hours worked this period',
          color: 'indigo',
          chartDataKey: 'hoursWorked',
          chartColor: '#6366F1',
          formatValue: (v: number) => v.toFixed(1),
          breakdown: [
            { label: 'Avg per Shift', value: (totals.hours / totals.shifts).toFixed(1) },
            { label: 'Earnings per Hour', value: `$${(totals.earnings / totals.hours).toFixed(2)}` },
            { label: 'Total Shifts', value: totals.shifts.toString() },
          ],
        };
      default:
        return null;
    }
  };

  const config = getMetricConfig();
  if (!config) return null;

  const Icon = config.icon;

  // Get header gradient based on color
  const getHeaderGradient = () => {
    switch (config.color) {
      case 'emerald':
        return 'bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-600';
      case 'blue':
        return 'bg-gradient-to-r from-blue-600 via-blue-500 to-blue-600';
      case 'orange':
        return 'bg-gradient-to-r from-orange-600 via-orange-500 to-orange-600';
      case 'indigo':
        return 'bg-gradient-to-r from-indigo-600 via-indigo-500 to-indigo-600';
      case 'slate':
        return 'bg-gradient-to-r from-slate-600 via-slate-500 to-slate-600';
      case 'purple':
      default:
        return 'bg-gradient-to-r from-purple-600 via-purple-500 to-purple-600';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-screen h-screen max-w-none p-0 gap-0 border-0 flex flex-col">
        {/* Dynamic Color Header */}
        <div className={`sticky top-0 z-10 h-[130px] ${getHeaderGradient()} px-6 pt-[50px] flex items-center justify-between`}>
          <h2 className="text-2xl font-semibold text-white">
            {config.title}
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 text-white"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        {/* Scrollable Content */}
        <div className="overflow-y-auto flex-1 bg-background">
          <div className="p-4 space-y-4">
            {/* Main Value */}
            <div className="text-center py-2">
              <p className="text-4xl font-bold text-foreground">{config.mainValue}</p>
              <p className="text-muted-foreground text-sm mt-1">{config.subtitle}</p>
              <p className="text-muted-foreground/70 text-xs mt-1">{timeFrameLabel}</p>
            </div>

            {/* Trend Chart */}
            {detailData.entries.length > 1 && (
              <div className="bg-muted/30 rounded-lg p-3">
                <p className="text-sm font-medium mb-2 text-muted-foreground">Trend Over Time</p>
                <div className="h-32">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={detailData.entries}>
                      <defs>
                        <linearGradient id={`gradient-${metricType}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={config.chartColor} stopOpacity={0.3}/>
                          <stop offset="95%" stopColor={config.chartColor} stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="date" fontSize={10} stroke="hsl(var(--muted-foreground))" />
                      <YAxis fontSize={10} stroke="hsl(var(--muted-foreground))" />
                      <Tooltip 
                        formatter={(value) => [config.formatValue(Number(value)), config.title]}
                        contentStyle={{
                          backgroundColor: 'hsl(var(--background))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                        }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey={config.chartDataKey} 
                        stroke={config.chartColor} 
                        fill={`url(#gradient-${metricType})`}
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* By Day of Week */}
            <div className="bg-muted/30 rounded-lg p-3">
              <p className="text-sm font-medium mb-2 text-muted-foreground">By Day of Week</p>
              <div className="h-28">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={detailData.byDayOfWeek}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="day" fontSize={10} stroke="hsl(var(--muted-foreground))" />
                    <YAxis fontSize={10} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip 
                      formatter={(value) => [config.formatValue(Number(value)), 'Avg']}
                      contentStyle={{
                        backgroundColor: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Bar dataKey="value" fill={config.chartColor} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Breakdown */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Breakdown</p>
              {config.breakdown.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center py-2 border-b border-border/50 last:border-0">
                  <span className="text-sm text-muted-foreground">{item.label}</span>
                  <span className="font-medium">{item.value}</span>
                </div>
              ))}
            </div>

            {/* Best & Worst */}
            {detailData.best && detailData.worst && detailData.entries.length > 1 && (
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-emerald-500/10 rounded-lg p-3">
                  <div className="flex items-center gap-1 text-emerald-600 mb-1">
                    <ArrowUp className="h-4 w-4" />
                    <span className="text-xs font-medium">Best Day</span>
                  </div>
                  <p className="text-sm font-bold">{detailData.best.date}</p>
                  <p className="text-xs text-muted-foreground">{detailData.best.dayOfWeek}</p>
                </div>
                <div className="bg-red-500/10 rounded-lg p-3">
                  <div className="flex items-center gap-1 text-red-600 mb-1">
                    <ArrowDown className="h-4 w-4" />
                    <span className="text-xs font-medium">Needs Improvement</span>
                  </div>
                  <p className="text-sm font-bold">{detailData.worst.date}</p>
                  <p className="text-xs text-muted-foreground">{detailData.worst.dayOfWeek}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
