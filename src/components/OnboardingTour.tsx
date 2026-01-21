import React from 'react';
import { OnboardingTooltip } from './OnboardingTooltip';
import type { OnboardingStep } from '@/hooks/useOnboarding';

interface OnboardingTourProps {
  step: OnboardingStep | null;
  currentStepIndex: number;
  totalSteps: number;
  isWaitingForAction: boolean;
  onNext: () => void;
  onPrevious: () => void;
  onSkip: () => void;
  onFinish: () => void;
  onTargetClick: (targetId: string) => void;
}

export const OnboardingTour: React.FC<OnboardingTourProps> = ({
  step,
  currentStepIndex,
  totalSteps,
  isWaitingForAction,
  onNext,
  onPrevious,
  onSkip,
  onFinish,
  onTargetClick,
}) => {
  if (!step) return null;

  const isLastStep = currentStepIndex === totalSteps - 1;

  return (
    <OnboardingTooltip
      step={step}
      currentStepIndex={currentStepIndex}
      totalSteps={totalSteps}
      isLastStep={isLastStep}
      isWaitingForAction={isWaitingForAction}
      onNext={onNext}
      onPrevious={onPrevious}
      onSkip={onSkip}
      onFinish={onFinish}
      onTargetClick={onTargetClick}
    />
  );
};
