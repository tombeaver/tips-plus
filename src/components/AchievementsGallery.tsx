import * as React from "react";
import { Trophy, Target, TrendingUp, Star, Zap, Crown, DollarSign, Calendar, CheckCircle, Rocket, Wallet, LayoutGrid, Coins, Flame, Sparkles, Users, Sun, Moon } from "lucide-react";
import { AchievementBadge, BadgeCategory } from "./AchievementBadge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserAchievement } from "@/hooks/useAchievements";

const iconMap: Record<string, any> = {
  Trophy,
  Target,
  TrendingUp,
  Zap,
  Star,
  CheckCircle,
  Calendar,
  DollarSign,
  Crown,
  Rocket,
  Wallet,
  Flame,
  Sparkles,
  Users,
  Sun,
  Moon
};

interface AchievementsGalleryProps {
  achievements: UserAchievement[];
  loading?: boolean;
}

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

export function AchievementsGallery({ achievements, loading }: AchievementsGalleryProps) {
  const [selectedCategory, setSelectedCategory] = React.useState<BadgeCategory | "all">("all");

  const filterByCategory = (category: BadgeCategory | "all") => {
    return category === "all" 
      ? achievements 
      : achievements.filter(a => a.category === category);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-muted-foreground">Loading achievements...</div>
      </div>
    );
  }

  return (
    <div>
      <Tabs defaultValue="all" className="w-full" onValueChange={(value) => setSelectedCategory(value as BadgeCategory | "all")}>
        {/* Sticky Tab Navigation */}
        <div className="sticky top-0 z-10 bg-background shadow-md px-6">
          <TabsList className="grid w-full grid-cols-5 bg-card/50 border shadow-sm h-12">
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

        {/* Content with proper spacing */}
        <div className="px-6 pb-6 mt-[50px]">
          {(["all", "earnings", "consistency", "milestone", "special"] as const).map((category) => (
            <TabsContent key={category} value={category} className="mt-0">
              {/* Category Title */}
              <div className="text-center pt-4 pb-6">
                <h3 className="text-2xl font-bold text-foreground mb-2">
                  {categoryInfo[category === "all" ? "all" : category].title}
                </h3>
                <p className="text-muted-foreground">
                  {categoryInfo[category === "all" ? "all" : category].description}
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {filterByCategory(category === "all" ? "all" : category).map((achievement) => {
                  const IconComponent = iconMap[achievement.icon] || Trophy;
                  return (
                    <AchievementBadge
                      key={achievement.id}
                      icon={IconComponent}
                      title={achievement.title}
                      description={achievement.description}
                      rarity={achievement.rarity}
                      category={achievement.category}
                      unlocked={achievement.unlocked}
                      unlockedDate={achievement.unlocked ? achievement.unlockedDate : undefined}
                      progress={!achievement.unlocked && 'progress' in achievement ? achievement.progress : undefined}
                    />
                  );
                })}
              </div>

              {filterByCategory(category === "all" ? "all" : category).length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  No achievements in this category yet
                </div>
              )}
            </TabsContent>
          ))}
        </div>
      </Tabs>
    </div>
  );
}
