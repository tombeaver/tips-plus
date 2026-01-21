import { useState, useEffect, useCallback } from 'react';

const ONBOARDING_KEY = 'tips-plus-onboarding';

export type TabKey = 'calendar' | 'analytics' | 'finance' | 'goals';

interface OnboardingState {
  completedTabs: TabKey[];
  hasSeenWelcome: boolean;
}

const getInitialState = (): OnboardingState => {
  try {
    const stored = localStorage.getItem(ONBOARDING_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Error reading onboarding state:', e);
  }
  return {
    completedTabs: [],
    hasSeenWelcome: false,
  };
};

export const useOnboarding = () => {
  const [state, setState] = useState<OnboardingState>(getInitialState);
  const [currentOnboardingTab, setCurrentOnboardingTab] = useState<TabKey | null>(null);
  const [showWelcome, setShowWelcome] = useState(false);

  // Check if we need to show welcome on mount
  useEffect(() => {
    if (!state.hasSeenWelcome) {
      setShowWelcome(true);
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

  const completeWelcome = useCallback(() => {
    setState(prev => ({ ...prev, hasSeenWelcome: true }));
    setShowWelcome(false);
    // After welcome, trigger calendar onboarding
    setCurrentOnboardingTab('calendar');
  }, []);

  const checkTabOnboarding = useCallback((tab: TabKey) => {
    // Only show tab onboarding if welcome is complete and tab hasn't been onboarded
    if (state.hasSeenWelcome && !state.completedTabs.includes(tab)) {
      setCurrentOnboardingTab(tab);
    }
  }, [state.hasSeenWelcome, state.completedTabs]);

  const completeTabOnboarding = useCallback((tab: TabKey) => {
    setState(prev => ({
      ...prev,
      completedTabs: [...prev.completedTabs, tab],
    }));
    setCurrentOnboardingTab(null);
  }, []);

  const resetOnboarding = useCallback(() => {
    setState({
      completedTabs: [],
      hasSeenWelcome: false,
    });
    setShowWelcome(true);
    setCurrentOnboardingTab(null);
  }, []);

  const isTabOnboarded = useCallback((tab: TabKey) => {
    return state.completedTabs.includes(tab);
  }, [state.completedTabs]);

  return {
    showWelcome,
    currentOnboardingTab,
    completeWelcome,
    checkTabOnboarding,
    completeTabOnboarding,
    resetOnboarding,
    isTabOnboarded,
    hasSeenWelcome: state.hasSeenWelcome,
  };
};
