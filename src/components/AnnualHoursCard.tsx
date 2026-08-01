import React, { useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Clock, Plus, Save, X, Pencil } from 'lucide-react';
import { TipEntry } from '@/hooks/useTipEntries';
import {
  startOfYear, endOfYear, startOfWeek, endOfWeek, endOfMonth,
  isWithinInterval, differenceInDays, format,
} from 'date-fns';

interface AnnualHoursCardProps {
  yearlyHoursGoal: number;
  onSave: (hours: number) => Promise<void>;
  tipEntries: TipEntry[];
}

const getMonthKeyBySunday = (date: Date) =>
  format(startOfWeek(date, { weekStartsOn: 0 }), 'yyyy-MM');

export const AnnualHoursCard: React.FC<AnnualHoursCardProps> = ({
  yearlyHoursGoal,
  onSave,
  tipEntries,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(yearlyHoursGoal ? String(yearlyHoursGoal) : '');
  const [isSaving, setIsSaving] = useState(false);

  const realEntries = useMemo(
    () => tipEntries.filter(e => !e.isPlaceholder),
    [tipEntries]
  );

  const m = useMemo(() => {
    const now = new Date();
    const yearStart = startOfYear(now);
    const yearEnd = endOfYear(now);
    const weekStart = startOfWeek(now, { weekStartsOn: 0 });
    const weekEnd = endOfWeek(now, { weekStartsOn: 0 });
    const monthKey = getMonthKeyBySunday(now);

    const inYear = realEntries.filter(e =>
      isWithinInterval(e.date, { start: yearStart, end: yearEnd })
    );
    const hoursYTD = inYear.reduce((s, e) => s + e.hoursWorked, 0);
    const weekHours = realEntries
      .filter(e => isWithinInterval(e.date, { start: weekStart, end: weekEnd }))
      .reduce((s, e) => s + e.hoursWorked, 0);
    const monthHours = realEntries
      .filter(e => getMonthKeyBySunday(e.date) === monthKey)
      .reduce((s, e) => s + e.hoursWorked, 0);

    const remaining = Math.max(0, yearlyHoursGoal - hoursYTD);
    const daysPassed = Math.max(1, differenceInDays(now, yearStart) + 1);
    const daysLeftInYear = Math.max(0, differenceInDays(yearEnd, now) + 1);
    const weeksRemaining = Math.max(1, Math.ceil(daysLeftInYear / 7));
    const monthsRemaining = Math.max(1, 12 - now.getMonth() - (now.getDate() > 15 ? 0 : 0));
    const daysLeftInMonth = Math.max(0, differenceInDays(endOfMonth(now), now) + 1);

    const percentage = yearlyHoursGoal > 0
      ? Math.min((hoursYTD / yearlyHoursGoal) * 100, 100) : 0;
    const expected = yearlyHoursGoal > 0 ? (daysPassed / 365) * yearlyHoursGoal : 0;
    const pace = hoursYTD - expected;
    const isOnTrack = hoursYTD >= expected;

    const neededPerWeek = remaining / weeksRemaining;
    const neededPerMonth = remaining / monthsRemaining;

    const avgHoursPerShift = inYear.length > 0 ? hoursYTD / inYear.length : 0;
    const shiftsNeeded = avgHoursPerShift > 0 ? Math.ceil(remaining / avgHoursPerShift) : 0;

    return {
      hoursYTD, weekHours, monthHours, remaining, weeksRemaining, monthsRemaining,
      percentage, pace, isOnTrack, neededPerWeek, neededPerMonth, shiftsNeeded,
      avgHoursPerShift, daysLeftInMonth,
    };
  }, [realEntries, yearlyHoursGoal]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(Math.max(0, parseFloat(draft) || 0));
      setIsEditing(false);
    } finally {
      setIsSaving(false);
    }
  };

  const Editor = (
    <div className="bg-card rounded-lg p-4 space-y-3">
      <div className="space-y-2">
        <Label htmlFor="yearlyHours">Annual Hours Goal</Label>
        <Input
          id="yearlyHours"
          type="number"
          step="1"
          min="0"
          placeholder="e.g. 1600"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
        />
        <p className="text-xs text-muted-foreground">
          {parseFloat(draft) > 0
            ? `${(parseFloat(draft) / 12).toFixed(0)} hrs/month · ${(parseFloat(draft) / 52).toFixed(1)} hrs/week`
            : 'We\u2019ll break it into monthly and weekly targets'}
        </p>
      </div>
      <div className="flex gap-2">
        <Button onClick={handleSave} disabled={isSaving} className="flex-1">
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? 'Saving...' : 'Save Hours Goal'}
        </Button>
        <Button
          variant="ghost"
          onClick={() => { setIsEditing(false); setDraft(yearlyHoursGoal ? String(yearlyHoursGoal) : ''); }}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );

  if (!yearlyHoursGoal) {
    return (
      <Card className="overflow-hidden border-0 shadow-depth-lg">
        <div className="bg-gradient-to-br from-sky-500 to-indigo-600 p-6 text-white">
          {isEditing ? Editor : (
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-full bg-white/10 mx-auto mb-4 flex items-center justify-center">
                <Clock className="h-8 w-8 text-white/70" />
              </div>
              <h3 className="heading-sm text-white mb-2">Set Your Annual Hours Goal</h3>
              <p className="body-md text-white/70 mb-4">
                Track hours worked this year and see what you need each month & week
              </p>
              <Button onClick={() => setIsEditing(true)} variant="secondary">
                <Plus className="h-4 w-4 mr-2" />
                Set Hours Goal
              </Button>
            </div>
          )}
        </div>
      </Card>
    );
  }

  const weeklyTarget = yearlyHoursGoal / 52;
  const monthlyTarget = yearlyHoursGoal / 12;
  const weekProgress = Math.min((m.weekHours / weeklyTarget) * 100, 100);
  const monthProgress = Math.min((m.monthHours / monthlyTarget) * 100, 100);

  return (
    <Card className="overflow-hidden border-0 shadow-depth-lg">
      <div className="bg-gradient-to-br from-sky-500 to-indigo-600 p-5 text-white">
        {isEditing ? Editor : (
          <>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                <span className="label-lg text-white">Annual Hours Goal</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`label-sm px-2.5 py-1 rounded-full text-white ${m.isOnTrack ? 'bg-emerald-400/30' : 'bg-amber-400/30'}`}>
                  {m.isOnTrack ? 'On Track' : 'Behind'}
                </span>
                <button
                  type="button"
                  aria-label="Edit hours goal"
                  onClick={() => { setDraft(String(yearlyHoursGoal)); setIsEditing(true); }}
                  className="p-1 rounded-md hover:bg-white/15"
                >
                  <Pencil className="h-4 w-4 opacity-80" />
                </button>
              </div>
            </div>

            <div className="flex items-end justify-between mb-3">
              <div>
                <p className="text-3xl font-bold">{m.hoursYTD.toFixed(0)} hrs</p>
                <p className="body-sm text-white/60">of {yearlyHoursGoal.toLocaleString()} hrs</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">{m.percentage.toFixed(0)}%</p>
                <p className="body-sm text-white/60">
                  {m.pace >= 0 ? `+${m.pace.toFixed(0)}` : m.pace.toFixed(0)} hrs vs pace
                </p>
              </div>
            </div>
            <Progress value={m.percentage} className="h-2.5 bg-white/20" />

            {/* What's needed */}
            <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-white/15">
              <div className="text-center">
                <p className="label-sm text-white/50 mb-1">Need / Month</p>
                <p className="font-semibold text-white">{m.neededPerMonth.toFixed(0)} hrs</p>
                <p className="body-sm text-white/50">{m.monthsRemaining} mo left</p>
              </div>
              <div className="text-center">
                <p className="label-sm text-white/50 mb-1">Need / Week</p>
                <p className="font-semibold text-white">{m.neededPerWeek.toFixed(1)} hrs</p>
                <p className="body-sm text-white/50">{m.weeksRemaining} wk left</p>
              </div>
            </div>

            {/* Current period gauges */}
            <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-white/15">
              <div className="text-center">
                <p className="label-sm text-white/50 mb-1">This Week</p>
                <p className="font-semibold text-white">{m.weekHours.toFixed(1)} hrs</p>
                <p className="body-sm text-white/50">of {weeklyTarget.toFixed(1)}</p>
                <div className="mt-1.5 h-1 bg-white/20 rounded-full overflow-hidden">
                  <div className="h-full bg-white/70 rounded-full transition-all" style={{ width: `${weekProgress}%` }} />
                </div>
              </div>
              <div className="text-center">
                <p className="label-sm text-white/50 mb-1">This Month</p>
                <p className="font-semibold text-white">{m.monthHours.toFixed(1)} hrs</p>
                <p className="body-sm text-white/50">of {monthlyTarget.toFixed(0)}</p>
                <div className="mt-1.5 h-1 bg-white/20 rounded-full overflow-hidden">
                  <div className="h-full bg-white/70 rounded-full transition-all" style={{ width: `${monthProgress}%` }} />
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-white/15 grid grid-cols-3 gap-2">
              <div className="text-center">
                <p className="font-semibold text-white">{m.remaining.toFixed(0)}</p>
                <p className="text-xs text-white/50">Hrs left</p>
              </div>
              <div className="text-center">
                <p className="font-semibold text-white">{m.avgHoursPerShift.toFixed(1)}</p>
                <p className="text-xs text-white/50">Hrs / shift</p>
              </div>
              <div className="text-center">
                <p className="font-semibold text-white">{m.shiftsNeeded}</p>
                <p className="text-xs text-white/50">Shifts left</p>
              </div>
            </div>
          </>
        )}
      </div>
    </Card>
  );
};
