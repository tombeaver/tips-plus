import * as React from "react";
import { Trophy, Target, TrendingUp, Star, Zap, Crown, DollarSign, Calendar, CheckCircle, Rocket, Wallet, LayoutGrid, Coins, Flame, Sparkles, Users, Sun, Moon } from "lucide-react";
import { AchievementBadge } from "./AchievementBadge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserAchievement, AchievementCategory } from "@/hooks/useAchievements";

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

type TabCategory = AchievementCategory | "all";

const categoryInfo: Record<TabCategory, { title: string; description: string }> = {
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
  skill: {
    title: "Skill Achievements",
    description: "Mastery of specific server skills and techniques"
  },
  mood: {
    title: "Mood Achievements",
    description: "Emotional resilience and mindset badges"
  },
  seasonal: {
    title: "Seasonal Achievements",
    description: "Limited-time holiday and event badges"
  }
};

export function AchievementsGallery({ achievements, loading }: AchievementsGalleryProps) {
  const [selectedCategory, setSelectedCategory] = React.useState<TabCategory>("all");

  const filterByCategory = (category: TabCategory) => {
    return category === "all" 
      ? achievements 
      : achievements.filter(a => a.category === category);
  };

  // Get visible categories (only show tabs for categories with achievements)
  const visibleCategories = React.useMemo(() => {
    const categoriesWithAchievements = new Set(achievements.map(a => a.category));
    const baseCategories: TabCategory[] = ["all", "milestone", "earnings", "consistency"];
    
    // Add other categories only if they have achievements
    const extraCategories: AchievementCategory[] = ["skill", "mood", "seasonal"];
    extraCategories.forEach(cat => {
      if (categoriesWithAchievements.has(cat)) {
        baseCategories.push(cat);
      }
    });
    
    return baseCategories;
  }, [achievements]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-muted-foreground">Loading achievements...</div>
      </div>
    );
  }

  return (
    <div>
      <Tabs defaultValue="all" className="w-full" onValueChange={(value) => setSelectedCategory(value as TabCategory)}>
        {/* Sticky Tab Navigation */}
        <div className="sticky top-0 z-10 bg-background shadow-md px-6">
          <TabsList className={`grid w-full bg-card/50 border shadow-sm h-12`} style={{ gridTemplateColumns: `repeat(${Math.min(visibleCategories.length, 5)}, 1fr)` }}>
            {visibleCategories.slice(0, 5).map((category) => (
              <TabsTrigger 
                key={category} 
                value={category} 
                className="flex items-center gap-1 transition-all duration-200 data-[state=active]:bg-primary/10 data-[state=active]:text-primary hover:bg-muted/50"
              >
                {category === "all" && <LayoutGrid className="h-4 w-4" />}
                {category === "earnings" && <Coins className="h-4 w-4" />}
                {category === "consistency" && <Flame className="h-4 w-4" />}
                {category === "milestone" && <Target className="h-4 w-4" />}
                {category === "skill" && <Star className="h-4 w-4" />}
                {category === "mood" && <Sparkles className="h-4 w-4" />}
                {category === "seasonal" && <Calendar className="h-4 w-4" />}
                <span className="hidden sm:inline capitalize">{category === "all" ? "All" : category}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {/* Content with proper spacing */}
        <div className="px-6 pb-6 mt-[50px]">
          {visibleCategories.map((category) => (
            <TabsContent key={category} value={category} className="mt-0">
              {/* Category Title */}
              <div className="text-center pt-4 pb-6">
                <h3 className="text-2xl font-bold text-foreground mb-2">
                  {categoryInfo[category]?.title || `${category} Achievements`}
                </h3>
                <p className="text-muted-foreground">
                  {categoryInfo[category]?.description || "Achievements in this category"}
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {filterByCategory(category).map((achievement) => {
                  const IconComponent = iconMap[achievement.icon] || Trophy;
                  return (
                    <AchievementBadge
                      key={achievement.achievement_id}
                      icon={IconComponent}
                      title={achievement.name}
                      description={achievement.description}
                      tier={achievement.tier}
                      category={achievement.category}
                      unlocked={achievement.unlocked}
                      unlockedDate={achievement.unlocked ? achievement.unlockedDate : undefined}
                      progress={!achievement.unlocked ? achievement.progress : undefined}
                    />
                  );
                })}
              </div>

              {filterByCategory(category).length === 0 && (
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
