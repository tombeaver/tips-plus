import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface OnboardingStep {
  id: string;
  target: string;
  title: string;
  description: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

interface OnboardingContextType {
  isActive: boolean;
  currentStep: number;
  steps: OnboardingStep[];
  startOnboarding: (steps: OnboardingStep[]) => void;
  nextStep: () => void;
  previousStep: () => void;
  skipOnboarding: () => void;
  completeOnboarding: () => void;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within OnboardingProvider');
  }
  return context;
};

interface OnboardingProviderProps {
  children: ReactNode;
}

export const OnboardingProvider = ({ children }: OnboardingProviderProps) => {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState<OnboardingStep[]>([]);

  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem('tips-app-onboarding-completed');
    if (!hasSeenOnboarding) {
      // Will be triggered when user first loads the app
      setTimeout(() => {
        const welcomeSteps: OnboardingStep[] = [
          {
            id: 'welcome',
            target: 'app-header',
            title: 'Welcome to Tips+!',
            description: 'Let\'s take a quick tour to help you get started with tracking your tips and earnings.',
            position: 'bottom'
          }
        ];
        startOnboarding(welcomeSteps);
      }, 1000);
    }
  }, []);

  const startOnboarding = (newSteps: OnboardingStep[]) => {
    setSteps(newSteps);
    setCurrentStep(0);
    setIsActive(true);
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeOnboarding();
    }
  };

  const previousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const skipOnboarding = () => {
    localStorage.setItem('tips-app-onboarding-completed', 'true');
    setIsActive(false);
  };

  const completeOnboarding = () => {
    localStorage.setItem('tips-app-onboarding-completed', 'true');
    setIsActive(false);
  };

  const value = {
    isActive,
    currentStep,
    steps,
    startOnboarding,
    nextStep,
    previousStep,
    skipOnboarding,
    completeOnboarding,
  };

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
};