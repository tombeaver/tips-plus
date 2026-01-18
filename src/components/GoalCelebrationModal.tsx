import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Trophy, Sparkles, TrendingUp, Calendar, Clock } from 'lucide-react';

interface GoalCelebrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'weekly' | 'monthly';
  earned: number;
  target: number;
}

export const GoalCelebrationModal: React.FC<GoalCelebrationModalProps> = ({
  isOpen,
  onClose,
  type,
  earned,
  target,
}) => {
  const [showContent, setShowContent] = useState(false);
  const surplus = earned - target;
  const percentageOver = target > 0 ? ((surplus / target) * 100).toFixed(0) : 0;

  useEffect(() => {
    if (isOpen) {
      // Trigger confetti
      const triggerConfetti = async () => {
        try {
          const confetti = (await import('canvas-confetti')).default;
          // First burst
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#9333ea', '#a855f7', '#c084fc', '#fbbf24', '#34d399'],
          });
          // Second burst after delay
          setTimeout(() => {
            confetti({
              particleCount: 50,
              angle: 60,
              spread: 55,
              origin: { x: 0 },
              colors: ['#9333ea', '#a855f7', '#c084fc'],
            });
            confetti({
              particleCount: 50,
              angle: 120,
              spread: 55,
              origin: { x: 1 },
              colors: ['#fbbf24', '#34d399', '#22c55e'],
            });
          }, 250);
        } catch (error) {
          console.error('Confetti error:', error);
        }
      };

      triggerConfetti();
      
      // Animate content in
      const timer = setTimeout(() => setShowContent(true), 100);
      return () => clearTimeout(timer);
    } else {
      setShowContent(false);
    }
  }, [isOpen]);

  const Icon = type === 'weekly' ? Clock : Calendar;
  const label = type === 'weekly' ? 'Weekly' : 'Monthly';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm mx-auto p-0 gap-0 border-0 overflow-hidden bg-transparent shadow-none">
        <div 
          className={`
            bg-gradient-to-br from-purple-600 via-purple-500 to-amber-400 
            rounded-2xl p-6 text-white text-center
            transform transition-all duration-500 ease-out
            ${showContent ? 'scale-100 opacity-100' : 'scale-90 opacity-0'}
          `}
        >
          {/* Animated trophy icon */}
          <div className="relative mx-auto w-20 h-20 mb-4">
            <div className="absolute inset-0 bg-white/20 rounded-full animate-ping" />
            <div className="relative flex items-center justify-center w-20 h-20 bg-white/30 rounded-full backdrop-blur-sm">
              <Trophy className="h-10 w-10 text-amber-300" />
            </div>
            {/* Sparkles */}
            <Sparkles className="absolute -top-1 -right-1 h-5 w-5 text-amber-300 animate-pulse" />
            <Sparkles className="absolute -bottom-1 -left-1 h-4 w-4 text-white animate-pulse" style={{ animationDelay: '0.5s' }} />
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold mb-1">
            {label} Goal Achieved!
          </h2>
          <p className="text-white/80 text-sm mb-4">
            You crushed it this {type === 'weekly' ? 'week' : 'month'}!
          </p>

          {/* Earnings display */}
          <div className="bg-white/20 rounded-xl p-4 backdrop-blur-sm mb-4">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Icon className="h-4 w-4 text-white/70" />
              <span className="text-sm text-white/70 uppercase tracking-wide">
                {label} Earnings
              </span>
            </div>
            <p className="text-3xl font-bold">${earned.toFixed(0)}</p>
            <p className="text-sm text-white/70">Target: ${target.toFixed(0)}</p>
          </div>

          {/* Surplus badge */}
          {surplus > 0 && (
            <div className="inline-flex items-center gap-2 bg-emerald-500/30 px-4 py-2 rounded-full mb-4">
              <TrendingUp className="h-4 w-4 text-emerald-300" />
              <span className="font-semibold text-emerald-100">
                +${surplus.toFixed(0)} surplus ({percentageOver}% over)
              </span>
            </div>
          )}

          {/* Continue button */}
          <Button
            onClick={onClose}
            className="w-full bg-white text-purple-600 hover:bg-white/90 font-semibold"
          >
            Keep It Up!
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
