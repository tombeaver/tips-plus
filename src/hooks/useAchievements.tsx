import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { TipEntry } from "./useTipEntries";
import { Trophy } from "lucide-react";

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
    
    // Group by week/month for consistency checks
    const sortedEntries = [...tipEntries].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

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
        description: `You logged your highest tip ever: $${highestTip.toFixed(2)}!`,
        rarity: "rare" as const,
        category: "special" as const,
        icon: "DollarSign",
        condition: highestTip >= 200,
        progress: Math.min(highestTip / 200 * 100, 100)
      },
      {
        id: "weekend_warrior",
        title: "Weekend Warrior",
        description: "You logged both Saturday and Sunday shifts in the same week!",
        rarity: "rare" as const,
        category: "special" as const,
        icon: "Calendar",
        condition: (() => {
          // Check if user logged both Sat and Sun in any week
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
