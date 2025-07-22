import { useEffect, useState } from 'react';
import { useOnboarding } from '@/hooks/useOnboarding';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { X, ArrowLeft, ArrowRight } from 'lucide-react';

export const OnboardingOverlay = () => {
  const { isActive, currentStep, steps, nextStep, previousStep, skipOnboarding } = useOnboarding();
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);
  const [overlayStyle, setOverlayStyle] = useState<React.CSSProperties>({});

  useEffect(() => {
    if (!isActive || steps.length === 0) return;

    const currentStepData = steps[currentStep];
    if (!currentStepData) return;

    const element = document.querySelector(`[data-onboarding="${currentStepData.target}"]`) as HTMLElement;
    if (element) {
      setTargetElement(element);
      
      const rect = element.getBoundingClientRect();
      const scrollX = window.pageXOffset || document.documentElement.scrollLeft;
      const scrollY = window.pageYOffset || document.documentElement.scrollTop;

      // Calculate tooltip position
      let top = rect.top + scrollY;
      let left = rect.left + scrollX;

      switch (currentStepData.position) {
        case 'bottom':
          top = rect.bottom + scrollY + 10;
          left = rect.left + scrollX + (rect.width / 2) - 150; // Center tooltip
          break;
        case 'top':
          top = rect.top + scrollY - 10;
          left = rect.left + scrollX + (rect.width / 2) - 150;
          break;
        case 'right':
          top = rect.top + scrollY + (rect.height / 2) - 50;
          left = rect.right + scrollX + 10;
          break;
        case 'left':
          top = rect.top + scrollY + (rect.height / 2) - 50;
          left = rect.left + scrollX - 310;
          break;
        default:
          top = rect.bottom + scrollY + 10;
          left = rect.left + scrollX;
      }

      setOverlayStyle({
        position: 'absolute',
        top: `${Math.max(10, top)}px`,
        left: `${Math.max(10, Math.min(window.innerWidth - 320, left))}px`,
        zIndex: 1000,
      });

      // Highlight the target element
      element.style.position = 'relative';
      element.style.zIndex = '999';
      element.style.boxShadow = '0 0 0 4px hsl(var(--primary) / 0.5), 0 0 0 2px hsl(var(--primary))';
      element.style.borderRadius = '8px';
    }

    return () => {
      // Clean up highlight
      if (element) {
        element.style.position = '';
        element.style.zIndex = '';
        element.style.boxShadow = '';
        element.style.borderRadius = '';
      }
    };
  }, [isActive, currentStep, steps]);

  if (!isActive || steps.length === 0) return null;

  const currentStepData = steps[currentStep];
  if (!currentStepData) return null;

  return (
    <>
      {/* Dark overlay */}
      <div className="fixed inset-0 bg-black/50 z-50" onClick={skipOnboarding} />
      
      {/* Tooltip */}
      <Card className="fixed w-80 z-50 shadow-xl" style={overlayStyle}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h3 className="font-semibold text-lg">{currentStepData.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {currentStepData.description}
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={skipOnboarding}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex space-x-1">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full ${
                    index === currentStep ? 'bg-primary' : 'bg-muted'
                  }`}
                />
              ))}
            </div>
            
            <div className="flex space-x-2">
              {currentStep > 0 && (
                <Button variant="outline" size="sm" onClick={previousStep}>
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Back
                </Button>
              )}
              <Button size="sm" onClick={nextStep}>
                {currentStep === steps.length - 1 ? 'Finish' : 'Next'}
                {currentStep < steps.length - 1 && <ArrowRight className="h-4 w-4 ml-1" />}
              </Button>
            </div>
          </div>
          
          <div className="text-xs text-muted-foreground mt-2 text-center">
            Step {currentStep + 1} of {steps.length}
          </div>
        </CardContent>
      </Card>
    </>
  );
};