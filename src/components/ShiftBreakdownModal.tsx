import React, { useMemo } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { TipEntry } from '@/hooks/useTipEntries';
import { format, startOfWeek, startOfDay, subYears } from 'date-fns';
import { X, Banknote, CreditCard, Clock, Users } from 'lucide-react';

interface ShiftBreakdownModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  entries: TipEntry[];
  /** Show a grouped summary above the shift list: weeks (month+ views) or days (week view) */
  groupBy?: 'week' | 'day' | 'none';
  /** Optional goal target for this period, renders a goal progress banner */
  goalTarget?: number;
  /** Full entry list — used to derive the same period one year earlier for comparison */
  allEntries?: TipEntry[];
}

export const ShiftBreakdownModal: React.FC<ShiftBreakdownModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  entries,
  groupBy = 'none',
  goalTarget,
  allEntries,
}) => {
  const shifts = useMemo(() => {
    return [...entries]
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .map(entry => {
        const tips = entry.creditTips + entry.cashTips;
        const wages = entry.hoursWorked * entry.hourlyRate;
        const earnings = tips + wages;
        return {
          id: entry.id,
          date: entry.date,
          tips,
          cashTips: entry.cashTips,
          creditTips: entry.creditTips,
          wages,
          earnings,
          hours: entry.hoursWorked,
          guests: entry.guestCount,
          sales: entry.totalSales,
          section: entry.section,
          shift: entry.shift,
          perHour: entry.hoursWorked > 0 ? earnings / entry.hoursWorked : 0,
          tipPercent: entry.totalSales > 0 ? (tips / entry.totalSales) * 100 : 0,
        };
      });
  }, [entries]);

  const totals = useMemo(() => {
    return shifts.reduce(
      (acc, s) => ({
        earnings: acc.earnings + s.earnings,
        tips: acc.tips + s.tips,
        wages: acc.wages + s.wages,
        hours: acc.hours + s.hours,
        shifts: acc.shifts + (s.shift === 'Double' ? 2 : 1),
      }),
      { earnings: 0, tips: 0, wages: 0, hours: 0, shifts: 0 }
    );
  }, [shifts]);

  const best = shifts.length ? Math.max(...shifts.map(s => s.earnings)) : 0;

  const groups = useMemo(() => {
    if (groupBy === 'none') return [];
    const map = new Map<string, { start: Date; earnings: number; tips: number; sales: number; hours: number; shifts: number }>();
    shifts.forEach(s => {
      const start = groupBy === 'week' ? startOfWeek(s.date, { weekStartsOn: 0 }) : startOfDay(s.date);
      const key = format(start, 'yyyy-MM-dd');
      const g = map.get(key) ?? { start, earnings: 0, tips: 0, sales: 0, hours: 0, shifts: 0 };
      g.earnings += s.earnings;
      g.tips += s.tips;
      g.sales += s.sales;
      g.hours += s.hours;
      g.shifts += s.shift === 'Double' ? 2 : 1;
      map.set(key, g);
    });
    return [...map.values()].sort((a, b) => a.start.getTime() - b.start.getTime());
  }, [shifts, groupBy]);

  const bestGroup = groups.length ? Math.max(...groups.map(w => w.earnings)) : 0;

  // Same period, one year earlier
  const prevGroups = useMemo(() => {
    if (groupBy === 'none' || !allEntries?.length || entries.length === 0) return [];
    const times = entries.map(e => e.date.getTime());
    const from = subYears(startOfDay(new Date(Math.min(...times))), 1);
    const to = subYears(startOfDay(new Date(Math.max(...times))), 1);
    const rangeStart = groupBy === 'week' ? startOfWeek(from, { weekStartsOn: 0 }) : from;
    const inRange = allEntries.filter(e => {
      const t = startOfDay(e.date).getTime();
      return t >= rangeStart.getTime() && t <= to.getTime() + 6 * 864e5;
    });
    if (!inRange.length) return [];
    const map = new Map<string, { start: Date; earnings: number }>();
    inRange.forEach(e => {
      const start = groupBy === 'week' ? startOfWeek(e.date, { weekStartsOn: 0 }) : startOfDay(e.date);
      const key = format(start, 'yyyy-MM-dd');
      const g = map.get(key) ?? { start, earnings: 0 };
      g.earnings += e.creditTips + e.cashTips + e.hoursWorked * e.hourlyRate;
      map.set(key, g);
    });
    return [...map.values()].sort((a, b) => a.start.getTime() - b.start.getTime());
  }, [allEntries, entries, groupBy]);

  const prevTotal = prevGroups.reduce((s, g) => s + g.earnings, 0);
  const bestBar = Math.max(bestGroup, ...prevGroups.map(g => g.earnings), 0);
  const groupAvg = groups.length ? groups.reduce((sum, g) => sum + g.earnings, 0) / groups.length : 0;
  const totalSales = shifts.reduce((sum, s) => sum + s.sales, 0);
  const overallTipPct = totalSales > 0 ? (totals.tips / totalSales) * 100 : 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-screen h-screen max-w-none p-0 gap-0 border-0 flex flex-col">
        <div className="sticky top-0 z-10 h-[130px] bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-600 px-6 pt-[50px] flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-white">{title}</h2>
            {subtitle && <p className="text-white/80 text-sm">{subtitle}</p>}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 text-white"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="overflow-y-auto flex-1 bg-background">
          <div className="p-4 space-y-4">
            <div className="text-center py-2">
              <p className="text-4xl font-bold text-foreground">${totals.earnings.toFixed(2)}</p>
              <p className="text-muted-foreground text-sm mt-1">
                {totals.shifts} shift{totals.shifts === 1 ? '' : 's'} · {totals.hours.toFixed(1)} hrs
              </p>
              <p className="text-muted-foreground/70 text-xs mt-1">
                ${totals.tips.toFixed(2)} tips · ${totals.wages.toFixed(2)} wages
              </p>
              {prevTotal > 0 && (
                <p className="text-xs mt-1">
                  <span className={totals.earnings >= prevTotal ? 'text-success' : 'text-destructive'}>
                    {totals.earnings >= prevTotal ? '+' : ''}
                    {(((totals.earnings - prevTotal) / prevTotal) * 100).toFixed(1)}%
                  </span>
                  <span className="text-muted-foreground/70"> vs last year (${prevTotal.toFixed(0)})</span>
                </p>
              )}
              {totalSales > 0 && (
                <p className="text-muted-foreground/70 text-xs mt-0.5">
                  {overallTipPct.toFixed(1)}% avg tip on ${totalSales.toFixed(0)} sales
                </p>
              )}
            </div>

            {goalTarget !== undefined && goalTarget > 0 && (
              <div className="rounded-lg border border-border/60 bg-muted/20 p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-muted-foreground">Goal ${goalTarget.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                  <span className={`text-sm font-semibold ${totals.earnings >= goalTarget ? 'text-success' : 'text-destructive'}`}>
                    {totals.earnings >= goalTarget
                      ? `+$${(totals.earnings - goalTarget).toFixed(0)}`
                      : `-$${(goalTarget - totals.earnings).toFixed(0)}`}
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className={`h-full rounded-full ${totals.earnings >= goalTarget ? 'bg-success' : 'bg-destructive/60'}`}
                    style={{ width: `${Math.min((totals.earnings / goalTarget) * 100, 100)}%` }}
                  />
                </div>
              </div>
            )}

            {groups.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-muted-foreground">
                    {groupBy === 'week' ? 'Week by week' : 'Day by day'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Avg ${groupAvg.toFixed(2)}/{groupBy === 'week' ? 'week' : 'day'}
                  </p>
                </div>
                {prevGroups.length > 0 && (
                  <div className="flex items-center gap-4 text-[11px] text-muted-foreground">
                    <span className="flex items-center gap-1"><span className="h-1.5 w-4 rounded-full bg-emerald-500" /> This period</span>
                    <span className="flex items-center gap-1"><span className="h-1.5 w-4 rounded-full bg-muted-foreground/40" /> Last year</span>
                  </div>
                )}
                {groups.map((w, i) => {
                  const prev = prevGroups[i];
                  return (
                  <div key={w.start.toISOString()} className="rounded-lg border border-border/60 bg-muted/20 p-3">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-foreground text-sm">
                        {groupBy === 'week' ? `Week of ${format(w.start, 'MMM d')}` : format(w.start, 'EEE, MMM d')}
                      </p>
                      <p className="font-bold text-emerald-600">${w.earnings.toFixed(2)}</p>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden mt-2">
                      <div className="h-full bg-emerald-500" style={{ width: `${bestBar > 0 ? (w.earnings / bestBar) * 100 : 0}%` }} />
                    </div>
                    {prev ? (
                      <>
                        <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden mt-1">
                          <div className="h-full bg-muted-foreground/40" style={{ width: `${bestBar > 0 ? (prev.earnings / bestBar) * 100 : 0}%` }} />
                        </div>
                        <p className="text-[11px] text-muted-foreground/80 mt-1">
                          Last year ${prev.earnings.toFixed(0)} ({format(prev.start, 'MMM d, yyyy')})
                          {prev.earnings > 0 && (
                            <span className={w.earnings >= prev.earnings ? ' text-success' : ' text-destructive'}>
                              {' '}{w.earnings >= prev.earnings ? '+' : ''}
                              {(((w.earnings - prev.earnings) / prev.earnings) * 100).toFixed(0)}%
                            </span>
                          )}
                        </p>
                      </>
                    ) : null}
                    <div className="mt-2" />
                    <p className="text-xs text-muted-foreground">
                      {w.shifts} shift{w.shifts === 1 ? '' : 's'} · {w.hours.toFixed(1)} hrs · ${w.hours > 0 ? (w.earnings / w.hours).toFixed(2) : '0.00'}/hr
                      {w.sales > 0 ? ` · ${((w.tips / w.sales) * 100).toFixed(1)}% tips` : ''}
                    </p>
                  </div>
                  );
                })}
              </div>
            )}

            {shifts.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No shifts in this period</p>
            ) : (
              <div className="space-y-3">
                <p className="text-sm font-medium text-muted-foreground">Shifts worked</p>
                {shifts.map(s => (
                  <div key={s.id} className="rounded-lg border border-border/60 bg-muted/20 p-3">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-semibold text-foreground">{format(s.date, 'EEE, MMM d')}</p>
                        <p className="text-xs text-muted-foreground">
                          {s.shift} · {s.section}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-emerald-600">${s.earnings.toFixed(2)}</p>
                        <p className="text-xs text-muted-foreground">${s.perHour.toFixed(2)}/hr</p>
                      </div>
                    </div>

                    <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden mb-2">
                      <div
                        className="h-full bg-emerald-500"
                        style={{ width: `${best > 0 ? (s.earnings / best) * 100 : 0}%` }}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <CreditCard className="h-3 w-3" /> Credit ${s.creditTips.toFixed(2)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Banknote className="h-3 w-3" /> Cash ${s.cashTips.toFixed(2)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {s.hours.toFixed(1)} hrs · ${s.wages.toFixed(2)} wages
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" /> {s.guests} guests · {s.tipPercent.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
