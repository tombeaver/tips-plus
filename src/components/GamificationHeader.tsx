import { cn } from "@/lib/utils";
import { GamificationStats, LEVELS } from "@/hooks/useGamification";
import { Flame, Trophy, Zap, TrendingUp, Star } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

interface GamificationHeaderProps {
  stats: GamificationStats;
  className?: string;
}

export function GamificationHeader({ stats, className }: GamificationHeaderProps) {
  const { currentLevel, totalXP, xpProgress, xpToNextLevel, streak, unlockedAchievements, totalAchievements } = stats;
  
  const nextLevel = LEVELS.find(l => l.level === currentLevel.level + 1);
  
  return (
    <div className={cn("relative overflow-hidden", className)}>
      {/* Animated background gradient */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          background: `linear-gradient(135deg, ${currentLevel.color}40 0%, transparent 50%, ${currentLevel.color}20 100%)`,
        }}
      />
      
      {/* Floating particles for higher levels */}
      {currentLevel.level >= 5 && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 rounded-full animate-pulse"
              style={{
                backgroundColor: currentLevel.color,
                left: `${10 + i * 12}%`,
                top: `${20 + (i % 3) * 25}%`,
                animationDelay: `${i * 0.3}s`,
                opacity: 0.4,
              }}
            />
          ))}
        </div>
      )}
      
      <div className="relative p-6 space-y-4">
        {/* Level Badge & Title */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Level Icon with Glow */}
            <div 
              className="relative flex items-center justify-center w-14 h-14 rounded-full text-2xl"
              style={{
                background: `linear-gradient(135deg, ${currentLevel.color}30, ${currentLevel.color}10)`,
                boxShadow: currentLevel.level >= 7 ? `0 0 20px ${currentLevel.color}40` : undefined,
              }}
            >
              <span className={cn(
                currentLevel.level >= 9 && "animate-pulse"
              )}>
                {currentLevel.icon}
              </span>
              
              {/* Level Number Badge */}
              <div 
                className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
                style={{ backgroundColor: currentLevel.color }}
              >
                {currentLevel.level}
              </div>
            </div>
            
            <div>
              <h3 className="font-bold text-lg" style={{ color: currentLevel.color }}>
                {currentLevel.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {totalXP.toLocaleString()} XP Total
              </p>
            </div>
          </div>
          
          {/* Streak Badge */}
          {streak.isStreakActive && streak.currentStreak > 0 && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-orange-500/10 border border-orange-500/20">
              <Flame className="w-5 h-5 text-orange-500 animate-pulse" />
              <span className="font-bold text-orange-500">{streak.currentStreak}</span>
              <span className="text-xs text-orange-500/70">day streak</span>
            </div>
          )}
        </div>
        
        {/* XP Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Level Progress</span>
            {nextLevel && (
              <span className="text-muted-foreground">
                {xpToNextLevel.toLocaleString()} XP to {nextLevel.title}
              </span>
            )}
          </div>
          
          <div className="relative h-3 bg-muted rounded-full overflow-hidden">
            {/* Animated progress bar */}
            <div
              className="absolute inset-y-0 left-0 rounded-full transition-all duration-1000 ease-out"
              style={{
                width: `${xpProgress}%`,
                background: `linear-gradient(90deg, ${currentLevel.color}, ${currentLevel.color}cc)`,
                boxShadow: `0 0 10px ${currentLevel.color}60`,
              }}
            />
            
            {/* Shimmer effect */}
            <div 
              className="absolute inset-0 opacity-30"
              style={{
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
                animation: 'shimmer 2s infinite',
              }}
            />
          </div>
        </div>
        
        {/* Quick Stats Row */}
        <div className="grid grid-cols-4 gap-3 pt-2">
          <QuickStat
            icon={<Zap className="w-4 h-4" />}
            label="Shifts"
            value={stats.totalShifts}
            color="#3b82f6"
          />
          <QuickStat
            icon={<TrendingUp className="w-4 h-4" />}
            label="Earned"
            value={`$${(stats.totalEarnings / 1000).toFixed(1)}k`}
            color="#22c55e"
          />
          <QuickStat
            icon={<Trophy className="w-4 h-4" />}
            label="Badges"
            value={`${unlockedAchievements}/${totalAchievements}`}
            color="#f59e0b"
          />
          <QuickStat
            icon={<Star className="w-4 h-4" />}
            label="Best Streak"
            value={streak.longestStreak}
            color="#8b5cf6"
          />
        </div>
      </div>
      
      {/* Add shimmer animation */}
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}

function QuickStat({ 
  icon, 
  label, 
  value, 
  color 
}: { 
  icon: React.ReactNode; 
  label: string; 
  value: string | number;
  color: string;
}) {
  return (
    <div className="text-center p-2 rounded-lg bg-background/50 border border-border/50">
      <div 
        className="flex items-center justify-center mb-1"
        style={{ color }}
      >
        {icon}
      </div>
      <p className="text-lg font-bold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
