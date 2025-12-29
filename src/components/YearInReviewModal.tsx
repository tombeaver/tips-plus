import { useEffect, useState, useMemo } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { 
  Calendar, 
  DollarSign, 
  Users, 
  Clock, 
  TrendingUp, 
  Star,
  Sparkles,
  ChevronRight,
  PartyPopper
} from "lucide-react";
import { TipEntry } from "@/hooks/useTipEntries";
import { getWeek, getYear, format } from "date-fns";

interface YearInReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  tipEntries: TipEntry[];
  year?: number;
}

interface YearStats {
  totalEarnings: number;
  totalTips: number;
  totalCashTips: number;
  totalCreditTips: number;
  totalShifts: number;
  totalDoubles: number;
  totalGuests: number;
  totalHours: number;
  bestSection: { section: number; earnings: number } | null;
  bestShift: { shift: string; earnings: number } | null;
  bestDay: TipEntry | null;
  avgPerShift: number;
  avgHourlyRate: number;
}

export function YearInReviewModal({
  isOpen,
  onClose,
  tipEntries,
  year = new Date().getFullYear() - 1,
}: YearInReviewModalProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showContent, setShowContent] = useState(false);

  // Calculate year stats
  const stats = useMemo((): YearStats => {
    const yearEntries = tipEntries.filter(entry => {
      const entryYear = new Date(entry.date).getFullYear();
      return entryYear === year;
    });

    if (yearEntries.length === 0) {
      return {
        totalEarnings: 0,
        totalTips: 0,
        totalCashTips: 0,
        totalCreditTips: 0,
        totalShifts: 0,
        totalDoubles: 0,
        totalGuests: 0,
        totalHours: 0,
        bestSection: null,
        bestShift: null,
        bestDay: null,
        avgPerShift: 0,
        avgHourlyRate: 0,
      };
    }

    const totalCashTips = yearEntries.reduce((sum, e) => sum + e.cashTips, 0);
    const totalCreditTips = yearEntries.reduce((sum, e) => sum + e.creditTips, 0);
    const totalTips = totalCashTips + totalCreditTips;
    const totalHours = yearEntries.reduce((sum, e) => sum + e.hoursWorked, 0);
    const totalWages = yearEntries.reduce((sum, e) => sum + (e.hoursWorked * e.hourlyRate), 0);
    const totalEarnings = totalTips + totalWages;
    const totalGuests = yearEntries.reduce((sum, e) => sum + e.guestCount, 0);
    const totalShifts = yearEntries.length;
    
    // Count doubles (shifts > 10 hours or entries with both AM and PM same day)
    const totalDoubles = yearEntries.filter(e => e.hoursWorked >= 10).length;

    // Best section
    const sectionMap = new Map<number, number>();
    yearEntries.forEach(e => {
      const sectionNum = typeof e.section === 'string' ? parseInt(e.section, 10) : e.section;
      const earnings = e.cashTips + e.creditTips + (e.hoursWorked * e.hourlyRate);
      sectionMap.set(sectionNum, (sectionMap.get(sectionNum) || 0) + earnings);
    });
    let bestSection: { section: number; earnings: number } | null = null;
    sectionMap.forEach((earnings, section) => {
      if (!bestSection || earnings > bestSection.earnings) {
        bestSection = { section, earnings };
      }
    });

    // Best shift type
    const shiftMap = new Map<string, number>();
    yearEntries.forEach(e => {
      const earnings = e.cashTips + e.creditTips + (e.hoursWorked * e.hourlyRate);
      shiftMap.set(e.shift, (shiftMap.get(e.shift) || 0) + earnings);
    });
    let bestShift: { shift: string; earnings: number } | null = null;
    shiftMap.forEach((earnings, shift) => {
      if (!bestShift || earnings > bestShift.earnings) {
        bestShift = { shift, earnings };
      }
    });

    // Best single day
    let bestDay: TipEntry | null = null;
    let bestDayEarnings = 0;
    yearEntries.forEach(e => {
      const earnings = e.cashTips + e.creditTips + (e.hoursWorked * e.hourlyRate);
      if (earnings > bestDayEarnings) {
        bestDayEarnings = earnings;
        bestDay = e;
      }
    });

    return {
      totalEarnings,
      totalTips,
      totalCashTips,
      totalCreditTips,
      totalShifts,
      totalDoubles,
      totalGuests,
      totalHours,
      bestSection,
      bestShift,
      bestDay,
      avgPerShift: totalShifts > 0 ? totalEarnings / totalShifts : 0,
      avgHourlyRate: totalHours > 0 ? totalEarnings / totalHours : 0,
    };
  }, [tipEntries, year]);

  useEffect(() => {
    if (isOpen) {
      setCurrentSlide(0);
      setShowContent(false);
      
      // Trigger confetti
      import("canvas-confetti").then((confettiModule) => {
        const confetti = confettiModule.default;
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#fbbf24", "#f59e0b", "#10b981", "#3b82f6", "#8b5cf6"],
        });
      });

      setTimeout(() => setShowContent(true), 200);
    }
  }, [isOpen]);

  const slides = [
    // Intro slide
    {
      id: "intro",
      content: (
        <div className="text-center space-y-6">
          <div className="relative inline-block">
            <div className="w-24 h-24 bg-gradient-to-br from-amber-400 via-orange-500 to-pink-500 rounded-full flex items-center justify-center shadow-[0_0_60px_rgba(251,191,36,0.5)]">
              <PartyPopper className="w-12 h-12 text-white" />
            </div>
            <Sparkles className="absolute -top-2 -right-2 w-8 h-8 text-amber-400 animate-pulse" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">Your {year} in Review</h2>
            <p className="text-muted-foreground">Let's celebrate your year of hustle!</p>
          </div>
        </div>
      ),
    },
    // Total earnings
    {
      id: "earnings",
      content: (
        <div className="text-center space-y-6">
          <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-[0_0_40px_rgba(16,185,129,0.4)]">
            <DollarSign className="w-10 h-10 text-white" />
          </div>
          <div>
            <p className="text-muted-foreground text-sm uppercase tracking-wider mb-2">Total Earnings</p>
            <h2 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-500">
              ${stats.totalEarnings.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h2>
            <div className="flex justify-center gap-6 mt-4 text-sm">
              <div>
                <p className="text-green-400 font-semibold">${stats.totalCashTips.toLocaleString()}</p>
                <p className="text-muted-foreground">Cash Tips</p>
              </div>
              <div>
                <p className="text-blue-400 font-semibold">${stats.totalCreditTips.toLocaleString()}</p>
                <p className="text-muted-foreground">Credit Tips</p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    // Shifts worked
    {
      id: "shifts",
      content: (
        <div className="text-center space-y-6">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-full flex items-center justify-center mx-auto shadow-[0_0_40px_rgba(99,102,241,0.4)]">
            <Calendar className="w-10 h-10 text-white" />
          </div>
          <div>
            <p className="text-muted-foreground text-sm uppercase tracking-wider mb-2">Shifts Worked</p>
            <h2 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">
              {stats.totalShifts}
            </h2>
            <div className="flex justify-center gap-6 mt-4 text-sm">
              <div>
                <p className="text-purple-400 font-semibold">{stats.totalDoubles}</p>
                <p className="text-muted-foreground">Doubles</p>
              </div>
              <div>
                <p className="text-cyan-400 font-semibold">{stats.totalHours.toFixed(0)}</p>
                <p className="text-muted-foreground">Total Hours</p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    // Guests served
    {
      id: "guests",
      content: (
        <div className="text-center space-y-6">
          <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-600 rounded-full flex items-center justify-center mx-auto shadow-[0_0_40px_rgba(251,146,60,0.4)]">
            <Users className="w-10 h-10 text-white" />
          </div>
          <div>
            <p className="text-muted-foreground text-sm uppercase tracking-wider mb-2">Guests Served</p>
            <h2 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">
              {stats.totalGuests.toLocaleString()}
            </h2>
            <p className="text-muted-foreground mt-4 text-sm">
              That's about {Math.round(stats.totalGuests / 365)} guests per day!
            </p>
          </div>
        </div>
      ),
    },
    // Best performers
    {
      id: "best",
      content: (
        <div className="text-center space-y-6">
          <div className="w-20 h-20 bg-gradient-to-br from-purple-400 to-pink-600 rounded-full flex items-center justify-center mx-auto shadow-[0_0_40px_rgba(168,85,247,0.4)]">
            <Star className="w-10 h-10 text-white" />
          </div>
          <div>
            <p className="text-muted-foreground text-sm uppercase tracking-wider mb-4">Your Best Performers</p>
            <div className="space-y-4">
              {stats.bestShift && (
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <p className="text-muted-foreground text-xs">Best Shift Type</p>
                  <p className="text-xl font-bold text-purple-400">{stats.bestShift.shift} Shifts</p>
                  <p className="text-sm text-muted-foreground">${stats.bestShift.earnings.toLocaleString()} earned</p>
                </div>
              )}
              {stats.bestSection && (
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <p className="text-muted-foreground text-xs">Best Section</p>
                  <p className="text-xl font-bold text-pink-400">Section {stats.bestSection.section}</p>
                  <p className="text-sm text-muted-foreground">${stats.bestSection.earnings.toLocaleString()} earned</p>
                </div>
              )}
            </div>
          </div>
        </div>
      ),
    },
    // Best single day
    {
      id: "bestDay",
      content: (
        <div className="text-center space-y-6">
          <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-amber-600 rounded-full flex items-center justify-center mx-auto shadow-[0_0_40px_rgba(251,191,36,0.4)]">
            <TrendingUp className="w-10 h-10 text-white" />
          </div>
          <div>
            <p className="text-muted-foreground text-sm uppercase tracking-wider mb-2">Your Best Day</p>
            {stats.bestDay ? (
              <>
                <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-500">
                  ${(stats.bestDay.cashTips + stats.bestDay.creditTips + (stats.bestDay.hoursWorked * stats.bestDay.hourlyRate)).toLocaleString()}
                </h2>
                <p className="text-muted-foreground mt-2">
                  {format(new Date(stats.bestDay.date), 'MMMM d, yyyy')}
                </p>
                <p className="text-sm text-amber-400 mt-1">
                  {stats.bestDay.shift} shift • Section {stats.bestDay.section}
                </p>
              </>
            ) : (
              <p className="text-muted-foreground">No data available</p>
            )}
          </div>
        </div>
      ),
    },
    // Summary
    {
      id: "summary",
      content: (
        <div className="text-center space-y-6">
          <div className="w-20 h-20 bg-gradient-to-br from-green-400 via-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto shadow-[0_0_40px_rgba(99,102,241,0.4)]">
            <Clock className="w-10 h-10 text-white" />
          </div>
          <div>
            <p className="text-muted-foreground text-sm uppercase tracking-wider mb-4">Your Averages</p>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <p className="text-2xl font-bold text-green-400">${stats.avgPerShift.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">Per Shift</p>
              </div>
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <p className="text-2xl font-bold text-blue-400">${stats.avgHourlyRate.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">Per Hour</p>
              </div>
            </div>
            <p className="text-muted-foreground mt-6 text-sm">
              Here's to an even better {year + 1}! 🎉
            </p>
          </div>
        </div>
      ),
    },
  ];

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(prev => prev + 1);
    } else {
      onClose();
    }
  };

  const handleSkip = () => {
    onClose();
  };

  if (stats.totalShifts === 0) {
    return null; // Don't show if no data for the year
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-screen h-screen max-w-none p-0 gap-0 border-0 flex flex-col bg-black/95 overflow-hidden">
        {/* Background particles */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white/10 rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 3}s`,
              }}
            />
          ))}
        </div>

        {/* Progress dots */}
        <div className="absolute top-8 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {slides.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === currentSlide 
                  ? 'w-6 bg-white' 
                  : i < currentSlide 
                  ? 'w-1.5 bg-white/60' 
                  : 'w-1.5 bg-white/20'
              }`}
            />
          ))}
        </div>

        {/* Main content */}
        <div 
          className={`flex-1 flex items-center justify-center px-6 transition-all duration-500 ${
            showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          {slides[currentSlide].content}
        </div>

        {/* Navigation */}
        <div className="p-6 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={handleSkip}
            className="text-muted-foreground hover:text-white"
          >
            Skip
          </Button>
          <Button
            onClick={handleNext}
            className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold px-6"
          >
            {currentSlide === slides.length - 1 ? "Done" : "Next"}
            {currentSlide < slides.length - 1 && <ChevronRight className="w-4 h-4 ml-1" />}
          </Button>
        </div>
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

// Helper function to check if review was shown today
export function shouldShowYearInReview(): boolean {
  if (!isInReviewPeriod()) return false;
  
  const lastShown = localStorage.getItem('yearInReviewLastShown');
  if (!lastShown) return true;
  
  const today = format(new Date(), 'yyyy-MM-dd');
  return lastShown !== today;
}

// Helper to mark review as shown today
export function markYearInReviewShown(): void {
  localStorage.setItem('yearInReviewLastShown', format(new Date(), 'yyyy-MM-dd'));
}

// Get the year to review (previous year if in week 1, current year if in week 52)
export function getReviewYear(): number {
  const now = new Date();
  const week = getWeek(now, { weekStartsOn: 0 });
  const currentYear = getYear(now);
  
  // If we're in week 1 of the new year, show previous year's review
  if (week === 1) {
    return currentYear - 1;
  }
  // If we're in week 52/53, show current year's review
  return currentYear;
}
