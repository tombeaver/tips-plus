
import React, { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, DollarSign, Users, MapPin, Calendar } from 'lucide-react';
import { TipEntry } from '@/pages/Index';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isWithinInterval, getDay } from 'date-fns';

interface AnalyticsDashboardProps {
  tipEntries: TipEntry[];
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ tipEntries }) => {
  const realEntries = tipEntries.filter(entry => !entry.isPlaceholder);

  const stats = useMemo(() => {
    if (realEntries.length === 0) {
      return {
        totalTips: 0,
        totalSales: 0,
        averageTipPercentage: 0,
        averagePerGuest: 0,
        totalGuests: 0,
        shiftsWorked: 0
      };
    }

    const totalTips = realEntries.reduce((sum, entry) => sum + entry.creditTips + entry.cashTips, 0);
    const totalSales = realEntries.reduce((sum, entry) => sum + entry.totalSales, 0);
    const totalGuests = realEntries.reduce((sum, entry) => sum + entry.guestCount, 0);
    
    return {
      totalTips,
      totalSales,
      averageTipPercentage: totalSales > 0 ? (totalTips / totalSales) * 100 : 0,
      averagePerGuest: totalGuests > 0 ? totalTips / totalGuests : 0,
      totalGuests,
      shiftsWorked: realEntries.length
    };
  }, [realEntries]);

  const sectionStats = useMemo(() => {
    const sectionMap = new Map();
    
    realEntries.forEach(entry => {
      const existing = sectionMap.get(entry.section) || {
        section: entry.section,
        totalTips: 0,
        totalSales: 0,
        totalGuests: 0,
        shifts: 0
      };
      
      sectionMap.set(entry.section, {
        ...existing,
        totalTips: existing.totalTips + entry.creditTips + entry.cashTips,
        totalSales: existing.totalSales + entry.totalSales,
        totalGuests: existing.totalGuests + entry.guestCount,
        shifts: existing.shifts + 1
      });
    });

    return Array.from(sectionMap.values()).map(section => ({
      ...section,
      averageTipPercentage: section.totalSales > 0 ? (section.totalTips / section.totalSales) * 100 : 0,
      averagePerGuest: section.totalGuests > 0 ? section.totalTips / section.totalGuests : 0,
      averageTipsPerShift: section.shifts > 0 ? section.totalTips / section.shifts : 0
    })).sort((a, b) => b.totalTips - a.totalTips);
  }, [realEntries]);

  const dayStats = useMemo(() => {
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayMap = new Map();

    realEntries.forEach(entry => {
      const dayIndex = getDay(entry.date);
      const dayName = dayNames[dayIndex];
      
      const existing = dayMap.get(dayName) || {
        day: dayName,
        dayIndex,
        totalTips: 0,
        totalSales: 0,
        totalGuests: 0,
        shifts: 0
      };
      
      dayMap.set(dayName, {
        ...existing,
        totalTips: existing.totalTips + entry.creditTips + entry.cashTips,
        totalSales: existing.totalSales + entry.totalSales,
        totalGuests: existing.totalGuests + entry.guestCount,
        shifts: existing.shifts + 1
      });
    });

    return Array.from(dayMap.values()).map(day => ({
      ...day,
      averageTipPercentage: day.totalSales > 0 ? (day.totalTips / day.totalSales) * 100 : 0,
      averagePerGuest: day.totalGuests > 0 ? day.totalTips / day.totalGuests : 0,
      averageTipsPerShift: day.shifts > 0 ? day.totalTips / day.shifts : 0
    })).sort((a, b) => b.averageTipsPerShift - a.averageTipsPerShift);
  }, [realEntries]);

  const weeklyData = useMemo(() => {
    const weeks = new Map();
    
    realEntries.forEach(entry => {
      const weekStart = startOfWeek(entry.date);
      const weekKey = format(weekStart, 'MMM d');
      
      const existing = weeks.get(weekKey) || { week: weekKey, tips: 0, sales: 0, guests: 0, weekStart };
      weeks.set(weekKey, {
        ...existing,
        tips: existing.tips + entry.creditTips + entry.cashTips,
        sales: existing.sales + entry.totalSales,
        guests: existing.guests + entry.guestCount,
        weekStart
      });
    });

    return Array.from(weeks.values()).sort((a, b) => a.weekStart.getTime() - b.weekStart.getTime());
  }, [realEntries]);

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

  if (realEntries.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Analytics Dashboard</CardTitle>
          <CardDescription>Add some tip entries to see your analytics</CardDescription>
        </CardHeader>
        <CardContent className="text-center py-8">
          <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No data yet. Start tracking your tips!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Tips</p>
                <p className="text-2xl font-bold text-green-600">${stats.totalTips.toFixed(2)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Tip %</p>
                <p className="text-2xl font-bold">{stats.averageTipPercentage.toFixed(1)}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Per Guest</p>
                <p className="text-2xl font-bold">${stats.averagePerGuest.toFixed(2)}</p>
              </div>
              <Users className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Shifts</p>
                <p className="text-2xl font-bold">{stats.shiftsWorked}</p>
              </div>
              <MapPin className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Trend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Weekly Tips Trend</CardTitle>
          <CardDescription>Your tip earnings over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [`$${value}`, name === 'tips' ? 'Tips' : name]}
                />
                <Line type="monotone" dataKey="tips" stroke="#10B981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Section Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Section Performance</CardTitle>
          <CardDescription>Compare your earnings by section</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sectionStats.map((section, index) => (
              <div key={section.section} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">{section.section}</h4>
                  <span className="text-lg font-bold text-green-600">
                    ${section.totalTips.toFixed(2)}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-sm text-gray-600">
                  <div>
                    <span className="block">Avg Tip %</span>
                    <span className="font-medium">{section.averageTipPercentage.toFixed(1)}%</span>
                  </div>
                  <div>
                    <span className="block">Per Guest</span>
                    <span className="font-medium">${section.averagePerGuest.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="block">Shifts</span>
                    <span className="font-medium">{section.shifts}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Day of Week Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Day of Week Performance</CardTitle>
          <CardDescription>Your earnings by day of the week</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {dayStats.map((day, index) => (
              <div key={day.day} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {day.day}
                  </h4>
                  <span className="text-lg font-bold text-green-600">
                    ${day.averageTipsPerShift.toFixed(2)}/shift
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-2 text-sm text-gray-600">
                  <div>
                    <span className="block">Total Tips</span>
                    <span className="font-medium">${day.totalTips.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="block">Avg Tip %</span>
                    <span className="font-medium">{day.averageTipPercentage.toFixed(1)}%</span>
                  </div>
                  <div>
                    <span className="block">Per Guest</span>
                    <span className="font-medium">${day.averagePerGuest.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="block">Shifts</span>
                    <span className="font-medium">{day.shifts}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Section Distribution Pie Chart */}
      {sectionStats.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Tips by Section</CardTitle>
            <CardDescription>Distribution of your total tips</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={sectionStats}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ section, percent }) => `${section} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="totalTips"
                  >
                    {sectionStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`$${value}`, 'Tips']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
