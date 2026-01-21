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
  Sparkles,
  CalendarDays,
  TrendingUp,
  Wallet,
  Target,
  ArrowRight
} from 'lucide-react';

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WelcomeModal: React.FC<WelcomeModalProps> = ({ isOpen, onClose }) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-center pb-2">
          <div className="flex justify-center mb-4">
            <div className="w-24 h-24 bg-gradient-to-br from-primary to-primary/60 rounded-full flex items-center justify-center shadow-lg">
              <Sparkles className="h-12 w-12 text-primary-foreground" />
            </div>
          </div>
          <DialogTitle className="text-2xl font-bold">Welcome to Tips+</DialogTitle>
          <DialogDescription className="text-base">
            Your personal income tracking companion for service industry professionals
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-4">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <CalendarDays className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h4 className="font-semibold text-sm">Track Every Shift</h4>
              <p className="text-xs text-muted-foreground">Log tips, sales, and hours in seconds</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
              <TrendingUp className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h4 className="font-semibold text-sm">Analyze Patterns</h4>
              <p className="text-xs text-muted-foreground">Discover your best days and shifts</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center shrink-0">
              <Wallet className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h4 className="font-semibold text-sm">Plan Your Finances</h4>
              <p className="text-xs text-muted-foreground">Budget smarter with real data</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center shrink-0">
              <Target className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <h4 className="font-semibold text-sm">Achieve Your Goals</h4>
              <p className="text-xs text-muted-foreground">Set targets and track your progress</p>
            </div>
          </div>
        </div>

        <Button onClick={onClose} className="w-full" size="lg">
          Get Started
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>

        <p className="text-xs text-center text-muted-foreground pt-2">
          We'll guide you through each section as you explore
        </p>
      </DialogContent>
    </Dialog>
  );
};
