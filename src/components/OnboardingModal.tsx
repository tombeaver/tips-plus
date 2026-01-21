import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { 
  CalendarDays, 
  TrendingUp, 
  Wallet, 
  Target, 
  Sparkles,
  DollarSign,
  BarChart3,
  PiggyBank,
  ArrowRight
} from 'lucide-react';
import type { TabKey } from '@/hooks/useOnboarding';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  tab: TabKey | null;
}

interface TabOnboardingContent {
  icon: React.ReactNode;
  title: string;
  description: string;
  features: {
    icon: React.ReactNode;
    title: string;
    description: string;
  }[];
  buttonText: string;
}

const tabContent: Record<TabKey, TabOnboardingContent> = {
  calendar: {
    icon: <CalendarDays className="h-12 w-12 text-primary" />,
    title: "Your Earnings Calendar",
    description: "Track every shift and see your earnings at a glance",
    features: [
      {
        icon: <DollarSign className="h-5 w-5 text-green-600" />,
        title: "Log Your Tips",
        description: "Tap any date to add your tips, sales, and hours worked"
      },
      {
        icon: <CalendarDays className="h-5 w-5 text-primary" />,
        title: "Visual Overview",
        description: "Days with entries show your total earnings right on the calendar"
      },
      {
        icon: <BarChart3 className="h-5 w-5 text-blue-600" />,
        title: "Shift Details",
        description: "View complete breakdowns including tip percentage and hourly rate"
      }
    ],
    buttonText: "Start Tracking"
  },
  analytics: {
    icon: <TrendingUp className="h-12 w-12 text-primary" />,
    title: "Powerful Analytics",
    description: "Discover patterns and optimize your income",
    features: [
      {
        icon: <BarChart3 className="h-5 w-5 text-blue-600" />,
        title: "Earnings Trends",
        description: "See weekly, monthly, and yearly trends in your income"
      },
      {
        icon: <CalendarDays className="h-5 w-5 text-orange-600" />,
        title: "Best Days to Work",
        description: "Find out which days bring in the most tips"
      },
      {
        icon: <TrendingUp className="h-5 w-5 text-green-600" />,
        title: "Performance Insights",
        description: "Track averages and identify your top-performing shifts"
      }
    ],
    buttonText: "Explore Analytics"
  },
  finance: {
    icon: <Wallet className="h-12 w-12 text-primary" />,
    title: "Financial Strategy",
    description: "Take control of your money with smart planning tools",
    features: [
      {
        icon: <PiggyBank className="h-5 w-5 text-green-600" />,
        title: "Budget Planning",
        description: "Set monthly expenses and see how your income stacks up"
      },
      {
        icon: <Target className="h-5 w-5 text-purple-600" />,
        title: "Health Score",
        description: "Get a personalized financial health score with improvement tips"
      },
      {
        icon: <BarChart3 className="h-5 w-5 text-blue-600" />,
        title: "Shift Recommendations",
        description: "Know exactly how many shifts you need to hit your targets"
      }
    ],
    buttonText: "Plan Finances"
  },
  goals: {
    icon: <Target className="h-12 w-12 text-primary" />,
    title: "Goal Setting",
    description: "Set ambitious goals and track your progress",
    features: [
      {
        icon: <Target className="h-5 w-5 text-primary" />,
        title: "Income Targets",
        description: "Set daily, weekly, monthly, and yearly earning goals"
      },
      {
        icon: <TrendingUp className="h-5 w-5 text-green-600" />,
        title: "Progress Tracking",
        description: "Visual progress bars show how close you are to each goal"
      },
      {
        icon: <Sparkles className="h-5 w-5 text-amber-500" />,
        title: "Achievements",
        description: "Unlock badges and celebrate milestones along the way"
      }
    ],
    buttonText: "Set Goals"
  }
};

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onClose,
  tab
}) => {
  if (!tab) return null;
  
  const content = tabContent[tab];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-center pb-2">
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
              {content.icon}
            </div>
          </div>
          <DialogTitle className="text-xl font-bold">{content.title}</DialogTitle>
          <DialogDescription className="text-base">
            {content.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {content.features.map((feature, index) => (
            <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
              <div className="w-10 h-10 rounded-full bg-background flex items-center justify-center shrink-0 shadow-sm">
                {feature.icon}
              </div>
              <div>
                <h4 className="font-semibold text-sm">{feature.title}</h4>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>

        <Button onClick={onClose} className="w-full" size="lg">
          {content.buttonText}
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </DialogContent>
    </Dialog>
  );
};
