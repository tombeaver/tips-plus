// Achievement System v2 - Master Configuration
// MASTER DESIGN RULE: Every user must have:
// - 1 achievement unlocked recently
// - 1 achievement ≥70% complete
// - 1 achievement visible but locked

export type AchievementTier = "bronze" | "silver" | "gold" | "legendary";
export type AchievementCategory = "milestone" | "earnings" | "consistency" | "skill" | "mood" | "seasonal";
export type ProgressType = "count" | "amount" | "percentage" | "streak" | "ratio" | "condition";
export type Visibility = "visible" | "hidden" | "locked";
export type Phase = "mvp" | "phase_1" | "phase_2";

export interface AchievementDefinition {
  achievement_id: string;
  category: AchievementCategory;
  name: string;
  description: string;
  icon: string;
  tier: AchievementTier;
  progress_type: ProgressType;
  target_value: number;
  xp_reward: number;
  visibility: Visibility;
  phase: Phase;
  expires_at?: string | null;
}

// Tier styling configuration (replaces old rarity system)
export const tierConfig: Record<AchievementTier, {
  gradient: string;
  border: string;
  glow: string;
  iconColor: string;
  label: string;
}> = {
  bronze: {
    gradient: "from-amber-700/20 via-amber-600/10 to-amber-800/20",
    border: "border-amber-600/40",
    glow: "shadow-amber-500/20",
    iconColor: "text-amber-500",
    label: "Bronze"
  },
  silver: {
    gradient: "from-slate-400/20 via-slate-300/10 to-slate-500/20",
    border: "border-slate-400/40",
    glow: "shadow-slate-400/20",
    iconColor: "text-slate-400",
    label: "Silver"
  },
  gold: {
    gradient: "from-yellow-500/20 via-yellow-400/10 to-yellow-600/20",
    border: "border-yellow-500/40",
    glow: "shadow-yellow-400/30",
    iconColor: "text-yellow-500",
    label: "Gold"
  },
  legendary: {
    gradient: "from-purple-600/20 via-fuchsia-500/10 to-purple-700/20",
    border: "border-purple-500/50",
    glow: "shadow-purple-500/40",
    iconColor: "text-purple-400",
    label: "Legendary"
  }
};

// XP rewards by tier (for reference)
export const XP_BY_TIER: Record<AchievementTier, number> = {
  bronze: 50,
  silver: 150,
  gold: 300,
  legendary: 500
};

// =============================================================================
// MVP ACHIEVEMENTS - Milestones First (Quick Wins)
// =============================================================================

export const MVP_ACHIEVEMENTS: AchievementDefinition[] = [
  // MILESTONE ACHIEVEMENTS
  {
    achievement_id: "first_shift",
    category: "milestone",
    name: "First Shift",
    description: "You logged your first shift. Welcome to the grind!",
    icon: "Rocket",
    tier: "bronze",
    progress_type: "count",
    target_value: 1,
    xp_reward: 50,
    visibility: "visible",
    phase: "mvp"
  },
  {
    achievement_id: "shifts_10",
    category: "milestone",
    name: "Getting Warmed Up",
    description: "Log 10 total shifts. You're building momentum!",
    icon: "TrendingUp",
    tier: "bronze",
    progress_type: "count",
    target_value: 10,
    xp_reward: 75,
    visibility: "visible",
    phase: "mvp"
  },
  {
    achievement_id: "shifts_25",
    category: "milestone",
    name: "Quarter Century",
    description: "Log 25 total shifts. A solid foundation!",
    icon: "CheckCircle",
    tier: "silver",
    progress_type: "count",
    target_value: 25,
    xp_reward: 100,
    visibility: "visible",
    phase: "mvp"
  },
  {
    achievement_id: "career_server_50",
    category: "milestone",
    name: "Career Server",
    description: "Log 50 total shifts. You're a dedicated professional!",
    icon: "Star",
    tier: "silver",
    progress_type: "count",
    target_value: 50,
    xp_reward: 150,
    visibility: "visible",
    phase: "mvp"
  },
  {
    achievement_id: "career_server_100",
    category: "milestone",
    name: "Century Club",
    description: "Log 100 total shifts. You're a tracking legend!",
    icon: "Crown",
    tier: "gold",
    progress_type: "count",
    target_value: 100,
    xp_reward: 300,
    visibility: "visible",
    phase: "mvp"
  },

  // EARNINGS ACHIEVEMENTS
  {
    achievement_id: "solid_night_150",
    category: "earnings",
    name: "Solid Night",
    description: "Earn $150 in tips in a single shift.",
    icon: "DollarSign",
    tier: "bronze",
    progress_type: "amount",
    target_value: 150,
    xp_reward: 75,
    visibility: "visible",
    phase: "mvp"
  },
  {
    achievement_id: "solid_night_200",
    category: "earnings",
    name: "Great Night",
    description: "Earn $200 in tips in a single shift.",
    icon: "DollarSign",
    tier: "silver",
    progress_type: "amount",
    target_value: 200,
    xp_reward: 100,
    visibility: "visible",
    phase: "mvp"
  },
  {
    achievement_id: "big_night_300",
    category: "earnings",
    name: "Big Night",
    description: "Earn $300 in tips in a single shift.",
    icon: "Zap",
    tier: "silver",
    progress_type: "amount",
    target_value: 300,
    xp_reward: 150,
    visibility: "visible",
    phase: "mvp"
  },
  {
    achievement_id: "big_night_400",
    category: "earnings",
    name: "Legendary Night",
    description: "Earn $400 in tips in a single shift.",
    icon: "Trophy",
    tier: "gold",
    progress_type: "amount",
    target_value: 400,
    xp_reward: 300,
    visibility: "visible",
    phase: "mvp"
  },
  {
    achievement_id: "whale_hunter",
    category: "earnings",
    name: "Whale Hunter",
    description: "Earn $500+ in tips in a single shift. Legendary service!",
    icon: "Crown",
    tier: "legendary",
    progress_type: "amount",
    target_value: 500,
    xp_reward: 500,
    visibility: "visible",
    phase: "mvp"
  },

  // CONSISTENCY ACHIEVEMENTS - THE RETENTION ENGINE
  {
    achievement_id: "logging_streak_3",
    category: "consistency",
    name: "Don't Break the Chain",
    description: "Log shifts 3 days in a row.",
    icon: "Flame",
    tier: "bronze",
    progress_type: "streak",
    target_value: 3,
    xp_reward: 75,
    visibility: "visible",
    phase: "mvp"
  },
  {
    achievement_id: "logging_streak_7",
    category: "consistency",
    name: "Week Warrior",
    description: "Log shifts 7 days in a row.",
    icon: "Flame",
    tier: "silver",
    progress_type: "streak",
    target_value: 7,
    xp_reward: 150,
    visibility: "visible",
    phase: "mvp"
  },
  {
    achievement_id: "logging_streak_14",
    category: "consistency",
    name: "Iron Apron",
    description: "Log shifts 14 days in a row.",
    icon: "Flame",
    tier: "gold",
    progress_type: "streak",
    target_value: 14,
    xp_reward: 300,
    visibility: "visible",
    phase: "mvp"
  },
  {
    achievement_id: "logging_streak_30",
    category: "consistency",
    name: "Monthly Master",
    description: "Log shifts 30 days in a row. Unstoppable!",
    icon: "Flame",
    tier: "legendary",
    progress_type: "streak",
    target_value: 30,
    xp_reward: 500,
    visibility: "visible",
    phase: "mvp"
  }
];

// Get all achievements for a given phase
export function getAchievementsByPhase(phase: Phase): AchievementDefinition[] {
  return MVP_ACHIEVEMENTS.filter(a => a.phase === phase);
}

// Get achievement by ID
export function getAchievementById(id: string): AchievementDefinition | undefined {
  return MVP_ACHIEVEMENTS.find(a => a.achievement_id === id);
}

// Get achievements by category
export function getAchievementsByCategory(category: AchievementCategory): AchievementDefinition[] {
  return MVP_ACHIEVEMENTS.filter(a => a.category === category);
}
