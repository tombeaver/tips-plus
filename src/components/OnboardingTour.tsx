import React from 'react';
import { OnboardingTooltip } from './OnboardingTooltip';
import type { TabKey } from '@/hooks/useOnboarding';

interface OnboardingTourProps {
  activeTab: TabKey | null;
  onComplete: () => void;
  onSkip: () => void;
}

interface TooltipStep {
  targetId: string;
  title: string;
  description: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

const tourSteps: Record<TabKey, TooltipStep[]> = {
  calendar: [
    {
      targetId: 'earnings-calendar',
      title: 'Your Earnings Calendar',
      description: 'Days you worked are highlighted with your total earnings. Green means you made money that day!',
      position: 'bottom',
    },
    {
      targetId: 'add-entry-button',
      title: 'Log Your Shift',
      description: 'Tap this button to add a new entry. Record your tips, sales, and hours worked for any day.',
      position: 'top',
    },
    {
      targetId: 'selected-date-card',
      title: 'Shift Details',
      description: 'After selecting a date, you\'ll see the full breakdown of your earnings including tips, hourly pay, and sales.',
      position: 'top',
    },
  ],
  analytics: [
    {
      targetId: 'analytics-period-selector',
      title: 'Time Period',
      description: 'Switch between weekly, monthly, and yearly views to spot trends in your earnings.',
      position: 'bottom',
    },
    {
      targetId: 'analytics-charts',
      title: 'Visual Insights',
      description: 'Charts show your earnings patterns over time. Look for your best days and peak earning periods.',
      position: 'top',
    },
    {
      targetId: 'analytics-insights',
      title: 'Performance Insights',
      description: 'Personalized insights help you understand what drives your best shifts.',
      position: 'top',
    },
  ],
  finance: [
    {
      targetId: 'financial-health-score',
      title: 'Financial Health Score',
      description: 'Your overall financial wellness on a 0-100 scale. Tap for a detailed breakdown and tips to improve.',
      position: 'bottom',
    },
    {
      targetId: 'shift-recommendations',
      title: 'Shift Calculator',
      description: 'See exactly how many more shifts you need this month to hit your income goals.',
      position: 'top',
    },
    {
      targetId: 'finance-tips',
      title: 'Smart Tips',
      description: 'Personalized recommendations based on your spending and earning patterns.',
      position: 'top',
    },
  ],
  goals: [
    {
      targetId: 'goals-progress',
      title: 'Goal Progress',
      description: 'Track your annual income goal. This gets broken down into weekly and monthly targets automatically!',
      position: 'bottom',
    },
    {
      targetId: 'goals-settings',
      title: 'Shift Strategy',
      description: 'See exactly how many shifts you need to hit your weekly and monthly targets based on your average earnings.',
      position: 'top',
    },
  ],
};

export const OnboardingTour: React.FC<OnboardingTourProps> = ({
  activeTab,
  onComplete,
  onSkip,
}) => {
  if (!activeTab) return null;

  const steps = tourSteps[activeTab];
  if (!steps) return null;

  return (
    <OnboardingTooltip
      steps={steps}
      isActive={true}
      onComplete={onComplete}
      onSkip={onSkip}
    />
  );
};
