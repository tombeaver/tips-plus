import { Trophy, Target, TrendingUp, Star, Zap, Award, Crown, Flame, Heart, DollarSign, Calendar, Gift, LayoutGrid, Coins, Sparkles } from "lucide-react";
import { AchievementBadge, BadgeRarity, BadgeCategory } from "./AchievementBadge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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

export function AchievementsGallery() {
  const unlockedCount = sampleAchievements.filter(a => a.unlocked).length;
  const totalCount = sampleAchievements.length;
  const completionPercentage = Math.round((unlockedCount / totalCount) * 100);

  const filterByCategory = (category: BadgeCategory | "all") => {
    return category === "all" 
      ? sampleAchievements 
      : sampleAchievements.filter(a => a.category === category);
  };

  return (
    <Card className="card-enhanced">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="heading-lg flex items-center gap-2">
              <Trophy className="h-6 w-6 text-primary" />
              Achievements
            </CardTitle>
            <CardDescription>
              Unlock badges and milestones as you progress
            </CardDescription>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-primary">{unlockedCount}/{totalCount}</div>
            <div className="text-xs text-muted-foreground">{completionPercentage}% Complete</div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all" className="w-full">
          <TooltipProvider>
            <TabsList className="grid w-full grid-cols-5 mb-6">
              <Tooltip>
                <TooltipTrigger asChild>
                  <TabsTrigger value="all" className="flex items-center justify-center">
                    <LayoutGrid className="h-4 w-4" />
                  </TabsTrigger>
                </TooltipTrigger>
                <TooltipContent>
                  <p>All</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <TabsTrigger value="earnings" className="flex items-center justify-center">
                    <Coins className="h-4 w-4" />
                  </TabsTrigger>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Earnings</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <TabsTrigger value="consistency" className="flex items-center justify-center">
                    <Flame className="h-4 w-4" />
                  </TabsTrigger>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Consistency</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <TabsTrigger value="milestone" className="flex items-center justify-center">
                    <Target className="h-4 w-4" />
                  </TabsTrigger>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Milestones</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <TabsTrigger value="special" className="flex items-center justify-center">
                    <Sparkles className="h-4 w-4" />
                  </TabsTrigger>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Special</p>
                </TooltipContent>
              </Tooltip>
            </TabsList>
          </TooltipProvider>

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
      </CardContent>
    </Card>
  );
}
