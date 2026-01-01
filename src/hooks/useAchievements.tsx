import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { TipEntry } from "./useTipEntries";
import { 
  MVP_ACHIEVEMENTS, 
  AchievementDefinition, 
  AchievementTier,
  AchievementCategory 
} from "@/lib/achievements";

export interface UserAchievement extends AchievementDefinition {
  unlocked: boolean;
  unlockedDate?: Date;
  current_value: number;
  progress: number; // 0-100
}

interface AchievementProgress {
  achievement_id: string;
  current_value: number;
  is_unlocked: boolean;
  unlocked_at: string | null;
}

export function useAchievements(
  tipEntries: TipEntry[],
  goals: any,
  financialData: any
) {
  const [achievements, setAchievements] = useState<UserAchievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [newlyUnlockedAchievement, setNewlyUnlockedAchievement] = useState<UserAchievement | null>(null);
  const { toast } = useToast();

  // Fetch progress records from database
  const fetchProgress = useCallback(async (): Promise<Map<string, AchievementProgress>> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return new Map();

    const { data, error } = await supabase
      .from("achievement_progress")
      .select("*")
      .eq("user_id", user.id);

    if (error) {
      console.error("Error fetching achievement progress:", error);
      return new Map();
    }

    const progressMap = new Map<string, AchievementProgress>();
    data?.forEach(record => {
      progressMap.set(record.achievement_id, {
        achievement_id: record.achievement_id,
        current_value: Number(record.current_value),
        is_unlocked: record.is_unlocked,
        unlocked_at: record.unlocked_at
      });
    });

    return progressMap;
  }, []);

  // Upsert progress for an achievement
  const upsertProgress = useCallback(async (
    achievementId: string, 
    currentValue: number, 
    targetValue: number,
    isUnlocked: boolean
  ) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { error } = await supabase
      .from("achievement_progress")
      .upsert({
        user_id: user.id,
        achievement_id: achievementId,
        current_value: currentValue,
        target_value: targetValue,
        is_unlocked: isUnlocked,
        unlocked_at: isUnlocked ? new Date().toISOString() : null
      }, {
        onConflict: 'user_id,achievement_id'
      });

    if (error) {
      console.error("Error upserting achievement progress:", error);
      return false;
    }
    return true;
  }, []);

  // Calculate current values for all achievements
  const calculateAchievementValues = useCallback((entries: TipEntry[]) => {
    const values: Record<string, number> = {};
    
    // Shift count (for milestones)
    const shiftCount = entries.length;
    
    // Highest single-shift tips (for earnings)
    const highestTips = entries.length > 0 
      ? Math.max(...entries.map(e => e.creditTips + e.cashTips))
      : 0;
    
    // Streak calculation
    const streak = calculateStreak(entries);
    
    // Map values to achievement IDs
    // Milestones - shift count based
    values["first_shift"] = shiftCount;
    values["shifts_10"] = shiftCount;
    values["shifts_25"] = shiftCount;
    values["career_server_50"] = shiftCount;
    values["career_server_100"] = shiftCount;
    
    // Earnings - highest tips based
    values["solid_night_150"] = highestTips;
    values["solid_night_200"] = highestTips;
    values["big_night_300"] = highestTips;
    values["big_night_400"] = highestTips;
    values["whale_hunter"] = highestTips;
    
    // Consistency - streak based (use best of current or longest)
    const bestStreak = Math.max(streak.current, streak.longest);
    values["logging_streak_3"] = bestStreak;
    values["logging_streak_7"] = bestStreak;
    values["logging_streak_14"] = bestStreak;
    values["logging_streak_30"] = bestStreak;
    
    return values;
  }, []);

  // Main check function
  const checkAchievements = useCallback(async () => {
    setLoading(true);
    
    try {
      const progressMap = await fetchProgress();
      const currentValues = calculateAchievementValues(tipEntries);
      const userAchievements: UserAchievement[] = [];
      let newUnlock: UserAchievement | null = null;
      
      for (const definition of MVP_ACHIEVEMENTS) {
        const { achievement_id, target_value } = definition;
        const currentValue = currentValues[achievement_id] ?? 0;
        const progress = Math.min((currentValue / target_value) * 100, 100);
        const isNowUnlocked = currentValue >= target_value;
        
        // Check existing progress
        const existingProgress = progressMap.get(achievement_id);
        const wasUnlocked = existingProgress?.is_unlocked ?? false;
        
        // If newly unlocked, save to DB and track for notification
        if (isNowUnlocked && !wasUnlocked) {
          await upsertProgress(achievement_id, currentValue, target_value, true);
          
          const unlockedAchievement: UserAchievement = {
            ...definition,
            unlocked: true,
            unlockedDate: new Date(),
            current_value: currentValue,
            progress: 100
          };
          
          userAchievements.push(unlockedAchievement);
          
          // Track first newly unlocked for celebration modal
          if (!newUnlock) {
            newUnlock = unlockedAchievement;
          }
        } else if (isNowUnlocked) {
          // Already unlocked, just add to list
          userAchievements.push({
            ...definition,
            unlocked: true,
            unlockedDate: existingProgress?.unlocked_at 
              ? new Date(existingProgress.unlocked_at) 
              : new Date(),
            current_value: currentValue,
            progress: 100
          });
        } else {
          // Not unlocked yet - update progress if changed
          if (!existingProgress || existingProgress.current_value !== currentValue) {
            await upsertProgress(achievement_id, currentValue, target_value, false);
          }
          
          userAchievements.push({
            ...definition,
            unlocked: false,
            current_value: currentValue,
            progress
          });
        }
      }
      
      // Sort achievements: unlocked first (recent first), then by progress
      userAchievements.sort((a, b) => {
        if (a.unlocked && !b.unlocked) return -1;
        if (!a.unlocked && b.unlocked) return 1;
        if (a.unlocked && b.unlocked) {
          return (b.unlockedDate?.getTime() ?? 0) - (a.unlockedDate?.getTime() ?? 0);
        }
        return b.progress - a.progress;
      });
      
      setAchievements(userAchievements);
      
      // Handle newly unlocked achievement
      if (newUnlock) {
        setNewlyUnlockedAchievement(newUnlock);
        toast({
          title: "🎉 Achievement Unlocked!",
          description: newUnlock.name,
          duration: 5000,
        });
      }
    } catch (error) {
      console.error("Error checking achievements:", error);
    } finally {
      setLoading(false);
    }
  }, [tipEntries, fetchProgress, calculateAchievementValues, upsertProgress, toast]);

  // Clear newly unlocked achievement
  const clearNewlyUnlocked = useCallback(() => {
    setNewlyUnlockedAchievement(null);
  }, []);

  // Effect to check achievements when data changes
  useEffect(() => {
    checkAchievements();
  }, [tipEntries.length, checkAchievements]);

  return { 
    achievements, 
    loading, 
    refetch: checkAchievements,
    newlyUnlockedAchievement,
    clearNewlyUnlocked
  };
}

// Helper function to calculate streaks
function calculateStreak(tipEntries: TipEntry[]): { current: number; longest: number; active: boolean } {
  if (tipEntries.length === 0) {
    return { current: 0, longest: 0, active: false };
  }

  // Sort entries by date (newest first)
  const sortedEntries = [...tipEntries].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Get unique dates
  const uniqueDates = [...new Set(sortedEntries.map(e => e.date))].sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime()
  );

  if (uniqueDates.length === 0) {
    return { current: 0, longest: 0, active: false };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const mostRecentDate = new Date(uniqueDates[0]);
  mostRecentDate.setHours(0, 0, 0, 0);

  // Check if streak is active (logged today or yesterday)
  const isActive = mostRecentDate.getTime() >= yesterday.getTime();

  // Calculate current streak
  let currentStreak = 0;
  let checkDate = isActive ? mostRecentDate : null;
  
  if (checkDate) {
    for (const dateStr of uniqueDates) {
      const entryDate = new Date(dateStr);
      entryDate.setHours(0, 0, 0, 0);
      
      if (checkDate && entryDate.getTime() === checkDate.getTime()) {
        currentStreak++;
        checkDate = new Date(checkDate);
        checkDate.setDate(checkDate.getDate() - 1);
      } else if (checkDate && entryDate.getTime() < checkDate.getTime()) {
        break;
      }
    }
  }

  // Calculate longest streak
  let longestStreak = 0;
  let tempStreak = 1;
  
  for (let i = 1; i < uniqueDates.length; i++) {
    const current = new Date(uniqueDates[i - 1]);
    const previous = new Date(uniqueDates[i]);
    current.setHours(0, 0, 0, 0);
    previous.setHours(0, 0, 0, 0);
    
    const diffDays = Math.round((current.getTime() - previous.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      tempStreak++;
    } else {
      longestStreak = Math.max(longestStreak, tempStreak);
      tempStreak = 1;
    }
  }
  longestStreak = Math.max(longestStreak, tempStreak, currentStreak);

  return { current: currentStreak, longest: longestStreak, active: isActive };
}

// Re-export types for backward compatibility
export type { AchievementTier, AchievementCategory };
