import { useMemo } from "react";
import { TipEntry } from "./useTipEntries";
import { UserAchievement } from "./useAchievements";
import { startOfWeek, differenceInCalendarDays, isSameDay, subDays, format } from "date-fns";

export interface Level {
  level: number;
  title: string;
  minXP: number;
  maxXP: number;
  color: string;
  icon: string;
}

export interface StreakInfo {
  currentStreak: number;
  longestStreak: number;
  lastLogDate: Date | null;
  isStreakActive: boolean;
}

export interface GamificationStats {
  totalXP: number;
  currentLevel: Level;
  xpToNextLevel: number;
  xpProgress: number; // 0-100 percentage
  streak: StreakInfo;
  totalShifts: number;
  totalEarnings: number;
  unlockedAchievements: number;
  totalAchievements: number;
  personalBests: {
    highestSingleDayTips: number;
    highestSingleDayEarnings: number;
    mostGuestsServed: number;
    bestTipPercentage: number;
  };
}

// Level definitions with titles and XP thresholds
export const LEVELS: Level[] = [
  { level: 1, title: "Rookie Server", minXP: 0, maxXP: 100, color: "#71717a", icon: "🌱" },
  { level: 2, title: "Trainee", minXP: 100, maxXP: 250, color: "#71717a", icon: "📝" },
  { level: 3, title: "Server", minXP: 250, maxXP: 500, color: "#22c55e", icon: "🍽️" },
  { level: 4, title: "Skilled Server", minXP: 500, maxXP: 850, color: "#22c55e", icon: "⭐" },
  { level: 5, title: "Expert Server", minXP: 850, maxXP: 1300, color: "#3b82f6", icon: "💫" },
  { level: 6, title: "Senior Server", minXP: 1300, maxXP: 1850, color: "#3b82f6", icon: "🎯" },
  { level: 7, title: "Lead Server", minXP: 1850, maxXP: 2500, color: "#8b5cf6", icon: "👑" },
  { level: 8, title: "Tip Master", minXP: 2500, maxXP: 3500, color: "#8b5cf6", icon: "🏆" },
  { level: 9, title: "Tip Legend", minXP: 3500, maxXP: 5000, color: "#f59e0b", icon: "🌟" },
  { level: 10, title: "Tip God", minXP: 5000, maxXP: Infinity, color: "#f59e0b", icon: "👑✨" },
];

// XP rewards for various actions
const XP_REWARDS = {
  shiftLogged: 10,
  weeklyGoalMet: 50,
  monthlyGoalMet: 100,
  achievementUnlocked: {
    common: 25,
    rare: 50,
    epic: 100,
    legendary: 200,
  },
  streakBonus: {
    3: 15,   // 3-day streak
    7: 35,   // 7-day streak
    14: 75,  // 14-day streak
    30: 150, // 30-day streak
  },
  highTipDay: 20, // $100+ tips in a day
  perfectWeek: 40, // Logged every day of a work week
};

export function useGamification(
  tipEntries: TipEntry[],
  achievements: UserAchievement[],
  goals: any
) {
  const stats = useMemo<GamificationStats>(() => {
    // Calculate streak
    const sortedEntries = [...tipEntries].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    const streak = calculateStreak(sortedEntries);
    
    // Calculate XP
    let totalXP = 0;
    
    // XP from shifts
    totalXP += tipEntries.length * XP_REWARDS.shiftLogged;
    
    // XP from achievements
    const unlockedAchievements = achievements.filter(a => a.unlocked);
    unlockedAchievements.forEach(achievement => {
      totalXP += XP_REWARDS.achievementUnlocked[achievement.rarity];
    });
    
    // XP from streaks
    if (streak.currentStreak >= 30) totalXP += XP_REWARDS.streakBonus[30];
    else if (streak.currentStreak >= 14) totalXP += XP_REWARDS.streakBonus[14];
    else if (streak.currentStreak >= 7) totalXP += XP_REWARDS.streakBonus[7];
    else if (streak.currentStreak >= 3) totalXP += XP_REWARDS.streakBonus[3];
    
    // XP from high tip days ($100+)
    const highTipDays = tipEntries.filter(
      e => e.creditTips + e.cashTips >= 100
    ).length;
    totalXP += highTipDays * XP_REWARDS.highTipDay;
    
    // Calculate level
    const currentLevel = LEVELS.find(
      l => totalXP >= l.minXP && totalXP < l.maxXP
    ) || LEVELS[LEVELS.length - 1];
    
    const xpInCurrentLevel = totalXP - currentLevel.minXP;
    const xpNeededForLevel = currentLevel.maxXP - currentLevel.minXP;
    const xpProgress = currentLevel.maxXP === Infinity 
      ? 100 
      : Math.min((xpInCurrentLevel / xpNeededForLevel) * 100, 100);
    const xpToNextLevel = currentLevel.maxXP === Infinity 
      ? 0 
      : currentLevel.maxXP - totalXP;
    
    // Calculate personal bests
    const personalBests = {
      highestSingleDayTips: Math.max(
        ...tipEntries.map(e => e.creditTips + e.cashTips),
        0
      ),
      highestSingleDayEarnings: Math.max(
        ...tipEntries.map(e => 
          e.creditTips + e.cashTips + (e.hoursWorked * e.hourlyRate)
        ),
        0
      ),
      mostGuestsServed: Math.max(
        ...tipEntries.map(e => e.guestCount),
        0
      ),
      bestTipPercentage: Math.max(
        ...tipEntries.map(e => 
          e.totalSales > 0 
            ? ((e.creditTips + e.cashTips) / e.totalSales) * 100 
            : 0
        ),
        0
      ),
    };
    
    // Total earnings
    const totalEarnings = tipEntries.reduce(
      (sum, e) => sum + e.creditTips + e.cashTips + (e.hoursWorked * e.hourlyRate),
      0
    );
    
    return {
      totalXP,
      currentLevel,
      xpToNextLevel,
      xpProgress,
      streak,
      totalShifts: tipEntries.length,
      totalEarnings,
      unlockedAchievements: unlockedAchievements.length,
      totalAchievements: achievements.length,
      personalBests,
    };
  }, [tipEntries, achievements, goals]);
  
  return stats;
}

function calculateStreak(sortedEntries: TipEntry[]): StreakInfo {
  if (sortedEntries.length === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      lastLogDate: null,
      isStreakActive: false,
    };
  }
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const yesterday = subDays(today, 1);
  
  // Get unique dates (in case of multiple entries per day)
  const uniqueDates = [...new Set(
    sortedEntries.map(e => format(e.date, 'yyyy-MM-dd'))
  )].map(d => new Date(d));
  
  uniqueDates.sort((a, b) => b.getTime() - a.getTime());
  
  const lastLogDate = uniqueDates[0];
  
  // Check if streak is still active (logged today or yesterday)
  const isStreakActive = isSameDay(lastLogDate, today) || isSameDay(lastLogDate, yesterday);
  
  // Calculate current streak
  let currentStreak = 0;
  let checkDate = isStreakActive ? lastLogDate : null;
  
  if (checkDate) {
    for (let i = 0; i < uniqueDates.length; i++) {
      const expectedDate = subDays(lastLogDate, i);
      if (isSameDay(uniqueDates[i], expectedDate)) {
        currentStreak++;
      } else {
        break;
      }
    }
  }
  
  // Calculate longest streak
  let longestStreak = 0;
  let tempStreak = 1;
  
  for (let i = 1; i < uniqueDates.length; i++) {
    const dayDiff = differenceInCalendarDays(uniqueDates[i - 1], uniqueDates[i]);
    if (dayDiff === 1) {
      tempStreak++;
    } else {
      longestStreak = Math.max(longestStreak, tempStreak);
      tempStreak = 1;
    }
  }
  longestStreak = Math.max(longestStreak, tempStreak, currentStreak);
  
  return {
    currentStreak,
    longestStreak,
    lastLogDate,
    isStreakActive,
  };
}
