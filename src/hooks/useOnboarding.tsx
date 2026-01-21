import { useState, useEffect, useCallback } from 'react';

const ONBOARDING_KEY = 'tips-plus-onboarding';

export type TabKey = 'calendar' | 'analytics' | 'finance' | 'goals';

interface OnboardingState {
  completedTabs: TabKey[];
  hasCompletedOnboarding: boolean;
}

const getInitialState = (): OnboardingState => {
  try {
    const stored = localStorage.getItem(ONBOARDING_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Migration: convert old format
      if ('hasSeenWelcome' in parsed) {
        return {
          completedTabs: parsed.completedTabs || [],
          hasCompletedOnboarding: parsed.hasSeenWelcome && parsed.completedTabs?.length >= 4,
        };
      }
      return parsed;
    }
  } catch (e) {
    console.error('Error reading onboarding state:', e);
  }
  return {
    completedTabs: [],
    hasCompletedOnboarding: false,
  };
};

export const useOnboarding = () => {
  const [state, setState] = useState<OnboardingState>(getInitialState);
  const [currentOnboardingTab, setCurrentOnboardingTab] = useState<TabKey | null>(null);
  const [isOnboardingActive, setIsOnboardingActive] = useState(false);

  // Start onboarding on mount if not completed
  useEffect(() => {
    if (!state.hasCompletedOnboarding) {
      setIsOnboardingActive(true);
      // Start with calendar tab onboarding
      if (!state.completedTabs.includes('calendar')) {
        setCurrentOnboardingTab('calendar');
      }
    }
  }, []);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(ONBOARDING_KEY, JSON.stringify(state));
    } catch (e) {
      console.error('Error saving onboarding state:', e);
    }
  }, [state]);

  const checkTabOnboarding = useCallback((tab: TabKey) => {
    // Only show tab onboarding if in onboarding mode and tab hasn't been completed
    if (isOnboardingActive && !state.completedTabs.includes(tab)) {
      setCurrentOnboardingTab(tab);
    }
  }, [isOnboardingActive, state.completedTabs]);

  const completeTabOnboarding = useCallback((tab: TabKey) => {
    const newCompletedTabs = [...state.completedTabs, tab];
    const allTabsComplete = newCompletedTabs.length >= 4;
    
    setState(prev => ({
      ...prev,
      completedTabs: newCompletedTabs,
      hasCompletedOnboarding: allTabsComplete,
    }));
    
    setCurrentOnboardingTab(null);
    
    if (allTabsComplete) {
      setIsOnboardingActive(false);
    }
  }, [state.completedTabs]);

  const skipAllOnboarding = useCallback(() => {
    setState({
      completedTabs: ['calendar', 'analytics', 'finance', 'goals'],
      hasCompletedOnboarding: true,
    });
    setCurrentOnboardingTab(null);
    setIsOnboardingActive(false);
  }, []);

  const resetOnboarding = useCallback(() => {
    setState({
      completedTabs: [],
      hasCompletedOnboarding: false,
    });
    setCurrentOnboardingTab('calendar');
    setIsOnboardingActive(true);
  }, []);

  const isTabOnboarded = useCallback((tab: TabKey) => {
    return state.completedTabs.includes(tab);
  }, [state.completedTabs]);

  return {
    isOnboardingActive,
    currentOnboardingTab,
    checkTabOnboarding,
    completeTabOnboarding,
    skipAllOnboarding,
    resetOnboarding,
    isTabOnboarded,
    hasCompletedOnboarding: state.hasCompletedOnboarding,
  };
};
