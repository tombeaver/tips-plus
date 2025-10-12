import * as React from "react";
import { Trophy, Target, TrendingUp, Star, Zap, Award, Crown, Flame, Heart, DollarSign, Calendar, Gift, LayoutGrid, Coins, Sparkles } from "lucide-react";
import { AchievementBadge, BadgeRarity, BadgeCategory } from "./AchievementBadge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Sample achievements data structure
interface Achievement {
  id: string;
  icon: typeof Trophy;
  title: string;
  description: string;
  rarity: BadgeRarity;
  category: BadgeCategory;
  unlocked: boolean;
  unlockedDate?: Date;
  progress?: number;
}

// This is demo data - will be replaced with actual data later
const sampleAchievements: Achievement[] = [
  {
    id: "first-hundred",
    icon: DollarSign,
    title: "First Benjamin",
    description: "Earn $100 in tips in a single shift",
    rarity: "common",
    category: "earnings",
    unlocked: true,
    unlockedDate: new Date("2025-01-15"),
  },
  {
    id: "week-warrior",
    icon: Calendar,
    title: "Week Warrior",
    description: "Complete 5 consecutive days of shifts",
    rarity: "rare",
    category: "consistency",
    unlocked: true,
    unlockedDate: new Date("2025-01-20"),
  },
  {
    id: "tip-master",
    icon: Crown,
    title: "Tip Master",
    description: "Maintain a 20%+ tip average for a month",
    rarity: "epic",
    category: "milestone",
    unlocked: false,
    progress: 65,
  },
  {
    id: "legendary-shift",
    icon: Trophy,
    title: "Legendary Shift",
    description: "Earn $500+ in a single shift",
    rarity: "legendary",
    category: "earnings",
    unlocked: false,
  },
  {
    id: "goal-crusher",
    icon: Target,
    title: "Goal Crusher",
    description: "Exceed your monthly goal for 3 months in a row",
    rarity: "epic",
    category: "milestone",
    unlocked: false,
    progress: 33,
  },
  {
    id: "early-bird",
    icon: Zap,
    title: "Early Bird",
    description: "Complete 10 morning shifts",
    rarity: "common",
    category: "consistency",
    unlocked: true,
    unlockedDate: new Date("2025-01-10"),
  },
  {
    id: "rising-star",
    icon: Star,
    title: "Rising Star",
    description: "Increase your average tips by 25% month over month",
    rarity: "rare",
    category: "earnings",
    unlocked: false,
    progress: 80,
  },
  {
    id: "consistency-king",
    icon: Flame,
    title: "On Fire",
    description: "Log tips every day for 30 days straight",
    rarity: "legendary",
    category: "consistency",
    unlocked: false,
  },
  {
    id: "customer-favorite",
    icon: Heart,
    title: "Customer Favorite",
    description: "Maintain high ratings for 50 shifts",
    rarity: "rare",
    category: "special",
    unlocked: false,
  },
  {
    id: "milestone-1000",
    icon: Award,
    title: "Milestone Maker",
    description: "Earn $1,000 total in tips",
    rarity: "common",
    category: "milestone",
    unlocked: true,
    unlockedDate: new Date("2025-01-25"),
  },
  {
    id: "generous-december",
    icon: Gift,
    title: "Holiday Hero",
    description: "Special achievement for December performance",
    rarity: "epic",
    category: "special",
    unlocked: true,
    unlockedDate: new Date("2024-12-25"),
  },
  {
    id: "upward-trend",
    icon: TrendingUp,
    title: "Trending Up",
    description: "Show positive growth for 6 consecutive weeks",
    rarity: "rare",
    category: "earnings",
    unlocked: false,
    progress: 45,
  },
];

const categoryInfo: Record<BadgeCategory | "all", { title: string; description: string }> = {
  all: {
    title: "All Achievements",
    description: "Every badge, milestone, and achievement you can unlock"
  },
  earnings: {
    title: "Earnings Achievements",
    description: "Badges earned through exceptional tip performance"
  },
  consistency: {
    title: "Consistency Achievements",
    description: "Rewards for dedication and regular performance"
  },
  milestone: {
    title: "Milestone Achievements",
    description: "Major accomplishments and career progress markers"
  },
  special: {
    title: "Special Achievements",
    description: "Unique badges for exceptional moments"
  }
};

export function AchievementsGallery() {
  const [selectedCategory, setSelectedCategory] = React.useState<BadgeCategory | "all">("all");

  const filterByCategory = (category: BadgeCategory | "all") => {
    return category === "all" 
      ? sampleAchievements 
      : sampleAchievements.filter(a => a.category === category);
  };

  return (
    <div className="space-y-6">
      {/* Navigation Tabs */}
      <Tabs defaultValue="all" className="w-full" onValueChange={(value) => setSelectedCategory(value as BadgeCategory | "all")}>
        <div 
          className="sticky z-10 transition-all duration-200 shadow-md"
          style={{ 
            top: '0',
            marginTop: '-1.5rem',
            marginLeft: '-1.5rem', 
            marginRight: '-1.5rem',
            paddingLeft: '1.5rem',
            paddingRight: '1.5rem',
            paddingTop: '0',
            paddingBottom: '0.5rem',
            background: 'hsl(var(--background) / 0.95)',
            backdropFilter: 'blur(12px)'
          }}
        >
          <TabsList className="grid w-full grid-cols-5 bg-card/50 backdrop-blur-sm border shadow-sm">
            <TabsTrigger value="all" className="flex items-center gap-1 transition-all duration-200 data-[state=active]:bg-primary/10 data-[state=active]:text-primary hover:bg-muted/50">
              <LayoutGrid className="h-4 w-4" />
              <span className="hidden sm:inline">All</span>
            </TabsTrigger>
            <TabsTrigger value="earnings" className="flex items-center gap-1 transition-all duration-200 data-[state=active]:bg-primary/10 data-[state=active]:text-primary hover:bg-muted/50">
              <Coins className="h-4 w-4" />
              <span className="hidden sm:inline">Earnings</span>
            </TabsTrigger>
            <TabsTrigger value="consistency" className="flex items-center gap-1 transition-all duration-200 data-[state=active]:bg-primary/10 data-[state=active]:text-primary hover:bg-muted/50">
              <Flame className="h-4 w-4" />
              <span className="hidden sm:inline">Consistency</span>
            </TabsTrigger>
            <TabsTrigger value="milestone" className="flex items-center gap-1 transition-all duration-200 data-[state=active]:bg-primary/10 data-[state=active]:text-primary hover:bg-muted/50">
              <Target className="h-4 w-4" />
              <span className="hidden sm:inline">Milestones</span>
            </TabsTrigger>
            <TabsTrigger value="special" className="flex items-center gap-1 transition-all duration-200 data-[state=active]:bg-primary/10 data-[state=active]:text-primary hover:bg-muted/50">
              <Sparkles className="h-4 w-4" />
              <span className="hidden sm:inline">Special</span>
            </TabsTrigger>
          </TabsList>
        </div>

          {/* Dynamic Subhead */}
          <div className="mb-6 text-center">
            <h3 className="text-xl font-semibold text-foreground">
              {categoryInfo[selectedCategory].title}
            </h3>
            <p className="text-sm text-muted-foreground">
              {categoryInfo[selectedCategory].description}
            </p>
          </div>

          {(["all", "earnings", "consistency", "milestone", "special"] as const).map((category) => (
            <TabsContent key={category} value={category} className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {filterByCategory(category === "all" ? "all" : category).map((achievement) => (
                  <AchievementBadge
                    key={achievement.id}
                    icon={achievement.icon}
                    title={achievement.title}
                    description={achievement.description}
                    rarity={achievement.rarity}
                    category={achievement.category}
                    unlocked={achievement.unlocked}
                    unlockedDate={achievement.unlockedDate}
                    progress={achievement.progress}
                  />
                ))}
              </div>

              {filterByCategory(category === "all" ? "all" : category).length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  No achievements in this category yet
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    );
  }
