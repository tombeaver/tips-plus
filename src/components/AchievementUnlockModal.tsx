import { useEffect, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trophy, Sparkles, Star } from "lucide-react";
import { AchievementTier } from "@/lib/achievements";

interface AchievementUnlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  achievement?: {
    title: string;
    description: string;
    tier: AchievementTier;
    icon?: React.ReactNode;
  };
}

const tierModalConfig = {
  bronze: {
    gradient: "from-amber-700 via-amber-600 to-amber-700",
    glow: "shadow-[0_0_60px_rgba(180,83,9,0.5)]",
    badge: "bg-amber-600",
    text: "text-amber-500",
    confettiColors: ["#b45309", "#d97706", "#f59e0b", "#ffffff"],
  },
  silver: {
    gradient: "from-slate-400 via-slate-300 to-slate-400",
    glow: "shadow-[0_0_60px_rgba(148,163,184,0.6)]",
    badge: "bg-slate-400",
    text: "text-slate-400",
    confettiColors: ["#94a3b8", "#cbd5e1", "#e2e8f0", "#ffffff"],
  },
  gold: {
    gradient: "from-yellow-500 via-yellow-400 to-yellow-500",
    glow: "shadow-[0_0_60px_rgba(234,179,8,0.6)]",
    badge: "bg-yellow-500",
    text: "text-yellow-500",
    confettiColors: ["#eab308", "#facc15", "#fde047", "#ffffff"],
  },
  legendary: {
    gradient: "from-purple-500 via-fuchsia-400 to-purple-500",
    glow: "shadow-[0_0_80px_rgba(168,85,247,0.7)]",
    badge: "bg-gradient-to-r from-purple-500 to-fuchsia-500",
    text: "text-purple-400",
    confettiColors: ["#a855f7", "#d946ef", "#c084fc", "#ffffff"],
  },
};

export function AchievementUnlockModal({
  isOpen,
  onClose,
  achievement = {
    title: "Century Club",
    description: "You've logged 100 shifts! Your dedication to tracking is truly legendary.",
    tier: "legendary",
  },
}: AchievementUnlockModalProps) {
  const [showContent, setShowContent] = useState(false);
  const config = tierModalConfig[achievement.tier];

  useEffect(() => {
    if (isOpen) {
      setShowContent(false);
      
      // Dynamically import confetti to avoid module resolution issues
      import("canvas-confetti").then((confettiModule) => {
        const confetti = confettiModule.default;
        
        // Trigger confetti burst
        const duration = 3000;
        const end = Date.now() + duration;
        const colors = config.confettiColors;

        const frame = () => {
          confetti({
            particleCount: 3,
            angle: 60,
            spread: 55,
            origin: { x: 0, y: 0.7 },
            colors,
          });
          confetti({
            particleCount: 3,
            angle: 120,
            spread: 55,
            origin: { x: 1, y: 0.7 },
            colors,
          });

          if (Date.now() < end) {
            requestAnimationFrame(frame);
          }
        };
        frame();

        // Big burst in the center
        setTimeout(() => {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors,
          });
        }, 300);
      });

      // Show content after initial animation
      setTimeout(() => setShowContent(true), 200);
    }
  }, [isOpen, achievement.tier, config.confettiColors]);

  const tierLabels: Record<AchievementTier, string> = {
    bronze: "Bronze",
    silver: "Silver",
    gold: "Gold",
    legendary: "Legendary"
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-screen h-screen max-w-none p-0 gap-0 border-0 flex flex-col items-center justify-center bg-black/95 overflow-hidden">
        {/* Animated background particles */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white/20 rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 3}s`,
              }}
            />
          ))}
        </div>

        {/* Main content */}
        <div
          className={`relative flex flex-col items-center transition-all duration-700 ${
            showContent ? "opacity-100 scale-100" : "opacity-0 scale-50"
          }`}
        >
          {/* Glowing badge container */}
          <div className={`relative mb-8 ${config.glow} rounded-full`}>
            {/* Spinning ring */}
            <div
              className={`absolute inset-[-8px] rounded-full bg-gradient-to-r ${config.gradient} opacity-50 animate-spin`}
              style={{ animationDuration: "3s" }}
            />
            
            {/* Badge background */}
            <div
              className={`relative w-32 h-32 rounded-full bg-gradient-to-br ${config.gradient} flex items-center justify-center`}
            >
              {/* Inner glow */}
              <div className="absolute inset-2 rounded-full bg-black/30 backdrop-blur-sm" />
              
              {/* Icon */}
              <div className="relative z-10">
                {achievement.icon || (
                  <Trophy className="w-16 h-16 text-white drop-shadow-lg" />
                )}
              </div>
            </div>

            {/* Sparkle effects */}
            <Sparkles
              className={`absolute -top-2 -right-2 w-8 h-8 ${config.text} animate-pulse`}
            />
            <Star
              className={`absolute -bottom-1 -left-3 w-6 h-6 ${config.text} animate-pulse`}
              style={{ animationDelay: "0.5s" }}
            />
          </div>

          {/* Achievement unlocked text */}
          <div
            className={`text-sm font-bold tracking-[0.3em] uppercase mb-4 ${config.text} transition-all duration-500 delay-300 ${
              showContent ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            Achievement Unlocked!
          </div>

          {/* Title */}
          <h2
            className={`text-3xl md:text-4xl font-bold text-white text-center mb-3 transition-all duration-500 delay-500 ${
              showContent ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            {achievement.title}
          </h2>

          {/* Tier badge */}
          <div
            className={`${config.badge} text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-6 transition-all duration-500 delay-700 ${
              showContent ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            {tierLabels[achievement.tier]}
          </div>

          {/* Description */}
          <p
            className={`text-muted-foreground text-center max-w-sm px-6 mb-10 transition-all duration-500 delay-900 ${
              showContent ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            {achievement.description}
          </p>

          {/* Continue button */}
          <Button
            onClick={onClose}
            size="lg"
            className={`bg-gradient-to-r ${config.gradient} text-black font-bold px-8 py-6 text-lg rounded-full hover:scale-105 transition-all duration-300 delay-1000 ${
              showContent ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            Awesome!
          </Button>
        </div>

        {/* Close hint */}
        <p
          className={`absolute bottom-8 text-muted-foreground/50 text-sm transition-all duration-500 delay-1200 ${
            showContent ? "opacity-100" : "opacity-0"
          }`}
        >
          Tap anywhere to close
        </p>
      </DialogContent>
    </Dialog>
  );
}
