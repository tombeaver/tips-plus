import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, ArrowRight, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface TooltipStep {
  targetId: string;
  title: string;
  description: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

interface OnboardingTooltipProps {
  steps: TooltipStep[];
  isActive: boolean;
  onComplete: () => void;
  onSkip: () => void;
}

export const OnboardingTooltip: React.FC<OnboardingTooltipProps> = ({
  steps,
  isActive,
  onComplete,
  onSkip,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const [arrowPosition, setArrowPosition] = useState<'top' | 'bottom' | 'left' | 'right'>('bottom');
  const tooltipRef = useRef<HTMLDivElement>(null);

  const step = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;
  const isFirstStep = currentStep === 0;

  useEffect(() => {
    if (!isActive || !step) return;

    const updatePosition = () => {
      const target = document.getElementById(step.targetId);
      if (!target) {
        // If target doesn't exist, skip to next step or complete
        if (currentStep < steps.length - 1) {
          setCurrentStep(prev => prev + 1);
        } else {
          onComplete();
        }
        return;
      }

      const rect = target.getBoundingClientRect();
      const tooltipWidth = 280;
      const tooltipHeight = 160;
      const padding = 12;
      const arrowSize = 8;

      // Scroll target into view if needed
      if (rect.top < 100 || rect.bottom > window.innerHeight - 100) {
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setTimeout(updatePosition, 300);
        return;
      }

      let top = 0;
      let left = 0;
      let arrow: 'top' | 'bottom' | 'left' | 'right' = step.position || 'bottom';

      // Calculate best position
      const spaceAbove = rect.top;
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceLeft = rect.left;
      const spaceRight = window.innerWidth - rect.right;

      if (!step.position) {
        // Auto-determine best position
        if (spaceBelow >= tooltipHeight + padding) {
          arrow = 'top';
        } else if (spaceAbove >= tooltipHeight + padding) {
          arrow = 'bottom';
        } else if (spaceRight >= tooltipWidth + padding) {
          arrow = 'left';
        } else {
          arrow = 'right';
        }
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
        case 'left': // Tooltip to right of target
          top = rect.top + rect.height / 2 - tooltipHeight / 2;
          left = rect.right + padding + arrowSize;
          break;
        case 'right': // Tooltip to left of target
          top = rect.top + rect.height / 2 - tooltipHeight / 2;
          left = rect.left - tooltipWidth - padding - arrowSize;
          break;
      }

      // Keep within viewport
      left = Math.max(padding, Math.min(left, window.innerWidth - tooltipWidth - padding));
      top = Math.max(padding, Math.min(top, window.innerHeight - tooltipHeight - padding));

      setTooltipPosition({ top, left });
      setArrowPosition(arrow);

      // Highlight target
      target.classList.add('onboarding-highlight');
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition);

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition);
      // Remove highlight from all targets
      steps.forEach(s => {
        const el = document.getElementById(s.targetId);
        el?.classList.remove('onboarding-highlight');
      });
    };
  }, [isActive, step, currentStep, steps]);

  // Remove highlight when changing steps
  useEffect(() => {
    steps.forEach((s, i) => {
      const el = document.getElementById(s.targetId);
      if (i === currentStep) {
        el?.classList.add('onboarding-highlight');
      } else {
        el?.classList.remove('onboarding-highlight');
      }
    });
  }, [currentStep, steps]);

  const handleNext = () => {
    if (isLastStep) {
      onComplete();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (!isFirstStep) {
      setCurrentStep(prev => prev - 1);
    }
  };

  if (!isActive || !step) return null;

  const arrowClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-t-transparent border-b-card',
    bottom: 'top-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent border-t-card',
    left: 'right-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-l-transparent border-r-card',
    right: 'left-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-r-transparent border-l-card',
  };

  return createPortal(
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-[9998]" 
        onClick={onSkip}
        style={{ pointerEvents: 'auto' }}
      />
      
      {/* Tooltip */}
      <div
        ref={tooltipRef}
        className="fixed z-[9999] w-[280px] animate-in fade-in-0 zoom-in-95 duration-200"
        style={{ 
          top: tooltipPosition.top, 
          left: tooltipPosition.left,
          pointerEvents: 'auto'
        }}
      >
        <div className="relative bg-card rounded-lg shadow-xl border p-4">
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
            className="absolute top-2 right-2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Skip onboarding"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Content */}
          <div className="pr-6">
            <h3 className="font-semibold text-sm text-foreground mb-1">
              {step.title}
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {step.description}
            </p>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
            <div className="flex gap-1">
              {steps.map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    'w-1.5 h-1.5 rounded-full transition-colors',
                    i === currentStep ? 'bg-primary' : 'bg-muted'
                  )}
                />
              ))}
            </div>
            
            <div className="flex gap-2">
              {!isFirstStep && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handlePrevious}
                  className="h-7 px-2 text-xs"
                >
                  <ArrowLeft className="h-3 w-3" />
                </Button>
              )}
              <Button
                size="sm"
                onClick={handleNext}
                className="h-7 px-3 text-xs"
              >
                {isLastStep ? 'Done' : 'Next'}
                {!isLastStep && <ArrowRight className="h-3 w-3 ml-1" />}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
};
