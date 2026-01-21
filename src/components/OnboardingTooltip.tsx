import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  const positionUpdateRef = useRef<number>();

  const updatePosition = useCallback(() => {
    if (!step) return;

    const target = document.getElementById(step.targetId);
    
    // Clean up previous highlight
    if (previousTargetRef.current && previousTargetRef.current !== target) {
      previousTargetRef.current.classList.remove('onboarding-highlight');
    }
    
    if (!target) {
      // Element not found yet - retry with slightly longer delay for dialogs
      positionUpdateRef.current = window.setTimeout(updatePosition, 150);
      return;
    }
    
    // Check if target is visible and has dimensions
    const rect = target.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) {
      // Element exists but not yet rendered - retry
      positionUpdateRef.current = window.setTimeout(updatePosition, 100);
      return;
    }

    // Add highlight to current target
    target.classList.add('onboarding-highlight');
    previousTargetRef.current = target;

    const tooltipWidth = 300;
    const tooltipHeight = 200;
    const padding = 12;
    const arrowSize = 8;

    // Calculate available space
    const spaceAbove = rect.top;
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceLeft = rect.left;
    const spaceRight = window.innerWidth - rect.right;

    // Determine best position
    let arrow: 'top' | 'bottom' | 'left' | 'right' = 'top';
    
    if (step.position) {
      // Map position to arrow direction (arrow points toward target)
      arrow = step.position === 'top' ? 'bottom' : 
              step.position === 'bottom' ? 'top' : 
              step.position === 'left' ? 'right' :
              'left';
    } else {
      // Auto-determine: prefer below, then above, then sides
      if (spaceBelow >= tooltipHeight + padding + arrowSize) {
        arrow = 'top'; // tooltip below, arrow points up
      } else if (spaceAbove >= tooltipHeight + padding + arrowSize) {
        arrow = 'bottom'; // tooltip above, arrow points down
      } else if (spaceRight >= tooltipWidth + padding + arrowSize) {
        arrow = 'left'; // tooltip right, arrow points left
      } else {
        arrow = 'right'; // tooltip left, arrow points right
      }
    }

    let top = 0;
    let left = 0;

    switch (arrow) {
      case 'top': // Tooltip below target
        top = rect.bottom + padding + arrowSize;
        left = rect.left + rect.width / 2 - tooltipWidth / 2;
        break;
      case 'bottom': // Tooltip above target
        top = rect.top - tooltipHeight - padding - arrowSize;
        left = rect.left + rect.width / 2 - tooltipWidth / 2;
        break;
      case 'left': // Tooltip to right of target
        top = rect.top + rect.height / 2 - tooltipHeight / 2;
        left = rect.right + padding + arrowSize;
        break;
      case 'right': // Tooltip to left of target
        top = rect.top + rect.height / 2 - tooltipHeight / 2;
        left = rect.left - tooltipWidth - padding - arrowSize;
        break;
    }

    // Clamp to viewport with safe margins
    const safeMargin = 16;
    left = Math.max(safeMargin, Math.min(left, window.innerWidth - tooltipWidth - safeMargin));
    top = Math.max(safeMargin, Math.min(top, window.innerHeight - tooltipHeight - safeMargin));

    setTooltipPosition({ top, left });
    setArrowPosition(arrow);
    setIsVisible(true);
  }, [step]);

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

    // Reset visibility for transition
    setIsVisible(false);
    
    // Check if target is inside a dialog - use longer delay for dialogs to fully render
    const isDialogTarget = step.targetId === 'tip-entry-form' || 
                           step.targetId.includes('form') ||
                           step.targetId.includes('modal');
    const delay = isDialogTarget ? 400 : 150;
    
    // Delay for DOM updates, then position
    const timer = setTimeout(() => {
      updatePosition();
    }, delay);

    // Reposition on scroll/resize
    const handleReposition = () => {
      if (positionUpdateRef.current) {
        clearTimeout(positionUpdateRef.current);
      }
      positionUpdateRef.current = window.setTimeout(updatePosition, 50);
    };

    window.addEventListener('resize', handleReposition);
    window.addEventListener('scroll', handleReposition, true); // capture phase for nested scrolls

    return () => {
      clearTimeout(timer);
      if (positionUpdateRef.current) {
        clearTimeout(positionUpdateRef.current);
      }
      window.removeEventListener('resize', handleReposition);
      window.removeEventListener('scroll', handleReposition, true);
    };
  }, [step, updatePosition]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (previousTargetRef.current) {
        previousTargetRef.current.classList.remove('onboarding-highlight');
      }
    };
  }, []);

  // Scroll target into view when step changes
  useEffect(() => {
    if (!step || !isVisible) return;
    
    const target = document.getElementById(step.targetId);
    if (target) {
      const rect = target.getBoundingClientRect();
      const isInView = rect.top >= 80 && rect.bottom <= window.innerHeight - 100;
      
      if (!isInView) {
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [step, isVisible]);

  if (!step || !isVisible) return null;

  const arrowClasses = {
    top: '-top-2 left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-t-transparent border-b-card',
    bottom: '-bottom-2 left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent border-t-card',
    left: 'top-1/2 -left-2 -translate-y-1/2 border-t-transparent border-b-transparent border-l-transparent border-r-card',
    right: 'top-1/2 -right-2 -translate-y-1/2 border-t-transparent border-b-transparent border-r-transparent border-l-card',
  };

  const isFirstStep = currentStepIndex === 0;
  const showActionHint = step.action === 'click' || step.action === 'wait';

  return createPortal(
    <>
      {/* Backdrop - semi-transparent, allows scroll but blocks clicks on non-highlighted */}
      <div 
        className="fixed inset-0 bg-black/40 z-[9998] transition-opacity duration-300 pointer-events-none" 
      />
      
      {/* Tooltip */}
      <div
        ref={tooltipRef}
        className="fixed z-[10000] w-[300px] animate-in fade-in-0 slide-in-from-bottom-2 duration-300"
        style={{ 
          top: tooltipPosition.top, 
          left: tooltipPosition.left,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative bg-card rounded-xl shadow-2xl border-2 border-primary/30 p-4 max-h-[280px] overflow-y-auto">
          {/* Arrow */}
          <div 
            className={cn(
              'absolute w-0 h-0 border-[8px]',
              arrowClasses[arrowPosition]
            )}
          />
          
          {/* Skip button */}
          <button
            onClick={onSkip}
            className="absolute top-2 right-2 text-muted-foreground hover:text-foreground transition-colors p-1 rounded-full hover:bg-muted"
            aria-label="Skip tutorial"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Content */}
          <div className="pr-6">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                {currentStepIndex + 1}/{totalSteps}
              </span>
            </div>
            <h3 className="font-semibold text-sm text-foreground mb-1.5">
              {step.title}
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {step.description}
            </p>
            
            {/* Action hint */}
            {showActionHint && (
              <p className="text-xs text-primary mt-2 font-medium flex items-center gap-1">
                <span className="inline-block w-2 h-2 rounded-full bg-primary animate-pulse" />
                {step.action === 'click' 
                  ? 'Tap the highlighted area'
                  : 'Complete the action to continue'}
              </p>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
            {/* Progress dots */}
            <div className="flex gap-1">
              {Array.from({ length: totalSteps }).map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    'w-1.5 h-1.5 rounded-full transition-all duration-300',
                    i === currentStepIndex 
                      ? 'bg-primary w-3' 
                      : i < currentStepIndex 
                        ? 'bg-primary/50' 
                        : 'bg-muted'
                  )}
                />
              ))}
            </div>
            
            {/* Navigation buttons */}
            <div className="flex gap-1.5">
              {!isFirstStep && !isWaitingForAction && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onPrevious}
                  className="h-7 px-2 text-xs"
                >
                  <ArrowLeft className="h-3 w-3 mr-1" />
                  Back
                </Button>
              )}
              
              {!showActionHint && (
                <Button
                  size="sm"
                  onClick={isLastStep ? onFinish : onNext}
                  className="h-7 px-3 text-xs"
                >
                  {isLastStep ? (
                    <>
                      <Check className="h-3 w-3 mr-1" />
                      Done
                    </>
                  ) : (
                    <>
                      Next
                      <ArrowRight className="h-3 w-3 ml-1" />
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