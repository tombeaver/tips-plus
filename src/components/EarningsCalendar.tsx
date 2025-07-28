import * as React from "react";
import { ChevronLeft, ChevronRight, ChevronDown, ChevronUp } from "lucide-react";
import { DayPicker } from "react-day-picker";
import { format, isToday, startOfWeek, endOfWeek, addWeeks, subWeeks, isSameWeek } from "date-fns";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Button } from "@/components/ui/button";
import { TipEntry } from "@/hooks/useTipEntries";

interface EarningsCalendarProps {
  className?: string;
  selected?: Date;
  onSelect?: (date: Date | undefined) => void;
  tipEntries: TipEntry[];
  getTotalEarnings: (entry: TipEntry) => number;
  getEntryForDate: (date: Date) => TipEntry | undefined;
}

export function EarningsCalendar({
  className,
  selected,
  onSelect,
  tipEntries,
  getTotalEarnings,
  getEntryForDate,
  ...props
}: EarningsCalendarProps) {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [currentWeek, setCurrentWeek] = React.useState(() => new Date());

  const formatDate = (date: Date): string => {
    const entry = getEntryForDate(date);
    if (!entry) return date.getDate().toString();
    
    const earnings = getTotalEarnings(entry);
    return earnings > 0 ? `$${earnings.toFixed(0)}` : date.getDate().toString();
  };

  const hasEntryForDate = (date: Date): boolean => {
    return !!getEntryForDate(date);
  };

  const weekStart = startOfWeek(currentWeek);
  const weekEnd = endOfWeek(currentWeek);
  
  const handlePreviousWeek = () => {
    setCurrentWeek(prev => subWeeks(prev, 1));
  };

  const handleNextWeek = () => {
    setCurrentWeek(prev => addWeeks(prev, 1));
  };

  if (isExpanded) {
    // Full month view
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Monthly View</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(false)}
            className="flex items-center gap-1"
          >
            <ChevronUp className="h-4 w-4" />
            Collapse
          </Button>
        </div>
        <DayPicker
          showOutsideDays={true}
          className={cn("p-4", className)}
          classNames={{
            months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
            month: "space-y-3",
            caption: "flex justify-center pt-1 relative items-center mb-3",
            caption_label: "text-base font-semibold",
            nav: "space-x-1 flex items-center",
            nav_button: cn(
              buttonVariants({ variant: "outline" }),
              "h-7 w-7 bg-transparent p-0 opacity-70 hover:opacity-100"
            ),
            nav_button_previous: "absolute left-1",
            nav_button_next: "absolute right-1",
            table: "w-full border-collapse",
            head_row: "flex mb-1",
            head_cell: "text-muted-foreground rounded-md w-12 h-6 font-medium text-xs flex items-center justify-center",
            row: "flex w-full mb-1",
            cell: "relative flex-1",
            day: cn(
              "h-12 w-12 p-1 font-medium text-xs flex flex-col items-center justify-center rounded-md border border-transparent transition-all duration-200 hover:border-primary/30 focus:outline-none focus:ring-1 focus:ring-primary focus:ring-offset-1"
            ),
            day_range_end: "day-range-end",
            day_selected: "bg-primary text-primary-foreground border-primary hover:bg-primary hover:text-primary-foreground",
            day_today: "border-primary bg-primary/10 text-primary font-bold",
            day_outside: "text-muted-foreground/50 opacity-50",
            day_disabled: "text-muted-foreground/30 opacity-30",
            day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
            day_hidden: "invisible",
          }}
          components={{
            IconLeft: ({ ..._props }) => <ChevronLeft className="h-4 w-4" />,
            IconRight: ({ ..._props }) => <ChevronRight className="h-4 w-4" />,
            Day: ({ date, displayMonth }) => {
              const entry = getEntryForDate(date);
              const earnings = entry ? getTotalEarnings(entry) : 0;
              const dayNumber = date.getDate();
              const isCurrentMonth = date.getMonth() === displayMonth.getMonth();
              const todayDate = isToday(date);
              const hasEntry = hasEntryForDate(date);
              
              return (
                <button
                  className={cn(
                    "h-12 w-12 p-1 font-medium text-xs flex flex-col items-center justify-center rounded-md border border-transparent transition-all duration-200 hover:border-primary/30 focus:outline-none focus:ring-1 focus:ring-primary focus:ring-offset-1",
                    !isCurrentMonth && "text-muted-foreground/50 opacity-50",
                    todayDate && !hasEntry && "border-primary bg-primary/10 text-primary font-bold",
                    todayDate && hasEntry && "border-primary bg-primary text-primary-foreground font-bold",
                    !todayDate && hasEntry && "bg-green-100 text-green-800 border-green-200 hover:bg-green-200",
                    selected && date.toDateString() === selected.toDateString() && "ring-1 ring-primary ring-offset-1"
                  )}
                  onClick={() => onSelect?.(date)}
                  disabled={!isCurrentMonth}
                >
                  <span className={cn("text-xs font-bold", hasEntry && "text-[10px]")}>{dayNumber}</span>
                  {hasEntry && earnings > 0 && (
                    <span className={cn(
                      "text-[10px] font-semibold mt-0.5 leading-none",
                      todayDate ? "text-primary-foreground" : "text-green-700"
                    )}>
                      ${earnings.toFixed(0)}
                    </span>
                  )}
                </button>
              );
            },
          }}
          selected={selected}
          onSelect={onSelect}
          {...props}
        />
      </div>
    );
  }

  // Weekly view
  const weekDays = [];
  for (let i = 0; i < 7; i++) {
    const day = new Date(weekStart);
    day.setDate(day.getDate() + i);
    weekDays.push(day);
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handlePreviousWeek}
            className="h-7 w-7 p-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h3 className="text-lg font-semibold">
            {format(weekStart, 'MMM d')} - {format(weekEnd, 'MMM d, yyyy')}
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleNextWeek}
            className="h-7 w-7 p-0"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(true)}
          className="flex items-center gap-1"
        >
          <ChevronDown className="h-4 w-4" />
          Full Month
        </Button>
      </div>
      
      {/* Week view grid */}
      <div className="grid grid-cols-7 gap-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="text-center text-xs font-medium text-muted-foreground p-2">
            {day}
          </div>
        ))}
        {weekDays.map((date) => {
          const entry = getEntryForDate(date);
          const earnings = entry ? getTotalEarnings(entry) : 0;
          const dayNumber = date.getDate();
          const todayDate = isToday(date);
          const hasEntry = hasEntryForDate(date);
          
          return (
            <button
              key={date.toISOString()}
              className={cn(
                "h-16 p-2 font-medium text-xs flex flex-col items-center justify-center rounded-md border border-transparent transition-all duration-200 hover:border-primary/30 focus:outline-none focus:ring-1 focus:ring-primary focus:ring-offset-1",
                todayDate && !hasEntry && "border-primary bg-primary/10 text-primary font-bold",
                todayDate && hasEntry && "border-primary bg-primary text-primary-foreground font-bold",
                !todayDate && hasEntry && "bg-green-100 text-green-800 border-green-200 hover:bg-green-200",
                selected && date.toDateString() === selected.toDateString() && "ring-2 ring-primary ring-offset-1"
              )}
              onClick={() => onSelect?.(date)}
            >
              <span className={cn("text-sm font-bold", hasEntry && "text-xs")}>{dayNumber}</span>
              {hasEntry && earnings > 0 && (
                <span className={cn(
                  "text-[10px] font-semibold mt-1 leading-none",
                  todayDate ? "text-primary-foreground" : "text-green-700"
                )}>
                  ${earnings.toFixed(0)}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}