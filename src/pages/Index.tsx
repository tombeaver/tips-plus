import React, { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TipEntryForm } from '@/components/TipEntryForm';
import { AnalyticsDashboard } from '@/components/AnalyticsDashboard';
import { GoalSettings } from '@/components/GoalSettings';
import { CalendarDays, TrendingUp, Target, Plus } from 'lucide-react';
import { format, isToday, isSameDay } from 'date-fns';

export interface TipEntry {
  id: string;
  date: Date;
  totalSales: number;
  creditTips: number;
  cashTips: number;
  guestCount: number;
  section: string;
  isPlaceholder?: boolean;
  shift: 'AM' | 'PM';
  hoursWorked: number;
  hourlyRate: number;
}

export interface Goal {
  id: string;
  type: 'daily' | 'weekly' | 'monthly' | 'yearly';
  amount: number;
  period: string;
}

const Index = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [tipEntries, setTipEntries] = useState<TipEntry[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [showEntryForm, setShowEntryForm] = useState(false);
  const [activeTab, setActiveTab] = useState("calendar");

  const addTipEntry = (entry: Omit<TipEntry, 'id'>) => {
    const newEntry: TipEntry = {
      ...entry,
      id: Date.now().toString()
    };
    setTipEntries(prev => [...prev, newEntry]);
    setShowEntryForm(false);
  };

  const updateTipEntry = (id: string, updates: Partial<TipEntry>) => {
    setTipEntries(prev => prev.map(entry => 
      entry.id === id ? { ...entry, ...updates } : entry
    ));
  };

  const deleteTipEntry = (id: string) => {
    setTipEntries(prev => prev.filter(entry => entry.id !== id));
  };

  const addGoal = (goal: Omit<Goal, 'id'>) => {
    const newGoal: Goal = {
      ...goal,
      id: Date.now().toString()
    };
    setGoals(prev => [...prev, newGoal]);
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
      .filter(entry => !entry.isPlaceholder)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
  };

  const selectedEntry = getEntryForDate(selectedDate);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-md mx-auto space-y-4">
        {/* Header */}
        <div className="text-center py-4">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Tip Tracker</h1>
          <p className="text-gray-600">Track your earnings & reach your goals</p>
        </div>

        {/* Main Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="calendar" className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4" />
              Calendar
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="goals" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Goals
            </TabsTrigger>
          </TabsList>

          {/* Calendar Tab */}
          <TabsContent value="calendar" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Select Date</CardTitle>
                <CardDescription>
                  Tap a date to view or add your tips
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  className="rounded-md border pointer-events-auto"
                  modifiers={{
                    hasEntry: (date) => hasEntryForDate(date),
                    today: (date) => isToday(date)
                  }}
                  modifiersStyles={{
                    hasEntry: { 
                      backgroundColor: 'rgb(34 197 94)',
                      color: 'white',
                      fontWeight: 'bold'
                    },
                    today: {
                      backgroundColor: 'rgb(59 130 246)',
                      color: 'white'
                    }
                  }}
                />
                <div className="mt-4 space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span>Days with entries</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span>Today</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Selected Date Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                </CardTitle>
                <CardDescription>
                  {selectedEntry ? 'Your shift details' : 'No entry for this date'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {selectedEntry ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Total Sales</p>
                        <p className="text-lg font-semibold">${selectedEntry.totalSales}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Total Tips</p>
                        <p className="text-lg font-semibold text-green-600">
                          ${getTotalTips(selectedEntry)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Tip %</p>
                        <p className="text-lg font-semibold">
                          {getTipPercentage(selectedEntry).toFixed(1)}%
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Per Guest</p>
                        <p className="text-lg font-semibold">
                          ${selectedEntry.guestCount > 0 ? (getTotalTips(selectedEntry) / selectedEntry.guestCount).toFixed(2) : '0.00'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 pt-2 border-t">
                      <div>
                        <p className="text-sm text-gray-600">Shift</p>
                        <p className="font-medium">{selectedEntry.shift}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Hours</p>
                        <p className="font-medium">{selectedEntry.hoursWorked}h</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Rate</p>
                        <p className="font-medium">${selectedEntry.hourlyRate}/hr</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 pt-2">
                      <div>
                        <p className="text-sm text-gray-600">Credit Tips</p>
                        <p className="font-medium">${selectedEntry.creditTips}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Cash Tips</p>
                        <p className="font-medium">${selectedEntry.cashTips}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Guests</p>
                        <p className="font-medium">{selectedEntry.guestCount}</p>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center pt-2 border-t">
                      <div>
                        <p className="text-sm text-gray-600">Section</p>
                        <p className="font-medium">{selectedEntry.section}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Total Earnings</p>
                        <p className="text-lg font-semibold text-green-600">
                          ${getTotalEarnings(selectedEntry).toFixed(2)}
                        </p>
                      </div>
                    </div>
                    
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => setShowEntryForm(true)}
                    >
                      Edit Entry
                    </Button>
                  </div>
                ) : (
                  <Button 
                    className="w-full" 
                    onClick={() => setShowEntryForm(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
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

          {/* Goals Tab */}
          <TabsContent value="goals">
            <GoalSettings 
              goals={goals} 
              onAddGoal={addGoal} 
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
            onSave={selectedEntry ? 
              (entry) => updateTipEntry(selectedEntry.id, entry) : 
              addTipEntry
            }
            onCancel={() => setShowEntryForm(false)}
            onDelete={selectedEntry ? 
              () => {
                deleteTipEntry(selectedEntry.id);
                setShowEntryForm(false);
              } : 
              undefined
            }
          />
        )}
      </div>
    </div>
  );
};

export default Index;
