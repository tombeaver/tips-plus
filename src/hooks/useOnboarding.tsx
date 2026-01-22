import { useState, useEffect, useCallback, useMemo } from 'react';

const ONBOARDING_KEY = 'tips-plus-onboarding-v2';

export type TabKey = 'calendar' | 'analytics' | 'finance' | 'goals';

export interface OnboardingStep {
  id: string;
  targetId: string;
  title: string;
  description: string;
  action?: 'click' | 'wait' | 'auto-advance';
  position?: 'top' | 'bottom' | 'left' | 'right';
}

interface OnboardingState {
  completedTabs: TabKey[];
  hasCompletedOnboarding: boolean;
}

const getInitialState = (): OnboardingState => {
  // For testing, always start fresh - remove this block for production
  localStorage.removeItem(ONBOARDING_KEY);
  return { completedTabs: [], hasCompletedOnboarding: false };
  
  // Production code (uncomment when testing is complete):
  // try {
  //   const stored = localStorage.getItem(ONBOARDING_KEY);
  //   if (stored) {
  //     return JSON.parse(stored);
  //   }
  // } catch (e) {
  //   console.error('Error reading onboarding state:', e);
  // }
  // return {
  //   completedTabs: [],
  //   hasCompletedOnboarding: false,
  // };
};

// Define steps for each tab
const calendarSteps: OnboardingStep[] = [
  {
    id: 'tab-navigation',
    targetId: 'tab-list',
    title: 'Your Dashboard',
    description: 'These are the four tools of this app: Calendar, Analytics, Finance, and Goals.',
    position: 'bottom',
  },
  {
    id: 'calendar-view',
    targetId: 'earnings-calendar',
    title: 'Earnings Calendar',
    description: 'This calendar tracks your shifts. Days you worked are highlighted in green - the brighter the green, the more you earned!',
    position: 'bottom',
  },
  {
    id: 'date-card',
    targetId: 'selected-date-card',
    title: 'Date Details',
    description: 'This card shows your shift details for the selected date. Let\'s log a shift!',
    position: 'top',
  },
  {
    id: 'add-entry-prompt',
    targetId: 'add-entry-button',
    title: 'Log Your Shift',
    description: 'Tap "Add Tip Entry" to record your earnings.',
    action: 'click',
    position: 'top',
  },
  {
    id: 'entry-form',
    targetId: 'tip-entry-save-button',
    title: 'Save Your Entry',
    description: 'We\'ve pre-filled an example shift. Scroll down if needed and tap Save to log it!',
    action: 'wait',
    position: 'top',
  },
  {
    id: 'entry-saved',
    targetId: 'selected-date-card',
    title: 'Shift Logged! 🎉',
    description: 'Your shift details are now saved! You can edit or delete entries anytime. Tap Finish to complete the Calendar tour.',
    position: 'top',
  },
];

const analyticsSteps: OnboardingStep[] = [
  {
    id: 'analytics-overview',
    targetId: 'analytics-period-selector',
    title: 'Time Periods',
    description: 'Switch between weekly, monthly, and yearly views to spot trends in your earnings.',
    position: 'bottom',
  },
  {
    id: 'analytics-charts',
    targetId: 'analytics-charts',
    title: 'Visual Insights',
    description: 'Charts show your earnings patterns. Identify your best days and peak periods.',
    position: 'top',
  },
  {
    id: 'analytics-metrics',
    targetId: 'analytics-insights',
    title: 'Performance Metrics',
    description: 'Tap any metric card to see detailed breakdowns and trends over time.',
    position: 'top',
  },
];

const financeSteps: OnboardingStep[] = [
  {
    id: 'budget-intro',
    targetId: 'financial-health-score',
    title: 'Set Your Budget',
    description: 'Enter your monthly expenses and savings goal to unlock financial insights.',
    position: 'bottom',
  },
  {
    id: 'budget-save',
    targetId: 'budget-save-button',
    title: 'Save Your Budget',
    description: 'Tap Save to set up your budget and see your Financial Health Score!',
    action: 'wait',
    position: 'top',
  },
  {
    id: 'health-score',
    targetId: 'financial-health-score',
    title: 'Financial Health Score',
    description: 'Your overall financial wellness on a 0-100 scale. Tap for a detailed breakdown and tips to improve.',
    position: 'bottom',
  },
  {
    id: 'shift-recommendations',
    targetId: 'shift-recommendations',
    title: 'Shift Calculator',
    description: 'See exactly how many shifts you need this month to cover your expenses and savings.',
    position: 'top',
  },
];

const goalsSteps: OnboardingStep[] = [
  {
    id: 'goals-intro',
    targetId: 'goals-progress',
    title: 'Set Your Annual Goal',
    description: 'Define your yearly income target and we\'ll break it into monthly and weekly milestones.',
    position: 'bottom',
  },
  {
    id: 'goals-save',
    targetId: 'goal-save-button',
    title: 'Save Your Goal',
    description: 'Enter your target and tap Save to start tracking your progress!',
    action: 'wait',
    position: 'top',
  },
  {
    id: 'goals-progress-view',
    targetId: 'goals-progress',
    title: 'Track Your Progress',
    description: 'Watch your progress toward yearly, monthly, and weekly targets in real time.',
    position: 'bottom',
  },
  {
    id: 'goals-strategy',
    targetId: 'goals-settings',
    title: 'Shift Strategy',
    description: 'See how many shifts you need to hit your targets based on your average earnings.',
    position: 'top',
  },
];

const stepsByTab: Record<TabKey, OnboardingStep[]> = {
  calendar: calendarSteps,
  analytics: analyticsSteps,
  finance: financeSteps,
  goals: goalsSteps,
};

export const useOnboarding = () => {
  const [state, setState] = useState<OnboardingState>(getInitialState);
  const [currentTab, setCurrentTab] = useState<TabKey | null>(() => {
    const initial = getInitialState();
    // Start on calendar tab if onboarding not completed and calendar not done
    if (!initial.hasCompletedOnboarding && !initial.completedTabs.includes('calendar')) {
      return 'calendar';
    }
    return null;
  });
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  // Initialize from persisted state - if completed, never show onboarding
  const [isOnboardingActive, setIsOnboardingActive] = useState(() => {
    const initial = getInitialState();
    return !initial.hasCompletedOnboarding;
  });
  const [waitingForAction, setWaitingForAction] = useState<string | null>(null);

  // Save state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(ONBOARDING_KEY, JSON.stringify(state));
    } catch (e) {
      console.error('Error saving onboarding state:', e);
    }
  }, [state]);

  const currentStep = useMemo(() => {
    if (!currentTab) return null;
    const steps = stepsByTab[currentTab];
    return steps[currentStepIndex] || null;
  }, [currentTab, currentStepIndex]);

  const totalSteps = useMemo(() => {
    if (!currentTab) return 0;
    return stepsByTab[currentTab].length;
  }, [currentTab]);

  const nextStep = useCallback(() => {
    if (!currentTab) return;
    
    const steps = stepsByTab[currentTab];
    if (currentStepIndex < steps.length - 1) {
      const nextStepData = steps[currentStepIndex + 1];
      setCurrentStepIndex(prev => prev + 1);
      
      // Set waiting state if next step requires action
      if (nextStepData.action === 'wait' || nextStepData.action === 'click') {
        setWaitingForAction(nextStepData.id);
      } else {
        setWaitingForAction(null);
      }
    }
  }, [currentTab, currentStepIndex]);

  const previousStep = useCallback(() => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
      setWaitingForAction(null);
    }
  }, [currentStepIndex]);

  const completeTabOnboarding = useCallback(() => {
    if (!currentTab) return;
    
    const newCompletedTabs = [...state.completedTabs, currentTab];
    const allTabsComplete = newCompletedTabs.length >= 4;
    
    setState(prev => ({
      ...prev,
      completedTabs: newCompletedTabs,
      hasCompletedOnboarding: allTabsComplete,
    }));
    
    setCurrentTab(null);
    setCurrentStepIndex(0);
    setWaitingForAction(null);
    
    if (allTabsComplete) {
      setIsOnboardingActive(false);
    }
  }, [currentTab, state.completedTabs]);

  const checkTabOnboarding = useCallback((tab: TabKey) => {
    if (isOnboardingActive && !state.completedTabs.includes(tab)) {
      setCurrentTab(tab);
      setCurrentStepIndex(0);
      setWaitingForAction(null);
    }
  }, [isOnboardingActive, state.completedTabs]);

  // Called when user completes an action (like saving a form)
  const actionCompleted = useCallback((actionId: string) => {
    if (waitingForAction === actionId) {
      setWaitingForAction(null);
      nextStep();
    }
  }, [waitingForAction, nextStep]);

  // Called when user clicks a highlighted element
  const handleTargetClick = useCallback((targetId: string) => {
    if (!currentStep) return;
    
    if (currentStep.action === 'click' && currentStep.targetId === targetId) {
      nextStep();
    }
  }, [currentStep, nextStep]);

  const skipAllOnboarding = useCallback(() => {
    setState({
      completedTabs: ['calendar', 'analytics', 'finance', 'goals'],
      hasCompletedOnboarding: true,
    });
    setCurrentTab(null);
    setCurrentStepIndex(0);
    setIsOnboardingActive(false);
    setWaitingForAction(null);
  }, []);

  const resetOnboarding = useCallback(() => {
    localStorage.removeItem(ONBOARDING_KEY);
    setState({
      completedTabs: [],
      hasCompletedOnboarding: false,
    });
    setCurrentTab('calendar');
    setCurrentStepIndex(0);
    setIsOnboardingActive(true);
    setWaitingForAction(null);
  }, []);

  const isTabOnboarded = useCallback((tab: TabKey) => {
    return state.completedTabs.includes(tab);
  }, [state.completedTabs]);

  return {
    isOnboardingActive,
    currentTab,
    currentStep,
    currentStepIndex,
    totalSteps,
    waitingForAction,
    nextStep,
    previousStep,
    checkTabOnboarding,
    completeTabOnboarding,
    actionCompleted,
    handleTargetClick,
    skipAllOnboarding,
    resetOnboarding,
    isTabOnboarded,
    hasCompletedOnboarding: state.hasCompletedOnboarding,
  };
};
