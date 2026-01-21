import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TipEntryForm } from '@/components/TipEntryForm';
import { AnalyticsDashboard } from '@/components/AnalyticsDashboard';
import { GoalSettings } from '@/components/GoalSettings';
import { ConfirmationModal } from '@/components/ConfirmationModal';
import { FinanceStrategy } from '@/components/FinanceStrategy';

import { FeedbackModal } from '@/components/FeedbackModal';
import { EarningsCalendar } from '@/components/EarningsCalendar';
import { PrivacyPolicy } from '@/components/PrivacyPolicy';
import { AchievementsGallery } from '@/components/AchievementsGallery';
import { AchievementsModal } from '@/components/AchievementsModal';
import { ProfileModal } from '@/components/ProfileModal';
import { AchievementUnlockModal } from '@/components/AchievementUnlockModal';
import { YearInReviewModal, shouldShowYearInReview, markYearInReviewShown, getReviewYear } from '@/components/YearInReviewModal';
import { useDemoData } from '@/hooks/useDemoData';
import { OnboardingTour } from '@/components/OnboardingTour';
import { useOnboarding, type TabKey } from '@/hooks/useOnboarding';
import { CalendarDays, TrendingUp, Target, Plus, Wallet, LogOut, MessageCircle, Frown, Meh, Smile, Laugh, Zap, DollarSign, CreditCard, Clock, Receipt, Users, Trophy, User as UserIcon } from 'lucide-react';
import { format, isToday, isSameDay } from 'date-fns';
import { useTipEntries, type TipEntry } from '@/hooks/useTipEntries';
import { useGoals, type Goal } from '@/hooks/useGoals';
import { useAchievements } from '@/hooks/useAchievements';
import { User, Session } from '@supabase/supabase-js';

// Data is now handled by Supabase hooks

// Create default numbered sections (1-20)
const createDefaultSections = () => {
  const sections: { [key: string]: string } = {};
  for (let i = 1; i <= 20; i++) {
    sections[`section-${i}`] = `Section ${i}`;
  }
  return sections;
};

const Index = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  const [isSticky, setIsSticky] = useState(false);
  const tabsRef = React.useRef<HTMLDivElement>(null);
  const stickyTriggerRef = React.useRef<HTMLDivElement>(null);
  
  const { tipEntries: realTipEntries, loading: tipEntriesLoading, addTipEntry, updateTipEntry, deleteTipEntry } = useTipEntries();
  const { goals: realGoals, financialData: realFinancialData, loading: goalsLoading, addGoal, updateGoal, deleteGoal, updateFinancialData } = useGoals();
  const {
    isOnboardingActive,
    currentTab: currentOnboardingTab,
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
  } = useOnboarding();
  const { demoEntries, demoGoals, demoFinancialData, getDemoFormEntry } = useDemoData();
  const [onboardingDemoEntry, setOnboardingDemoEntry] = useState<TipEntry | null>(null);
  
  // Clear demo entry when onboarding ends
  useEffect(() => {
    if (!isOnboardingActive) {
      setOnboardingDemoEntry(null);
    }
  }, [isOnboardingActive]);
  
  // Use demo data only during the active onboarding for that specific tab
  // Once a tab's onboarding is complete, show real data for that section
  const isCalendarOnboarding = isOnboardingActive && currentOnboardingTab === 'calendar';
  const isGoalsOnboarding = isOnboardingActive && currentOnboardingTab === 'goals';
  const isFinanceOnboarding = isOnboardingActive && currentOnboardingTab === 'finance';
  
  // Show demo entry during calendar onboarding if saved
  const showOnboardingSavedEntry = isCalendarOnboarding && onboardingDemoEntry;
  const tipEntries = isCalendarOnboarding ? (showOnboardingSavedEntry ? [...demoEntries, onboardingDemoEntry] : demoEntries) : realTipEntries;
  const goals = isGoalsOnboarding ? demoGoals : realGoals;
  const financialData = isFinanceOnboarding ? demoFinancialData : realFinancialData;
  
  const { achievements, loading: achievementsLoading } = useAchievements(tipEntries, goals, financialData);
  const [showEntryForm, setShowEntryForm] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>("calendar");
  const [sections, setSections] = useState<{ [key: string]: string }>(createDefaultSections());
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showAchievementUnlock, setShowAchievementUnlock] = useState(false);
  const [showYearInReview, setShowYearInReview] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState<string>('');

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        
        // Redirect unauthenticated users to auth page
        if (!session?.user) {
          navigate('/auth');
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      
      if (!session?.user) {
        navigate('/auth');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  // Achievement unlock modal can be triggered here when real achievements are unlocked
  // For now, the trigger is disabled until connected to the achievement system

  // Year in Review modal - show during review period with 24h cooldown after close
  useEffect(() => {
    if (tipEntriesLoading) return;
    if (activeTab !== 'calendar') return;
    if (!shouldShowYearInReview()) return;

    const timer = setTimeout(() => {
      setShowYearInReview(true);
    }, 500);

    return () => clearTimeout(timer);
  }, [tipEntriesLoading, activeTab]);
  useEffect(() => {
    const handleScroll = () => {
      if (stickyTriggerRef.current) {
        const rect = stickyTriggerRef.current.getBoundingClientRect();
        setIsSticky(rect.top <= 0);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };

  const handleAddTipEntry = async (entry: Omit<TipEntry, 'id'>) => {
    try {
      await addTipEntry(entry);
      setShowEntryForm(false);
    } catch (error) {
      // Error is handled in the hook
    }
  };

  const handleUpdateTipEntry = async (id: string, updates: Partial<TipEntry>) => {
    try {
      await updateTipEntry(id, updates);
      setShowEntryForm(false);
    } catch (error) {
      // Error is handled in the hook
    }
  };

  const handleDeleteTipEntry = async (id: string) => {
    try {
      await deleteTipEntry(id);
      setShowDeleteConfirm(false);
      setEntryToDelete('');
    } catch (error) {
      // Error is handled in the hook
    }
  };

  const getEntryForDate = (date: Date) => {
    return tipEntries.find(entry => isSameDay(entry.date, date));
  };

  const hasEntryForDate = (date: Date) => {
    return tipEntries.some(entry => isSameDay(entry.date, date));
  };


  const getTotalTips = (entry: TipEntry) => {
    return entry.creditTips + entry.cashTips;
  };

  const getTipPercentage = (entry: TipEntry) => {
    return entry.totalSales > 0 ? (getTotalTips(entry) / entry.totalSales) * 100 : 0;
  };

  const getTotalEarnings = (entry: TipEntry) => {
    return getTotalTips(entry) + (entry.hoursWorked * entry.hourlyRate);
  };

  const getMostRecentEntry = () => {
    return tipEntries
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
  };

  const selectedEntry = getEntryForDate(selectedDate);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to auth
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-md mx-auto space-section">
        {/* Header */}
        <div className="py-6" style={{ paddingTop: 'max(4.5rem, calc(env(safe-area-inset-top) + 2rem))' }}>
          <div className="grid grid-cols-[auto_1fr_auto] items-center">
            <div className="justify-self-start">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSignOutConfirm(true)}
                className="text-muted-foreground hover:text-foreground"
                aria-label="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
            <h1 className="heading-lg text-foreground text-center">Tips+</h1>
            <div className="justify-self-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowProfile(true)}
                className="text-muted-foreground hover:text-foreground"
                aria-label="View profile"
              >
                <UserIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <p className="body-md text-muted-foreground text-center">Track. Analyze. Level Up Your Income.</p>
        </div>

        {/* Sticky trigger point - stays in place to detect scroll position */}
        <div ref={stickyTriggerRef} />
        
        {/* Main Navigation */}
        <Tabs value={activeTab} onValueChange={(value) => {
          const tab = value as TabKey;
          setActiveTab(tab);
          checkTabOnboarding(tab);
        }} className="w-full">
          <div 
            ref={tabsRef}
            className={`sticky z-50 transition-all duration-200 ${isSticky ? 'shadow-lg' : ''}`}
            style={isSticky ? { 
              top: 0,
              left: 0,
              right: 0,
              position: 'fixed',
              paddingTop: 'max(0.5rem, env(safe-area-inset-top))',
              paddingBottom: '0.5rem',
              paddingLeft: 'max(1rem, env(safe-area-inset-left))',
              paddingRight: 'max(1rem, env(safe-area-inset-right))',
              background: 'hsl(var(--background) / 0.97)',
              backdropFilter: 'blur(8px)'
            } : {
              top: 0
            }}
          >
            <TabsList id="tab-list" className={`grid w-full grid-cols-4 shadow-sm transition-all duration-200 ${
              isSticky 
                ? 'bg-background/80 border-0 rounded-lg max-w-md mx-auto' 
                : 'bg-card/50 border rounded-lg backdrop-blur-sm'
            }`}>
            <TabsTrigger value="calendar" className="flex items-center gap-1 transition-all duration-200 data-[state=active]:bg-primary/10 data-[state=active]:text-primary hover:bg-muted/50">
              <CalendarDays className="h-4 w-4" />
              <span className="hidden sm:inline">Calendar</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-1 transition-all duration-200 data-[state=active]:bg-primary/10 data-[state=active]:text-primary hover:bg-muted/50">
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="finance" className="flex items-center gap-1 transition-all duration-200 data-[state=active]:bg-primary/10 data-[state=active]:text-primary hover:bg-muted/50">
              <Wallet className="h-4 w-4" />
              <span className="hidden sm:inline">Finance</span>
            </TabsTrigger>
            <TabsTrigger value="goals" className="flex items-center gap-1 transition-all duration-200 data-[state=active]:bg-primary/10 data-[state=active]:text-primary hover:bg-muted/50">
              <Target className="h-4 w-4" />
              <span className="hidden sm:inline">Goals</span>
            </TabsTrigger>
          </TabsList>
          </div>
          
          {/* Spacer to prevent content jump when nav becomes fixed */}
          {isSticky && (
            <div style={{ height: 'calc(3rem + max(0.5rem, env(safe-area-inset-top)) + 0.5rem)' }} />
          )}

          {/* Calendar Tab */}
          <TabsContent value="calendar" className="space-group">
            <Card id="earnings-calendar" className="card-interactive">
              <CardContent className="pt-6">
                <EarningsCalendar
                  selected={selectedDate}
                  onSelect={(date) => {
                    if (date) {
                      // Create a new date with local time to avoid timezone issues
                      const localDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
                      setSelectedDate(localDate);
                      console.log('Selected date from calendar:', date, 'Converted to local:', localDate);
                    }
                  }}
                  tipEntries={tipEntries}
                  getTotalEarnings={getTotalEarnings}
                  getEntryForDate={getEntryForDate}
                  className="rounded-md border pointer-events-auto flex justify-center"
                />
              </CardContent>
            </Card>


            {/* Selected Date Info */}
            <Card id="selected-date-card" className="card-interactive">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="heading-xs">
                      {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                    </CardTitle>
                    <CardDescription className="body-md">
                      {selectedEntry ? 'Your shift details' : 'No entry for this date'}
                    </CardDescription>
                  </div>
                  {selectedEntry?.moodRating && (
                    <div className="flex items-center gap-1">
                      {(() => {
                        const icons = [Frown, Meh, Smile, Laugh, Zap];
                        const colors = ['text-red-500', 'text-orange-500', 'text-yellow-500', 'text-green-500', 'text-purple-500'];
                        const IconComponent = icons[selectedEntry.moodRating - 1];
                        return <IconComponent className={`h-5 w-5 ${colors[selectedEntry.moodRating - 1]}`} />;
                      })()}
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {selectedEntry ? (
                  <div className="space-y-6">
                    <div className="mb-4">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-green-600 mb-1">
                          ${getTotalEarnings(selectedEntry).toFixed(2)}
                        </div>
                        <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            {selectedEntry.shift}
                          </span>
                          <span className="flex items-center gap-1">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            {selectedEntry.hoursWorked}h worked
                          </span>
                          <span className="flex items-center gap-1">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            ${selectedEntry.hoursWorked > 0 ? (getTotalEarnings(selectedEntry) / selectedEntry.hoursWorked).toFixed(2) : '0.00'}/hr
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Income Breakdown - Compact List */}
                    <div className="space-y-2">
                      {/* Sales Row */}
                      <div className="flex items-center justify-between py-3 border-b border-border/50">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                            <Receipt className="w-4 h-4 text-orange-600" />
                          </div>
                          <span className="text-muted-foreground">Total Sales</span>
                        </div>
                        <span className="text-lg font-semibold text-orange-600">${selectedEntry.totalSales}</span>
                      </div>

                      {selectedEntry.alcoholSales > 0 && (
                        <div className="flex items-center justify-between py-3 border-b border-border/50">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-rose-100 rounded-full flex items-center justify-center">
                              <Receipt className="w-4 h-4 text-rose-600" />
                            </div>
                            <span className="text-muted-foreground">Alcohol Sales</span>
                          </div>
                          <span className="text-lg font-semibold text-rose-600">${selectedEntry.alcoholSales}</span>
                        </div>
                      )}

                      {/* Tips Row */}
                      <div className="flex items-center justify-between py-3 border-b border-border/50">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                            <DollarSign className="w-4 h-4 text-green-600" />
                          </div>
                          <span className="text-muted-foreground">Cash Tips</span>
                        </div>
                        <span className="text-lg font-semibold text-green-600">${selectedEntry.cashTips}</span>
                      </div>

                      <div className="flex items-center justify-between py-3 border-b border-border/50">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                            <CreditCard className="w-4 h-4 text-green-600" />
                          </div>
                          <span className="text-muted-foreground">Credit Tips</span>
                        </div>
                        <span className="text-lg font-semibold text-green-600">${selectedEntry.creditTips}</span>
                      </div>

                      {/* Details Row */}
                      <div className="flex items-center justify-between py-3 border-b border-border/50">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <Receipt className="w-4 h-4 text-blue-600" />
                          </div>
                          <span className="text-muted-foreground">Section</span>
                        </div>
                        <span className="text-lg font-semibold text-blue-600">{selectedEntry.section}</span>
                      </div>

                      <div className="flex items-center justify-between py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                            <Users className="w-4 h-4 text-amber-600" />
                          </div>
                          <span className="text-muted-foreground">Guests</span>
                        </div>
                        <span className="text-lg font-semibold text-amber-600">{selectedEntry.guestCount}</span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 pt-2">
                      <Button 
                        variant="outline" 
                        className="interactive-rise"
                        onClick={() => setShowEntryForm(true)}
                      >
                        Edit Entry
                      </Button>
                      <Button 
                        variant="destructive"
                        className="interactive-rise"
                        onClick={() => {
                          setEntryToDelete(selectedEntry.id);
                          setShowDeleteConfirm(true);
                        }}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button 
                    id="add-entry-button"
                    className="w-full interactive-glow" 
                    size="lg"
                    onClick={() => {
                      // During onboarding, advance to entry form step
                      if (isOnboardingActive && currentOnboardingTab === 'calendar') {
                        handleTargetClick('add-entry-button');
                      }
                      setShowEntryForm(true);
                    }}
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    Add Tip Entry
                  </Button>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <AnalyticsDashboard tipEntries={tipEntries} />
          </TabsContent>

          {/* Finance Strategy Tab */}
          <TabsContent value="finance">
            <FinanceStrategy 
              financialData={financialData}
              onUpdateFinancialData={updateFinancialData}
              tipEntries={tipEntries}
              hasGoalSet={goals.some(g => g.type === 'yearly')}
              onNavigateToGoal={() => setActiveTab('goals')}
            />
          </TabsContent>

          {/* Goals Tab */}
          <TabsContent value="goals">
            <GoalSettings 
              goals={goals}
              financialData={financialData}
              onAddGoal={async (goal) => { await addGoal(goal); }}
              onUpdateGoal={async (goalId, goal) => { await updateGoal(goalId, goal); }}
              onDeleteGoal={deleteGoal}
              tipEntries={tipEntries}
              onNavigateToBudget={() => setActiveTab('finance')}
            />
          </TabsContent>
        </Tabs>

        {/* Tip Entry Modal/Form */}
        {showEntryForm && (
          <TipEntryForm
            selectedDate={selectedDate}
            existingEntry={selectedEntry}
            previousEntry={getMostRecentEntry()}
            sections={sections}
            // During onboarding, pre-fill with demo data
            prefillData={isOnboardingActive && currentOnboardingTab === 'calendar' && !selectedEntry ? getDemoFormEntry(selectedDate) : undefined}
            onSave={(entry) => {
              // During onboarding, simulate saving by creating a demo entry
              if (isOnboardingActive && currentOnboardingTab === 'calendar') {
                const demoEntry: TipEntry = {
                  ...entry,
                  id: 'onboarding-demo-entry',
                };
                setOnboardingDemoEntry(demoEntry);
                setShowEntryForm(false);
                // Advance to the final step showing the saved entry
                actionCompleted('entry-form');
              } else if (selectedEntry) {
                handleUpdateTipEntry(selectedEntry.id, entry);
              } else {
                handleAddTipEntry(entry);
              }
            }}
            onCancel={() => setShowEntryForm(false)}
            onDelete={selectedEntry ? 
              () => {
                handleDeleteTipEntry(selectedEntry.id);
                setShowEntryForm(false);
              } : 
              undefined
            }
            onUpdateSections={setSections}
          />
        )}

        <ConfirmationModal
          isOpen={showDeleteConfirm}
          onClose={() => {
            setShowDeleteConfirm(false);
            setEntryToDelete('');
          }}
          onConfirm={() => {
            handleDeleteTipEntry(entryToDelete);
          }}
          title="Delete Tip Entry"
          description={selectedEntry ? 
            `Are you sure you want to delete the tip entry for ${format(selectedEntry.date, 'MMMM d, yyyy')}? This action cannot be undone.` :
            "Are you sure you want to delete this tip entry? This action cannot be undone."
          }
          confirmText="Delete Entry"
        />

        <ConfirmationModal
          isOpen={showSignOutConfirm}
          onClose={() => setShowSignOutConfirm(false)}
          onConfirm={() => {
            setShowSignOutConfirm(false);
            handleSignOut();
          }}
          title="Sign Out"
          description="Are you sure you want to sign out? You'll need to log in again to access your tip data."
          confirmText="Sign Out"
        />

        {/* Footer Links */}
        <div className="text-center py-4 flex items-center justify-center gap-4">
          <button
            onClick={() => setShowPrivacyPolicy(true)}
            className="text-sm text-muted-foreground hover:text-foreground underline"
          >
            Privacy Policy
          </button>
          <span className="text-muted-foreground">•</span>
          <button
            onClick={() => setShowFeedbackModal(true)}
            className="text-sm text-muted-foreground hover:text-foreground underline"
          >
            Feedback
          </button>
        </div>

        {/* Privacy Policy Modal */}
        <PrivacyPolicy 
          isOpen={showPrivacyPolicy} 
          onClose={() => setShowPrivacyPolicy(false)} 
        />

        {/* Feedback Modal */}
        <FeedbackModal 
          isOpen={showFeedbackModal} 
          onClose={() => setShowFeedbackModal(false)} 
        />

        {/* Achievements Modal */}
        <AchievementsModal
          isOpen={showAchievements}
          onClose={() => setShowAchievements(false)}
          achievements={achievements}
          loading={achievementsLoading}
        />

        {/* Profile Modal */}
        <ProfileModal
          isOpen={showProfile}
          onClose={() => setShowProfile(false)}
          userEmail={user?.email || ""}
          userCreatedAt={user?.created_at || ""}
          tipEntries={tipEntries}
        />

        {/* Achievement Unlock Celebration Modal */}
        <AchievementUnlockModal
          isOpen={showAchievementUnlock}
          onClose={() => setShowAchievementUnlock(false)}
        />

        {/* Year in Review Modal */}
        <YearInReviewModal
          isOpen={showYearInReview}
          onClose={() => {
            markYearInReviewShown();
            setShowYearInReview(false);
          }}
          tipEntries={tipEntries}
          year={getReviewYear()}
        />

        {/* Onboarding Tour */}
        <OnboardingTour
          step={currentStep}
          currentStepIndex={currentStepIndex}
          totalSteps={totalSteps}
          isWaitingForAction={!!waitingForAction}
          onNext={nextStep}
          onPrevious={previousStep}
          onSkip={skipAllOnboarding}
          onFinish={completeTabOnboarding}
          onTargetClick={handleTargetClick}
        />
      </div>
    </div>
  );
};

export default Index;
