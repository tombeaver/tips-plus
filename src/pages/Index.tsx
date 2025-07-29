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
import { Insights } from '@/components/Insights';

import { FeedbackModal } from '@/components/FeedbackModal';
import { EarningsCalendar } from '@/components/EarningsCalendar';
import { PrivacyPolicy } from '@/components/PrivacyPolicy';
import { CalendarDays, TrendingUp, Target, Plus, Lightbulb, LogOut, MessageCircle, Frown, Meh, Smile, Laugh, Zap, DollarSign, CreditCard, Clock, Receipt, Users } from 'lucide-react';
import { format, isToday, isSameDay } from 'date-fns';
import { useTipEntries, type TipEntry } from '@/hooks/useTipEntries';
import { useGoals, type Goal } from '@/hooks/useGoals';
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
  
  const { tipEntries, loading: tipEntriesLoading, addTipEntry, updateTipEntry, deleteTipEntry } = useTipEntries();
  const { goals, loading: goalsLoading, addGoal, updateGoal, deleteGoal } = useGoals();
  const [showEntryForm, setShowEntryForm] = useState(false);
  const [activeTab, setActiveTab] = useState("calendar");
  const [sections, setSections] = useState<{ [key: string]: string }>(createDefaultSections());
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
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
        <div className="text-center py-6 relative">
          <h1 className="heading-lg text-foreground mb-2">Tips+</h1>
          <p className="body-md text-muted-foreground">Track. Analyze. Level Up Your Income.</p>
          
          {/* User info and sign out */}
          <div className="absolute top-6 left-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSignOutConfirm(true)}
              className="text-muted-foreground hover:text-foreground"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Feedback Icon in top right */}
          <div className="absolute top-6 right-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFeedbackModal(true)}
              className="text-muted-foreground hover:text-foreground"
            >
              <MessageCircle className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Main Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-card/50 backdrop-blur-sm border shadow-sm">
            <TabsTrigger value="calendar" className="flex items-center gap-1 transition-all duration-200 hover:bg-primary/10">
              <CalendarDays className="h-4 w-4" />
              <span className="hidden sm:inline">Calendar</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-1 transition-all duration-200 hover:bg-primary/10">
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="tips" className="flex items-center gap-1 transition-all duration-200 hover:bg-primary/10">
              <Lightbulb className="h-4 w-4" />
              <span className="hidden sm:inline">Tips</span>
            </TabsTrigger>
            <TabsTrigger value="goals" className="flex items-center gap-1 transition-all duration-200 hover:bg-primary/10">
              <Target className="h-4 w-4" />
              <span className="hidden sm:inline">Goals</span>
            </TabsTrigger>
          </TabsList>

          {/* Calendar Tab */}
          <TabsContent value="calendar" className="space-group">
            <Card className="card-interactive">
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
            <Card className="card-interactive">
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

                    {/* Income Breakdown */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Income Breakdown</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-background/50 rounded-xl p-4 border border-border/50">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                              <DollarSign className="w-5 h-5 text-green-600" />
                            </div>
                            <span className="text-muted-foreground">Cash</span>
                          </div>
                          <div className="text-2xl font-bold text-green-600">
                            ${selectedEntry.cashTips}
                          </div>
                        </div>

                        <div className="bg-background/50 rounded-xl p-4 border border-border/50">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                              <CreditCard className="w-5 h-5 text-green-600" />
                            </div>
                            <span className="text-muted-foreground">Credit</span>
                          </div>
                          <div className="text-2xl font-bold text-green-600">
                            ${selectedEntry.creditTips}
                          </div>
                        </div>

                        <div className="bg-background/50 rounded-xl p-4 border border-border/50">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                              <Clock className="w-5 h-5 text-green-600" />
                            </div>
                            <span className="text-muted-foreground">Wages</span>
                          </div>
                          <div className="text-2xl font-bold text-green-600">
                            ${(selectedEntry.hourlyRate * selectedEntry.hoursWorked).toFixed(2)}
                          </div>
                        </div>

                        <div className="bg-background/50 rounded-xl p-4 border border-border/50">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                              <Receipt className="w-5 h-5 text-orange-600" />
                            </div>
                            <span className="text-muted-foreground">Total Sales</span>
                          </div>
                          <div className="text-2xl font-bold text-orange-600">
                            ${selectedEntry.totalSales}
                          </div>
                        </div>

                        <div className="bg-background/50 rounded-xl p-4 border border-border/50">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                              <Users className="w-5 h-5 text-amber-600" />
                            </div>
                            <span className="text-muted-foreground">Guest</span>
                          </div>
                          <div className="text-2xl font-bold text-amber-600">
                            {selectedEntry.guestCount}
                          </div>
                        </div>
                        
                        <div className="bg-background/50 rounded-xl p-4 border border-border/50">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <Receipt className="w-5 h-5 text-blue-600" />
                            </div>
                            <span className="text-muted-foreground">Section</span>
                          </div>
                          <div className="text-2xl font-bold text-blue-600">
                            {selectedEntry.section}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
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
                    className="w-full interactive-glow" 
                    size="lg"
                    onClick={() => setShowEntryForm(true)}
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    Add Tip Entry
                  </Button>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tips Tab */}
          <TabsContent value="tips">
            <Insights tipEntries={tipEntries} selectedDate={selectedDate} />
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <AnalyticsDashboard tipEntries={tipEntries} />
          </TabsContent>


          {/* Goals Tab */}
          <TabsContent value="goals">
            <GoalSettings 
              goals={goals} 
              onAddGoal={async (goal) => { await addGoal(goal); }}
              onUpdateGoal={async (goalId, goal) => { await updateGoal(goalId, goal); }}
              onDeleteGoal={deleteGoal}
              tipEntries={tipEntries}
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
            onSave={selectedEntry ? 
              (entry) => handleUpdateTipEntry(selectedEntry.id, entry) : 
              handleAddTipEntry
            }
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

        {/* Privacy Policy Link */}
        <div className="text-center py-4">
          <button
            onClick={() => setShowPrivacyPolicy(true)}
            className="text-sm text-muted-foreground hover:text-foreground underline"
          >
            Privacy Policy
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
      </div>
    </div>
  );
};

export default Index;
