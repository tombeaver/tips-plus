import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

export type BadgeRarity = "common" | "rare" | "epic" | "legendary";
export type BadgeCategory = "earnings" | "consistency" | "milestone" | "special";

interface AchievementBadgeProps {
  icon: LucideIcon;
  title: string;
  description: string;
  rarity: BadgeRarity;
  category: BadgeCategory;
  unlocked: boolean;
  unlockedDate?: Date;
  progress?: number; // 0-100 for in-progress achievements
  className?: string;
}

const rarityStyles: Record<BadgeRarity, string> = {
  common: "from-secondary/20 to-secondary/10 border-secondary/30",
  rare: "from-primary/20 to-primary/10 border-primary/30",
  epic: "from-purple-500/20 to-purple-500/10 border-purple-500/30",
  legendary: "from-amber-500/20 to-amber-500/10 border-amber-500/30",
};

const rarityGlow: Record<BadgeRarity, string> = {
  common: "shadow-secondary/20",
  rare: "shadow-primary/30",
  epic: "shadow-purple-500/40",
  legendary: "shadow-amber-500/50 animate-pulse",
};

const rarityIcon: Record<BadgeRarity, string> = {
  common: "text-secondary",
  rare: "text-primary",
  epic: "text-purple-500",
  legendary: "text-amber-500",
};

export function AchievementBadge({
  icon: Icon,
  title,
  description,
  rarity,
  category,
  unlocked,
  unlockedDate,
  progress,
  className,
}: AchievementBadgeProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div
      className={cn(
        "relative cursor-pointer transition-all duration-500 h-[200px]",
        "preserve-3d",
        className
      )}
      style={{ perspective: "1000px" }}
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <div
        className={cn(
          "relative w-full h-full transition-transform duration-500",
          "preserve-3d"
        )}
        style={{
          transformStyle: "preserve-3d",
          transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
      >
        {/* Front of Card */}
        <div
          className={cn(
            "absolute inset-0 backface-hidden",
            "rounded-xl border-2 bg-gradient-to-br p-4",
            "transition-all duration-300 hover:shadow-lg",
            unlocked ? rarityStyles[rarity] : "from-muted/10 to-muted/5 border-muted/20",
            unlocked && rarityGlow[rarity],
            !unlocked && "opacity-50 grayscale"
          )}
          style={{ backfaceVisibility: "hidden" }}
        >
          {/* Badge Icon */}
          <div className="flex flex-col items-center gap-2">
            <div
              className={cn(
                "relative rounded-full p-4 transition-all duration-300",
                "bg-background/50 backdrop-blur-sm",
                unlocked ? "shadow-lg" : "shadow-sm"
              )}
            >
              <Icon
                className={cn(
                  "h-8 w-8 transition-colors",
                  unlocked ? rarityIcon[rarity] : "text-muted-foreground"
                )}
              />
              
              {/* Locked Overlay */}
              {!unlocked && progress === undefined && (
                <div className="absolute inset-0 flex items-center justify-center rounded-full bg-background/80 backdrop-blur-sm">
                  <span className="text-2xl">🔒</span>
                </div>
              )}
            </div>

            {/* Badge Title */}
            <h3 className={cn(
              "text-sm font-semibold text-center",
              unlocked ? "text-foreground" : "text-muted-foreground"
            )}>
              {title}
            </h3>

            {/* Progress Bar for In-Progress Badges */}
            {!unlocked && progress !== undefined && (
              <div className="w-full mt-1">
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground text-center mt-1">
                  {progress}% Complete
                </p>
              </div>
            )}

            {/* Rarity Badge */}
            <Badge
              variant={unlocked ? "default" : "outline"}
              className="text-xs capitalize"
            >
              {rarity}
            </Badge>
          </div>

          {/* Sparkle Effect for Legendary */}
          {unlocked && rarity === "legendary" && (
            <div className="absolute -top-1 -right-1">
              <span className="text-2xl animate-pulse">✨</span>
            </div>
          )}
        </div>

        {/* Back of Card */}
        <div
          className={cn(
            "absolute inset-0 backface-hidden",
            "rounded-xl border-2 bg-gradient-to-br p-4",
            "flex flex-col justify-center items-center",
            unlocked ? rarityStyles[rarity] : "from-muted/10 to-muted/5 border-muted/20",
            unlocked && rarityGlow[rarity],
            !unlocked && "opacity-50"
          )}
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          <div className="space-y-3 text-center">
            <h4 className="font-semibold text-sm">{title}</h4>

            <p className="text-xs leading-relaxed px-2">{description}</p>

            {unlocked && unlockedDate && (
              <div className="pt-2 border-t border-border/30">
                <p className="text-xs text-muted-foreground">
                  Unlocked {unlockedDate.toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </p>
              </div>
            )}

            {!unlocked && progress !== undefined && (
              <div className="pt-2 border-t border-border/30">
                <p className="text-xs text-muted-foreground">
                  {progress}% complete
                </p>
              </div>
            )}

            {!unlocked && progress === undefined && (
              <div className="pt-2 border-t border-border/30">
                <p className="text-xs text-muted-foreground">
                  Keep working to unlock!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
