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

const rarityConfig = {
  common: {
    gradient: "from-cyan-500 to-emerald-500",
    bgGradient: "from-cyan-500/20 to-emerald-500/10",
    border: "border-cyan-500/40",
    glow: "shadow-cyan-500/30",
    iconColor: "text-cyan-500",
    progressColor: "bg-cyan-500",
    overlayGradient: "from-cyan-600 via-emerald-500 to-cyan-600",
  },
  rare: {
    gradient: "from-blue-500 to-indigo-500",
    bgGradient: "from-blue-500/20 to-indigo-500/10",
    border: "border-blue-500/40",
    glow: "shadow-blue-500/40",
    iconColor: "text-blue-500",
    progressColor: "bg-blue-500",
    overlayGradient: "from-blue-600 via-indigo-500 to-blue-600",
  },
  epic: {
    gradient: "from-purple-500 to-fuchsia-500",
    bgGradient: "from-purple-500/25 to-fuchsia-500/15",
    border: "border-purple-500/50",
    glow: "shadow-purple-500/50",
    iconColor: "text-purple-500",
    progressColor: "bg-purple-500",
    overlayGradient: "from-purple-600 via-fuchsia-500 to-purple-600",
  },
  legendary: {
    gradient: "from-amber-400 to-orange-500",
    bgGradient: "from-amber-500/30 to-orange-500/20",
    border: "border-amber-500/60",
    glow: "shadow-amber-500/60",
    iconColor: "text-amber-500",
    progressColor: "bg-gradient-to-r from-amber-400 to-orange-500",
    overlayGradient: "from-amber-500 via-yellow-400 to-orange-500",
  },
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
  const [showOverlay, setShowOverlay] = useState(false);
  const config = rarityConfig[rarity];

  return (
    <div
      className={cn(
        "relative cursor-pointer transition-all duration-300 h-[200px] group",
        className
      )}
      onClick={() => setShowOverlay(!showOverlay)}
    >
      <div
        className={cn(
          "relative w-full h-full rounded-xl border-2 p-4 overflow-hidden",
          "bg-gradient-to-br",
          unlocked ? config.bgGradient : "from-muted/10 to-muted/5",
          unlocked ? config.border : "border-muted/20",
          unlocked && `shadow-lg ${config.glow}`,
          !unlocked && "opacity-60 grayscale",
          "transition-all duration-300",
          "hover:scale-[1.02] hover:shadow-xl"
        )}
      >
        {/* Animated glow ring for unlocked badges */}
        {unlocked && (
          <div
            className={cn(
              "absolute -inset-[2px] rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500",
              "bg-gradient-to-r",
              config.gradient
            )}
            style={{
              filter: "blur(8px)",
              zIndex: -1,
            }}
          />
        )}

        {/* Animated particles for legendary */}
        {unlocked && rarity === "legendary" && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-amber-400 rounded-full animate-ping"
                style={{
                  left: `${15 + i * 15}%`,
                  top: `${20 + (i % 3) * 25}%`,
                  animationDelay: `${i * 0.4}s`,
                  animationDuration: "2s",
                }}
              />
            ))}
          </div>
        )}

        {/* Content */}
        <div className="flex flex-col items-center gap-2 relative z-10">
          {/* Badge Icon Container */}
          <div
            className={cn(
              "relative rounded-full p-4 transition-all duration-300",
              "bg-background/60 backdrop-blur-sm",
              unlocked ? "shadow-lg" : "shadow-sm"
            )}
          >
            {/* Icon glow for unlocked */}
            {unlocked && (
              <div
                className={cn(
                  "absolute inset-0 rounded-full opacity-50",
                  "bg-gradient-to-br",
                  config.gradient
                )}
                style={{ filter: "blur(8px)" }}
              />
            )}

            <Icon
              className={cn(
                "h-8 w-8 transition-all duration-300 relative z-10",
                unlocked ? config.iconColor : "text-muted-foreground",
                unlocked && rarity === "legendary" && "animate-pulse"
              )}
            />

            {/* Locked Overlay */}
            {!unlocked && progress === undefined && (
              <div className="absolute inset-0 flex items-center justify-center rounded-full bg-background/90 backdrop-blur-sm">
                <span className="text-2xl opacity-60">🔒</span>
              </div>
            )}
          </div>

          {/* Badge Title */}
          <h3
            className={cn(
              "text-sm font-semibold text-center leading-tight",
              unlocked ? "text-foreground" : "text-muted-foreground"
            )}
          >
            {title}
          </h3>

          {/* Progress Bar for In-Progress Badges */}
          {!unlocked && progress !== undefined && progress > 0 && (
            <div className="w-full mt-1 px-2">
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className={cn(
                    "h-full transition-all duration-700 ease-out rounded-full",
                    config.progressColor
                  )}
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground text-center mt-1">
                {Math.round(progress)}%
              </p>
            </div>
          )}

          {/* Rarity Badge */}
          <Badge
            variant={unlocked ? "default" : "outline"}
            className={cn(
              "text-xs capitalize font-medium",
              unlocked && rarity === "legendary" && "bg-gradient-to-r from-amber-400 to-orange-500 text-black border-0"
            )}
          >
            {rarity}
          </Badge>
        </div>

        {/* Sparkle Effects for High Rarity */}
        {unlocked && (rarity === "legendary" || rarity === "epic") && (
          <>
            <span className="absolute -top-1 -right-1 text-xl animate-pulse">✨</span>
            {rarity === "legendary" && (
              <span 
                className="absolute -bottom-1 -left-1 text-lg animate-pulse"
                style={{ animationDelay: "0.5s" }}
              >
                ⭐
              </span>
            )}
          </>
        )}

        {/* Overlay on Click */}
        {showOverlay && (
          <div
            className={cn(
              "absolute inset-0 rounded-xl bg-gradient-to-br",
              config.overlayGradient,
              "flex flex-col justify-center items-center p-4",
              "animate-in fade-in zoom-in-95 duration-200"
            )}
          >
            <div className="space-y-3 text-center">
              <h4 className="font-bold text-sm text-white drop-shadow-md">
                {title}
              </h4>

              <p className="text-xs leading-relaxed px-2 text-white/90">
                {description}
              </p>

              {unlocked && unlockedDate && (
                <div className="pt-2 border-t border-white/30">
                  <p className="text-xs text-white/80 font-medium">
                    🏆 Unlocked{" "}
                    {unlockedDate.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
              )}

              {!unlocked && progress !== undefined && progress > 0 && (
                <div className="pt-2 border-t border-white/30">
                  <p className="text-xs text-white/90 font-medium">
                    📊 {Math.round(progress)}% complete
                  </p>
                </div>
              )}

              {!unlocked && (progress === undefined || progress === 0) && (
                <div className="pt-2 border-t border-white/30">
                  <p className="text-xs text-white/80">
                    🎯 Keep working to unlock!
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
