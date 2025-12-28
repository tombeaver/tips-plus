import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { TipEntry } from "./useTipEntries";
import { Trophy } from "lucide-react";
import { format, subDays, isSameDay, differenceInCalendarDays } from "date-fns";

export interface Achievement {
  id: string;
  title: string;
  description: string;
  rarity: "common" | "rare" | "epic" | "legendary";
  category: "earnings" | "consistency" | "milestone" | "special";
  icon: string;
}

export interface UnlockedAchievement extends Achievement {
  unlocked: true;
  unlockedDate: Date;
}

export interface LockedAchievement extends Achievement {
  unlocked: false;
  progress?: number;
}

export type UserAchievement = UnlockedAchievement | LockedAchievement;

export function useAchievements(
  tipEntries: TipEntry[],
  goals: any,
  financialData: any
) {
  const [achievements, setAchievements] = useState<UserAchievement[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Fetch unlocked achievements from database
  const fetchUnlockedAchievements = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return new Set<string>();

    const { data, error } = await supabase
      .from("achievements")
      .select("*")
      .eq("user_id", user.id);

    if (error) {
      console.error("Error fetching achievements:", error);
      return new Set<string>();
    }

    return new Set(data?.map(a => a.achievement_id) || []);
  };

  // Unlock an achievement
  const unlockAchievement = async (achievementId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { error } = await supabase
      .from("achievements")
      .insert({
        user_id: user.id,
        achievement_id: achievementId,
      });

    if (error) {
      if (error.code !== '23505') { // Ignore duplicate key errors
        console.error("Error unlocking achievement:", error);
      }
      return false;
    }

    return true;
  };

  // Check and unlock achievements based on user data
  const checkAchievements = async () => {
    setLoading(true);
    const unlocked = await fetchUnlockedAchievements();
    const newAchievements: UserAchievement[] = [];
    const newlyUnlocked: string[] = [];

    // Calculate stats
    const shiftCount = tipEntries.length;
    const totalEarnings = tipEntries.reduce((sum, entry) => 
      sum + entry.creditTips + entry.cashTips, 0
    );
    const highestTip = Math.max(...tipEntries.map(e => e.creditTips + e.cashTips), 0);
    const highestEarnings = Math.max(
      ...tipEntries.map(e => e.creditTips + e.cashTips + (e.hoursWorked * e.hourlyRate)),
      0
    );
    
    // Group by week/month for consistency checks
    const sortedEntries = [...tipEntries].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // Calculate streak
    const streak = calculateStreak(tipEntries);

    // Weekly earnings
    const currentWeekStart = new Date();
    currentWeekStart.setDate(currentWeekStart.getDate() - currentWeekStart.getDay());
    const weeklyEarnings = tipEntries
      .filter(e => new Date(e.date) >= currentWeekStart)
      .reduce((sum, e) => sum + e.creditTips + e.cashTips, 0);

    // Monthly earnings
    const currentMonthStart = new Date();
    currentMonthStart.setDate(1);
    const monthlyEarnings = tipEntries
      .filter(e => new Date(e.date) >= currentMonthStart)
      .reduce((sum, e) => sum + e.creditTips + e.cashTips, 0);
    
    // Total guests served
    const totalGuests = tipEntries.reduce((sum, e) => sum + e.guestCount, 0);
    
    // Double shifts count
    const doubleShifts = tipEntries.filter(e => e.shift === 'Double').length;

    // Check each achievement
    const achievementChecks = [
      // Core Achievements
      {
        id: "first_shift",
        title: "First Shift Logged",
        description: "You've logged your very first shift. Here's to many more!",
        rarity: "common" as const,
        category: "milestone" as const,
        icon: "Rocket",
        condition: shiftCount >= 1,
        progress: Math.min(shiftCount / 1 * 100, 100)
      },
      {
        id: "annual_goal_set",
        title: "Annual Goal Set",
        description: "You've set your sights on a yearly target. Time to crush it!",
        rarity: "common" as const,
        category: "milestone" as const,
        icon: "Target",
        condition: (goals?.yearly_goal || 0) > 0,
        progress: (goals?.yearly_goal || 0) > 0 ? 100 : 0
      },
      {
        id: "budget_created",
        title: "Budget Created",
        description: "You've taken control of your finances with a budget plan.",
        rarity: "common" as const,
        category: "milestone" as const,
        icon: "Wallet",
        condition: (financialData?.monthlyExpenses || 0) > 0 || (financialData?.monthlySavingsGoal || 0) > 0,
        progress: ((financialData?.monthlyExpenses || 0) > 0 || (financialData?.monthlySavingsGoal || 0) > 0) ? 100 : 0
      },
      {
        id: "shifts_10",
        title: "10 Shifts Logged",
        description: "You've logged 10 shifts. You're building momentum!",
        rarity: "common" as const,
        category: "milestone" as const,
        icon: "CheckCircle",
        condition: shiftCount >= 10,
        progress: Math.min(shiftCount / 10 * 100, 100)
      },
      {
        id: "shifts_30",
        title: "30 Shifts Logged",
        description: "30 shifts down! You're becoming a tracking pro.",
        rarity: "rare" as const,
        category: "milestone" as const,
        icon: "TrendingUp",
        condition: shiftCount >= 30,
        progress: Math.min(shiftCount / 30 * 100, 100)
      },
      {
        id: "shifts_50",
        title: "50 Shifts Logged",
        description: "Half a century of shifts! Your dedication is impressive.",
        rarity: "epic" as const,
        category: "milestone" as const,
        icon: "Star",
        condition: shiftCount >= 50,
        progress: Math.min(shiftCount / 50 * 100, 100)
      },
      {
        id: "shifts_100",
        title: "100 Shifts Logged",
        description: "100 shifts! You're a true professional at tracking your earnings.",
        rarity: "legendary" as const,
        category: "milestone" as const,
        icon: "Crown",
        condition: shiftCount >= 100,
        progress: Math.min(shiftCount / 100 * 100, 100)
      },

      // Goal & Performance Achievements
      {
        id: "weekly_goal_met",
        title: "Weekly Goal Met",
        description: "You hit your weekly earnings target. Keep it up!",
        rarity: "rare" as const,
        category: "earnings" as const,
        icon: "Target",
        condition: weeklyEarnings >= (goals?.weekly_goal || 0) && (goals?.weekly_goal || 0) > 0,
        progress: (goals?.weekly_goal || 0) > 0 ? Math.min(weeklyEarnings / goals.weekly_goal * 100, 100) : 0
      },
      {
        id: "monthly_goal_met",
        title: "Monthly Goal Met",
        description: "You've reached your monthly income target. Excellent work!",
        rarity: "epic" as const,
        category: "earnings" as const,
        icon: "DollarSign",
        condition: monthlyEarnings >= (goals?.monthly_goal || 0) && (goals?.monthly_goal || 0) > 0,
        progress: (goals?.monthly_goal || 0) > 0 ? Math.min(monthlyEarnings / goals.monthly_goal * 100, 100) : 0
      },
      {
        id: "double_weekly_goal",
        title: "Double Weekly Goal",
        description: "You earned 2x your weekly target! Outstanding performance!",
        rarity: "epic" as const,
        category: "earnings" as const,
        icon: "Zap",
        condition: weeklyEarnings >= (goals?.weekly_goal || 0) * 2 && (goals?.weekly_goal || 0) > 0,
        progress: (goals?.weekly_goal || 0) > 0 ? Math.min(weeklyEarnings / (goals.weekly_goal * 2) * 100, 100) : 0
      },
      {
        id: "double_monthly_goal",
        title: "Double Monthly Goal",
        description: "You earned 2x your monthly target! Phenomenal achievement!",
        rarity: "legendary" as const,
        category: "earnings" as const,
        icon: "Trophy",
        condition: monthlyEarnings >= (goals?.monthly_goal || 0) * 2 && (goals?.monthly_goal || 0) > 0,
        progress: (goals?.monthly_goal || 0) > 0 ? Math.min(monthlyEarnings / (goals.monthly_goal * 2) * 100, 100) : 0
      },

      // Fun / Surprise Badges
      {
        id: "big_tipper",
        title: "Big Tipper",
        description: `You earned $200+ in tips in a single shift!`,
        rarity: "rare" as const,
        category: "earnings" as const,
        icon: "DollarSign",
        condition: highestTip >= 200,
        progress: Math.min(highestTip / 200 * 100, 100)
      },
      {
        id: "whale_hunter",
        title: "Whale Hunter",
        description: `You earned $500+ in tips in a single shift! Legendary service!`,
        rarity: "legendary" as const,
        category: "earnings" as const,
        icon: "Crown",
        condition: highestTip >= 500,
        progress: Math.min(highestTip / 500 * 100, 100)
      },
      {
        id: "weekend_warrior",
        title: "Weekend Warrior",
        description: "You logged both Saturday and Sunday shifts in the same week!",
        rarity: "rare" as const,
        category: "special" as const,
        icon: "Calendar",
        condition: (() => {
          const weeks = new Map<string, Set<number>>();
          tipEntries.forEach(entry => {
            const date = new Date(entry.date);
            const weekKey = `${date.getFullYear()}-W${Math.floor(date.getDate() / 7)}`;
            if (!weeks.has(weekKey)) weeks.set(weekKey, new Set());
            weeks.get(weekKey)!.add(date.getDay());
          });
          return Array.from(weeks.values()).some(days => days.has(0) && days.has(6));
        })(),
        progress: undefined
      },

      // STREAK ACHIEVEMENTS
      {
        id: "streak_3",
        title: "Getting Started",
        description: "You've logged shifts 3 days in a row! Building habits!",
        rarity: "common" as const,
        category: "consistency" as const,
        icon: "Flame",
        condition: streak.current >= 3 || streak.longest >= 3,
        progress: Math.min((Math.max(streak.current, streak.longest) / 3) * 100, 100)
      },
      {
        id: "streak_7",
        title: "Week Warrior",
        description: "7-day streak! A full week of consistent logging!",
        rarity: "rare" as const,
        category: "consistency" as const,
        icon: "Flame",
        condition: streak.current >= 7 || streak.longest >= 7,
        progress: Math.min((Math.max(streak.current, streak.longest) / 7) * 100, 100)
      },
      {
        id: "streak_14",
        title: "Two Week Champion",
        description: "14-day streak! Your dedication is inspiring!",
        rarity: "epic" as const,
        category: "consistency" as const,
        icon: "Flame",
        condition: streak.current >= 14 || streak.longest >= 14,
        progress: Math.min((Math.max(streak.current, streak.longest) / 14) * 100, 100)
      },
      {
        id: "streak_30",
        title: "Monthly Master",
        description: "30-day streak! You're unstoppable!",
        rarity: "legendary" as const,
        category: "consistency" as const,
        icon: "Flame",
        condition: streak.current >= 30 || streak.longest >= 30,
        progress: Math.min((Math.max(streak.current, streak.longest) / 30) * 100, 100)
      },

      // GUEST ACHIEVEMENTS
      {
        id: "guests_100",
        title: "Crowd Pleaser",
        description: "You've served 100 guests total! Great hospitality!",
        rarity: "common" as const,
        category: "milestone" as const,
        icon: "Users",
        condition: totalGuests >= 100,
        progress: Math.min((totalGuests / 100) * 100, 100)
      },
      {
        id: "guests_500",
        title: "People Person",
        description: "500 guests served! You're a service superstar!",
        rarity: "rare" as const,
        category: "milestone" as const,
        icon: "Users",
        condition: totalGuests >= 500,
        progress: Math.min((totalGuests / 500) * 100, 100)
      },
      {
        id: "guests_1000",
        title: "Guest Whisperer",
        description: "1,000 guests served! Legendary hospitality!",
        rarity: "epic" as const,
        category: "milestone" as const,
        icon: "Users",
        condition: totalGuests >= 1000,
        progress: Math.min((totalGuests / 1000) * 100, 100)
      },

      // SPECIAL ACHIEVEMENTS
      {
        id: "double_duty",
        title: "Double Duty",
        description: "You've worked 5 double shifts! Iron stamina!",
        rarity: "rare" as const,
        category: "special" as const,
        icon: "Zap",
        condition: doubleShifts >= 5,
        progress: Math.min((doubleShifts / 5) * 100, 100)
      },
      {
        id: "early_bird",
        title: "Early Bird",
        description: "You've worked 10 AM shifts. Rise and shine!",
        rarity: "common" as const,
        category: "special" as const,
        icon: "Sun",
        condition: tipEntries.filter(e => e.shift === 'AM').length >= 10,
        progress: Math.min((tipEntries.filter(e => e.shift === 'AM').length / 10) * 100, 100)
      },
      {
        id: "night_owl",
        title: "Night Owl",
        description: "You've worked 20 PM shifts. Master of the dinner rush!",
        rarity: "rare" as const,
        category: "special" as const,
        icon: "Moon",
        condition: tipEntries.filter(e => e.shift === 'PM').length >= 20,
        progress: Math.min((tipEntries.filter(e => e.shift === 'PM').length / 20) * 100, 100)
      },
      {
        id: "high_roller",
        title: "High Roller",
        description: "You've earned $1,000+ in a single day! Incredible!",
        rarity: "legendary" as const,
        category: "earnings" as const,
        icon: "Sparkles",
        condition: highestEarnings >= 1000,
        progress: Math.min((highestEarnings / 1000) * 100, 100)
      },
      {
        id: "earnings_5k",
        title: "$5K Club",
        description: "You've earned $5,000 in total tips! Keep it up!",
        rarity: "rare" as const,
        category: "earnings" as const,
        icon: "TrendingUp",
        condition: totalEarnings >= 5000,
        progress: Math.min((totalEarnings / 5000) * 100, 100)
      },
      {
        id: "earnings_10k",
        title: "$10K Milestone",
        description: "You've earned $10,000 in total tips! Impressive!",
        rarity: "epic" as const,
        category: "earnings" as const,
        icon: "Trophy",
        condition: totalEarnings >= 10000,
        progress: Math.min((totalEarnings / 10000) * 100, 100)
      },
      {
        id: "earnings_25k",
        title: "$25K Legend",
        description: "You've earned $25,000 in total tips! Legendary earner!",
        rarity: "legendary" as const,
        category: "earnings" as const,
        icon: "Crown",
        condition: totalEarnings >= 25000,
        progress: Math.min((totalEarnings / 25000) * 100, 100)
      },
    ];

    // Process each achievement
    for (const check of achievementChecks) {
      const isUnlocked = unlocked.has(check.id);
      
      if (check.condition && !isUnlocked) {
        const success = await unlockAchievement(check.id);
        if (success) {
          newlyUnlocked.push(check.title);
          newAchievements.push({
            ...check,
            unlocked: true,
            unlockedDate: new Date()
          });
        }
      } else if (isUnlocked) {
        newAchievements.push({
          ...check,
          unlocked: true,
          unlockedDate: new Date() // Will be replaced with actual date from DB
        });
      } else {
        newAchievements.push({
          ...check,
          unlocked: false,
          progress: check.progress
        });
      }
    }

    // Fetch actual unlock dates
    const { data: achievementData } = await supabase
      .from("achievements")
      .select("*");
    
    if (achievementData) {
      newAchievements.forEach(achievement => {
        if (achievement.unlocked) {
          const dbRecord = achievementData.find(a => a.achievement_id === achievement.id);
          if (dbRecord) {
            achievement.unlockedDate = new Date(dbRecord.unlocked_at);
          }
        }
      });
    }

    // Filter out hidden achievements (not unlocked and no progress)
    const visibleAchievements = newAchievements.filter(achievement => {
      if (achievement.unlocked) return true;
      if ('progress' in achievement && achievement.progress !== undefined && achievement.progress > 0) return true;
      // For achievements without progress tracking, only show if unlocked
      return false;
    });

    setAchievements(visibleAchievements);
    setLoading(false);

    // Show toast for newly unlocked achievements
    if (newlyUnlocked.length > 0) {
      toast({
        title: "🎉 Achievement Unlocked!",
        description: newlyUnlocked[0],
        duration: 5000,
      });
    }
  };

  useEffect(() => {
    if (tipEntries.length > 0 || goals || financialData) {
      checkAchievements();
    } else {
      setLoading(false);
    }
  }, [tipEntries.length, goals, financialData]);

  return {
    achievements,
    loading,
    refetch: checkAchievements
  };
}

// Helper function to calculate streak
function calculateStreak(tipEntries: TipEntry[]): { current: number; longest: number; isActive: boolean } {
  if (tipEntries.length === 0) {
    return { current: 0, longest: 0, isActive: false };
  }
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = subDays(today, 1);
  
  // Get unique dates
  const uniqueDates = [...new Set(
    tipEntries.map(e => format(e.date, 'yyyy-MM-dd'))
  )].map(d => new Date(d)).sort((a, b) => b.getTime() - a.getTime());
  
  if (uniqueDates.length === 0) {
    return { current: 0, longest: 0, isActive: false };
  }
  
  const lastLogDate = uniqueDates[0];
  const isActive = isSameDay(lastLogDate, today) || isSameDay(lastLogDate, yesterday);
  
  // Calculate current streak
  let current = 0;
  if (isActive) {
    for (let i = 0; i < uniqueDates.length; i++) {
      const expectedDate = subDays(lastLogDate, i);
      if (isSameDay(uniqueDates[i], expectedDate)) {
        current++;
      } else {
        break;
      }
    }
  }
  
  // Calculate longest streak
  let longest = 0;
  let tempStreak = 1;
  
  for (let i = 1; i < uniqueDates.length; i++) {
    const dayDiff = differenceInCalendarDays(uniqueDates[i - 1], uniqueDates[i]);
    if (dayDiff === 1) {
      tempStreak++;
    } else {
      longest = Math.max(longest, tempStreak);
      tempStreak = 1;
    }
  }
  longest = Math.max(longest, tempStreak, current);
  
  return { current, longest, isActive };
}
