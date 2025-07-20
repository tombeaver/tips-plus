import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";
import { format, isToday } from "date-fns";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
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
  const formatDate = (date: Date): string => {
    const entry = getEntryForDate(date);
    if (!entry) return date.getDate().toString();
    
    const earnings = getTotalEarnings(entry);
    return earnings > 0 ? `$${earnings.toFixed(0)}` : date.getDate().toString();
  };

  const hasEntryForDate = (date: Date): boolean => {
    return !!getEntryForDate(date);
  };

  return (
    <DayPicker
      showOutsideDays={true}
      className={cn("p-4", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center mb-4",
        caption_label: "text-lg font-semibold",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-8 w-8 bg-transparent p-0 opacity-70 hover:opacity-100"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex mb-2",
        head_cell: "text-muted-foreground rounded-md w-16 h-8 font-medium text-sm flex items-center justify-center",
        row: "flex w-full mb-1",
        cell: "relative flex-1",
        day: cn(
          "h-16 w-16 p-1 font-medium text-xs flex flex-col items-center justify-center rounded-lg border-2 border-transparent transition-all duration-200 hover:border-primary/30 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
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
                "h-16 w-16 p-1 font-medium text-xs flex flex-col items-center justify-center rounded-lg border-2 border-transparent transition-all duration-200 hover:border-primary/30 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                !isCurrentMonth && "text-muted-foreground/50 opacity-50",
                todayDate && !hasEntry && "border-primary bg-primary/10 text-primary font-bold",
                todayDate && hasEntry && "border-primary bg-primary text-primary-foreground font-bold",
                !todayDate && hasEntry && "bg-green-100 text-green-800 border-green-200 hover:bg-green-200",
                selected && date.toDateString() === selected.toDateString() && "ring-2 ring-primary ring-offset-2"
              )}
              onClick={() => onSelect?.(date)}
              disabled={!isCurrentMonth}
            >
              <span className={cn("text-sm font-bold", hasEntry && "text-xs")}>{dayNumber}</span>
              {hasEntry && earnings > 0 && (
                <span className={cn(
                  "text-xs font-semibold mt-0.5 leading-none",
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
  );
}