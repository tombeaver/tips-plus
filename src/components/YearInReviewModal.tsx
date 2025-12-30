import { useEffect, useMemo, useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { TipEntry } from "@/hooks/useTipEntries";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  PartyPopper,
  Sparkles,
  Star,
  TrendingUp,
  Users,
} from "lucide-react";
import { format, getWeek, getYear } from "date-fns";
import useEmblaCarousel from "embla-carousel-react";

interface YearInReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  tipEntries: TipEntry[];
  /** Optional override (Index passes getReviewYear()). */
  year?: number;
}

interface YearStats {
  totalEarnings: number;
  totalCashTips: number;
  totalCreditTips: number;
  totalWages: number;
  totalShifts: number;
  totalAMShifts: number;
  totalPMShifts: number;
  totalDoubles: number;
  totalGuests: number;
  bestSectionLabel: string | null;
  bestShift: string | null;
  bestDay: { dateLabel: string; earnings: number; shift: string; sectionLabel: string } | null;
  avgPerShift: number;
  avgPerHour: number;
  avgPerGuest: number;
}

type Slide = {
  id: string;
  title: string;
  value: string;
  subLines?: string[];
  icon: React.ComponentType<{ className?: string }>;
  valueTone?: "primary" | "success" | "warning";
  isIntro?: boolean;
};

function cssHslVar(varName: string, fallback: string) {
  try {
    const raw = getComputedStyle(document.documentElement)
      .getPropertyValue(varName)
      .trim();
    if (!raw) return fallback;
    return `hsl(${raw})`;
  } catch {
    return fallback;
  }
}

export function YearInReviewModal({
  isOpen,
  onClose,
  tipEntries,
  year,
}: YearInReviewModalProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const reviewYear = year ?? getReviewYear();

  const stats = useMemo((): YearStats => {
    const yearEntries = tipEntries.filter((e) =>
      new Date(e.date).getFullYear() === reviewYear
    );

    const totalCashTips = yearEntries.reduce((sum, e) => sum + e.cashTips, 0);
    const totalCreditTips = yearEntries.reduce((sum, e) => sum + e.creditTips, 0);
    const totalTips = totalCashTips + totalCreditTips;

    const totalHours = yearEntries.reduce((sum, e) => sum + e.hoursWorked, 0);
    const totalWages = yearEntries.reduce(
      (sum, e) => sum + e.hoursWorked * e.hourlyRate,
      0
    );
    const totalEarnings = totalTips + totalWages;

    const totalGuests = yearEntries.reduce((sum, e) => sum + e.guestCount, 0);
    const totalShifts = yearEntries.length;

    // Shift type counts
    const totalAMShifts = yearEntries.filter((e) => e.shift === "AM").length;
    const totalPMShifts = yearEntries.filter((e) => e.shift === "PM").length;
    const totalDoubles = yearEntries.filter(
      (e) => e.shift === "Double" || e.hoursWorked >= 10
    ).length;

    // Best section (TipEntry.section is a label like "Section 3")
    const sectionTotals = new Map<string, number>();
    for (const e of yearEntries) {
      const earnings = e.cashTips + e.creditTips + e.hoursWorked * e.hourlyRate;
      sectionTotals.set(e.section, (sectionTotals.get(e.section) ?? 0) + earnings);
    }
    let bestSectionLabel: string | null = null;
    let bestSectionEarnings = -Infinity;
    sectionTotals.forEach((earnings, label) => {
      if (earnings > bestSectionEarnings) {
        bestSectionEarnings = earnings;
        bestSectionLabel = label;
      }
    });

    // Best shift type
    const shiftTotals = new Map<string, number>();
    for (const e of yearEntries) {
      const earnings = e.cashTips + e.creditTips + e.hoursWorked * e.hourlyRate;
      shiftTotals.set(e.shift, (shiftTotals.get(e.shift) ?? 0) + earnings);
    }
    let bestShift: string | null = null;
    let bestShiftEarnings = -Infinity;
    shiftTotals.forEach((earnings, shift) => {
      if (earnings > bestShiftEarnings) {
        bestShiftEarnings = earnings;
        bestShift = shift;
      }
    });

    // Best single day
    let bestDay: YearStats["bestDay"] = null;
    let bestDayEarnings = -Infinity;
    for (const e of yearEntries) {
      const earnings = e.cashTips + e.creditTips + e.hoursWorked * e.hourlyRate;
      if (earnings > bestDayEarnings) {
        bestDayEarnings = earnings;
        bestDay = {
          dateLabel: format(new Date(e.date), "MMMM d, yyyy"),
          earnings,
          shift: e.shift,
          sectionLabel: e.section,
        };
      }
    }

    return {
      totalEarnings,
      totalCashTips,
      totalCreditTips,
      totalWages,
      totalShifts,
      totalAMShifts,
      totalPMShifts,
      totalDoubles,
      totalGuests,
      bestSectionLabel,
      bestShift,
      bestDay,
      avgPerShift: totalShifts > 0 ? totalEarnings / totalShifts : 0,
      avgPerHour: totalHours > 0 ? totalEarnings / totalHours : 0,
      avgPerGuest: totalGuests > 0 ? totalEarnings / totalGuests : 0,
    };
  }, [tipEntries, reviewYear]);

  const hasData = stats.totalShifts > 0;

  const slides = useMemo<Slide[]>(() => {
    if (!hasData) {
      return [
        {
          id: "empty",
          title: `${reviewYear} Year in Review`,
          value: "No entries yet",
          subLines: ["Add a few tip entries and we'll build your recap automatically."],
          icon: CalendarDays,
          valueTone: "primary",
        },
      ];
    }

    return [
      {
        id: "intro",
        title: `${reviewYear} Year in Review`,
        value: "You crushed it!",
        subLines: [
          "Another year of hard work in the books.",
          "Let's celebrate your wins and see how you stacked up.",
        ],
        icon: PartyPopper,
        valueTone: "primary",
        isIntro: true,
      },
      {
        id: "earnings",
        title: "Total Earnings",
        value: `$${stats.totalEarnings.toLocaleString(undefined, {
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        })}`,
        subLines: [
          `Cash $${stats.totalCashTips.toLocaleString()}`,
          `Credit $${stats.totalCreditTips.toLocaleString()}`,
          `Wages $${stats.totalWages.toLocaleString()}`,
        ],
        icon: DollarSign,
        valueTone: "success",
      },
      {
        id: "shifts",
        title: "Shifts worked",
        value: `${stats.totalShifts}`,
        subLines: [
          `${stats.totalAMShifts} AM shifts`,
          `${stats.totalPMShifts} PM shifts`,
          `${stats.totalDoubles} doubles`,
          `${stats.totalGuests.toLocaleString()} guests served`,
        ],
        icon: CalendarDays,
        valueTone: "primary",
      },
      {
        id: "bestDay",
        title: "Best day",
        value: stats.bestDay
          ? `$${stats.bestDay.earnings.toLocaleString(undefined, {
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            })}`
          : "—",
        subLines: stats.bestDay
          ? [stats.bestDay.dateLabel, stats.bestDay.shift, stats.bestDay.sectionLabel]
          : [],
        icon: TrendingUp,
        valueTone: "primary",
      },
      {
        id: "avg",
        title: "Averages",
        value: `$${stats.avgPerShift.toFixed(0)} / shift`,
        subLines: [
          `$${stats.avgPerHour.toFixed(2)} / hour`,
          `$${stats.avgPerGuest.toFixed(2)} / guest`,
        ],
        icon: Users,
        valueTone: "primary",
      },
    ];
  }, [hasData, reviewYear, stats]);

  useEffect(() => {
    if (!isOpen) return;
    setCurrentSlide(0);

    // Confetti only when there is something to celebrate.
    if (!hasData) return;

    import("canvas-confetti").then((m) => {
      const confetti = m.default;
      const colors = [
        cssHslVar("--primary", "hsl(250 84% 54%)"),
        cssHslVar("--primary-glow", "hsl(250 100% 80%)"),
        cssHslVar("--prism-amber", "hsl(38 84% 64%)"),
        cssHslVar("--prism-rose", "hsl(350 84% 64%)"),
        cssHslVar("--prism-cyan", "hsl(180 84% 64%)"),
      ];

      confetti({
        particleCount: 70,
        spread: 70,
        origin: { y: 0.6 },
        colors,
      });
    });
  }, [isOpen, hasData]);

  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false });

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCurrentSlide(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", onSelect);
    onSelect();
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, onSelect]);

  const getValueToneClass = (tone?: "primary" | "success" | "warning") =>
    tone === "success"
      ? "text-success"
      : tone === "warning"
        ? "text-warning"
        : "text-primary";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="w-[calc(100vw-2rem)] max-w-md p-0 overflow-hidden border bg-gradient-prism-aurora shadow-depth-lg"
        aria-describedby={undefined}
        hideCloseButton
      >
        <DialogHeader className="px-5 py-4 bg-gradient-primary text-primary-foreground">
          <div className="flex items-center justify-between gap-4">
            <DialogTitle className="text-base font-semibold tracking-tight">
              Year in Review
            </DialogTitle>
            <div className="inline-flex items-center gap-2 rounded-full bg-primary-foreground/15 px-3 py-1">
              <Sparkles className="h-4 w-4" />
              <span className="text-xs font-medium">{reviewYear}</span>
            </div>
          </div>
        </DialogHeader>

        <main className="px-5 py-5 overflow-hidden">
          <div ref={emblaRef} className="overflow-hidden">
            <div className="flex">
              {slides.map((slide) => (
                <div key={slide.id} className="min-w-0 shrink-0 grow-0 basis-full">
                  <section className="rounded-xl border bg-background/90 backdrop-blur-sm p-5 h-[280px] flex flex-col relative overflow-hidden">
                    {/* Background decorative elements for data slides */}
                    {!slide.isIntro && (
                      <>
                        <div className="absolute -right-8 -bottom-8 h-32 w-32 rounded-full bg-primary/5 blur-2xl" />
                        <div className="absolute -left-4 -top-4 h-20 w-20 rounded-full bg-primary/5 blur-xl" />
                      </>
                    )}
                    
                    {slide.isIntro ? (
                      // Special intro slide layout
                      <div className="text-center py-2 flex-1 flex flex-col justify-center">
                        <div className="mx-auto mb-4 h-14 w-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shadow-inner-glow">
                          <slide.icon className="h-7 w-7" />
                        </div>
                        <p className="text-sm text-muted-foreground">{slide.title}</p>
                        <p className={`mt-1 text-3xl font-bold tracking-tight ${getValueToneClass(slide.valueTone)}`}>
                          {slide.value}
                        </p>
                        {!!slide.subLines?.length && (
                          <div className="mt-3 space-y-1">
                            {slide.subLines.map((line, idx) => (
                              <p key={idx} className="text-sm text-muted-foreground">{line}</p>
                            ))}
                          </div>
                        )}
                        {/* Swipe hint */}
                        <div className="mt-5 flex items-center justify-center gap-1 text-xs text-muted-foreground animate-pulse">
                          <ChevronLeft className="h-3 w-3" />
                          <span>Swipe to explore</span>
                          <ChevronRight className="h-3 w-3" />
                        </div>
                      </div>
                    ) : (
                      // Regular slide layout - centered with design elements
                      <div className="flex-1 flex flex-col justify-center relative z-10">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="h-12 w-12 shrink-0 rounded-xl bg-primary/10 text-primary flex items-center justify-center shadow-inner-glow">
                            <slide.icon className="h-6 w-6" />
                          </div>
                          <p className="text-sm font-medium text-muted-foreground">{slide.title}</p>
                        </div>
                        
                        <p className={`text-4xl font-bold tracking-tight ${getValueToneClass(slide.valueTone)}`}>
                          {slide.value}
                        </p>
                        
                        {!!slide.subLines?.length && (
                          <div className="mt-4 pt-4 border-t border-border/50 space-y-1.5">
                            {slide.subLines.map((line, idx) => (
                              <div key={idx} className="flex items-center gap-2">
                                <div className="h-1.5 w-1.5 rounded-full bg-primary/40" />
                                <p className="text-sm text-muted-foreground">{line}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </section>
                </div>
              ))}
            </div>
          </div>

          {/* Dot indicators */}
          <div className="mt-4 flex items-center justify-center gap-2">
            {slides.map((s, i) => (
              <button
                key={s.id}
                onClick={() => emblaApi?.scrollTo(i)}
                className={`h-2 rounded-full transition-all ${
                  i === currentSlide
                    ? "w-6 bg-primary"
                    : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
                }`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        </main>

        <footer className="px-5 py-4 border-t bg-card flex flex-col gap-3">
          <div className="flex items-center justify-center gap-2">
            <Checkbox 
              id="dontShowAgain" 
              checked={dontShowAgain}
              onCheckedChange={(checked) => setDontShowAgain(checked === true)}
            />
            <Label htmlFor="dontShowAgain" className="text-sm text-muted-foreground cursor-pointer">
              Don't show again this year
            </Label>
          </div>
          <Button 
            onClick={() => {
              if (dontShowAgain) {
                markYearInReviewDismissed(reviewYear);
              }
              onClose();
            }} 
            className="w-full"
          >
            {currentSlide === slides.length - 1 ? "Done" : "Close"}
          </Button>
        </footer>
      </DialogContent>
    </Dialog>
  );
}

// Helper function to check if we're in the review period (week 52 or week 1)
export function isInReviewPeriod(): boolean {
  const now = new Date();
  const week = getWeek(now, { weekStartsOn: 0 });
  return week === 52 || week === 1 || week === 53;
}

// Helper function to check if review should show (24h delay after close)
export function shouldShowYearInReview(): boolean {
  if (!isInReviewPeriod()) return false;

  const reviewYear = getReviewYear();
  
  // Check if permanently dismissed for this year
  const dismissed = localStorage.getItem("yearInReviewDismissed");
  if (dismissed === String(reviewYear)) return false;

  // Check if 24 hours have passed since last closed
  const lastClosed = localStorage.getItem("yearInReviewLastClosed");
  if (!lastClosed) return true;

  const lastClosedTime = parseInt(lastClosed, 10);
  const now = Date.now();
  const twentyFourHours = 24 * 60 * 60 * 1000;
  
  return now - lastClosedTime >= twentyFourHours;
}

// Helper to mark review as closed (starts 24h timer)
export function markYearInReviewShown(): void {
  localStorage.setItem("yearInReviewLastClosed", String(Date.now()));
}

// Helper to permanently dismiss review for a specific year
export function markYearInReviewDismissed(year: number): void {
  localStorage.setItem("yearInReviewDismissed", String(year));
}

// Get the year to review based on current date
// Week 52/53 (December) → show current year's review
// Week 1 (January) → show previous year's review
export function getReviewYear(): number {
  const now = new Date();
  const month = now.getMonth(); // 0 = January, 11 = December
  const currentYear = getYear(now);

  // If we're in January (month 0), show previous year's review
  if (month === 0) {
    return currentYear - 1;
  }

  // If we're in December (month 11), show current year's review
  return currentYear;
}
