import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, ArrowRight, ArrowLeft, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { OnboardingStep } from '@/hooks/useOnboarding';

interface OnboardingTooltipProps {
  step: OnboardingStep | null;
  currentStepIndex: number;
  totalSteps: number;
  isLastStep: boolean;
  isWaitingForAction: boolean;
  onNext: () => void;
  onPrevious: () => void;
  onSkip: () => void;
  onFinish: () => void;
  onTargetClick: (targetId: string) => void;
}

export const OnboardingTooltip: React.FC<OnboardingTooltipProps> = ({
  step,
  currentStepIndex,
  totalSteps,
  isLastStep,
  isWaitingForAction,
  onNext,
  onPrevious,
  onSkip,
  onFinish,
  onTargetClick,
}) => {
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const [arrowPosition, setArrowPosition] = useState<'top' | 'bottom' | 'left' | 'right'>('bottom');
  const [isVisible, setIsVisible] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const previousTargetRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!step) {
      setIsVisible(false);
      // Clean up previous highlight
      if (previousTargetRef.current) {
        previousTargetRef.current.classList.remove('onboarding-highlight');
        previousTargetRef.current = null;
      }
      return;
    }

    const updatePosition = () => {
      const target = document.getElementById(step.targetId);
      
      // Clean up previous highlight
      if (previousTargetRef.current && previousTargetRef.current !== target) {
        previousTargetRef.current.classList.remove('onboarding-highlight');
      }
      
      if (!target) {
        // Wait for element to appear
        const retryTimeout = setTimeout(updatePosition, 200);
        return () => clearTimeout(retryTimeout);
      }

      // Add highlight to current target
      target.classList.add('onboarding-highlight');
      previousTargetRef.current = target;

      const rect = target.getBoundingClientRect();
      const tooltipWidth = 300;
      const tooltipHeight = 180;
      const padding = 16;
      const arrowSize = 10;

      // Scroll target into view if needed
      if (rect.top < 80 || rect.bottom > window.innerHeight - 80) {
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setTimeout(updatePosition, 350);
        return;
      }

      let top = 0;
      let left = 0;
      let arrow: 'top' | 'bottom' | 'left' | 'right' = step.position || 'bottom';

      const spaceAbove = rect.top;
      const spaceBelow = window.innerHeight - rect.bottom;

      // Auto-determine best position if not specified
      if (!step.position) {
        if (spaceBelow >= tooltipHeight + padding) {
          arrow = 'top';
        } else if (spaceAbove >= tooltipHeight + padding) {
          arrow = 'bottom';
        } else {
          arrow = 'top';
        }
      } else {
        // Map position to arrow direction
        arrow = step.position === 'top' ? 'bottom' : 
                step.position === 'bottom' ? 'top' : 
                step.position;
      }

      switch (arrow) {
        case 'top': // Tooltip below target
          top = rect.bottom + padding + arrowSize;
          left = rect.left + rect.width / 2 - tooltipWidth / 2;
          break;
        case 'bottom': // Tooltip above target
          top = rect.top - tooltipHeight - padding - arrowSize;
          left = rect.left + rect.width / 2 - tooltipWidth / 2;
          break;
        case 'left': // Tooltip to right
          top = rect.top + rect.height / 2 - tooltipHeight / 2;
          left = rect.right + padding + arrowSize;
          break;
        case 'right': // Tooltip to left
          top = rect.top + rect.height / 2 - tooltipHeight / 2;
          left = rect.left - tooltipWidth - padding - arrowSize;
          break;
      }

      // Keep within viewport
      left = Math.max(padding, Math.min(left, window.innerWidth - tooltipWidth - padding));
      top = Math.max(padding, Math.min(top, window.innerHeight - tooltipHeight - padding));

      setTooltipPosition({ top, left });
      setArrowPosition(arrow);
      setIsVisible(true);
    };

    // Small delay for DOM updates
    const timer = setTimeout(updatePosition, 100);
    
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition);
    };
  }, [step]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (previousTargetRef.current) {
        previousTargetRef.current.classList.remove('onboarding-highlight');
      }
    };
  }, []);

  if (!step || !isVisible) return null;

  const arrowClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-t-transparent border-b-card',
    bottom: 'top-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent border-t-card',
    left: 'right-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-l-transparent border-r-card',
    right: 'left-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-r-transparent border-l-card',
  };

  const isFirstStep = currentStepIndex === 0;
  const showActionHint = step.action === 'click' || step.action === 'wait';

  return createPortal(
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 z-[9998]" 
        style={{ pointerEvents: 'auto' }}
      />
      
      {/* Clickable overlay for highlighted element */}
      {step.action === 'click' && (
        <div 
          className="fixed inset-0 z-[9999]"
          style={{ pointerEvents: 'none' }}
          onClick={(e) => {
            const target = document.getElementById(step.targetId);
            if (target && target.contains(e.target as Node)) {
              onTargetClick(step.targetId);
            }
          }}
        />
      )}
      
      {/* Tooltip */}
      <div
        ref={tooltipRef}
        className="fixed z-[10000] w-[300px] animate-in fade-in-0 zoom-in-95 duration-300"
        style={{ 
          top: tooltipPosition.top, 
          left: tooltipPosition.left,
          pointerEvents: 'auto'
        }}
      >
        <div className="relative bg-card rounded-xl shadow-2xl border-2 border-primary/20 p-5">
          {/* Arrow */}
          <div 
            className={cn(
              'absolute w-0 h-0 border-[10px]',
              arrowClasses[arrowPosition]
            )}
          />
          
          {/* Skip button */}
          <button
            onClick={onSkip}
            className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Skip tutorial"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Content */}
          <div className="pr-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                Step {currentStepIndex + 1} of {totalSteps}
              </span>
            </div>
            <h3 className="font-semibold text-base text-foreground mb-2">
              {step.title}
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {step.description}
            </p>
            
            {/* Action hint */}
            {showActionHint && (
              <p className="text-xs text-primary mt-3 font-medium animate-pulse">
                {step.action === 'click' 
                  ? '👆 Tap the highlighted area to continue'
                  : '⏳ Complete the action to continue...'}
              </p>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between mt-5 pt-4 border-t border-border">
            {/* Progress dots */}
            <div className="flex gap-1.5">
              {Array.from({ length: totalSteps }).map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    'w-2 h-2 rounded-full transition-all duration-300',
                    i === currentStepIndex 
                      ? 'bg-primary scale-110' 
                      : i < currentStepIndex 
                        ? 'bg-primary/50' 
                        : 'bg-muted'
                  )}
                />
              ))}
            </div>
            
            {/* Navigation buttons */}
            <div className="flex gap-2">
              {!isFirstStep && !isWaitingForAction && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onPrevious}
                  className="h-8 px-3 text-sm"
                >
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Back
                </Button>
              )}
              
              {!showActionHint && (
                <Button
                  size="sm"
                  onClick={isLastStep ? onFinish : onNext}
                  className="h-8 px-4 text-sm"
                >
                  {isLastStep ? (
                    <>
                      <Check className="h-4 w-4 mr-1" />
                      Finish
                    </>
                  ) : (
                    <>
                      Next
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
};
