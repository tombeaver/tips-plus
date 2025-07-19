import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Calendar, MapPin, Star, CloudRain } from 'lucide-react';
import { format, getDay, isAfter, startOfWeek } from 'date-fns';
import { getWeatherHistory, getWeatherRecommendations } from '@/components/WeatherTracker';

interface TipEntry {
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

interface TipsRecommendationsProps {
  tipEntries: TipEntry[];
  selectedDate?: Date;
}

export const TipsRecommendations: React.FC<TipsRecommendationsProps> = ({ tipEntries, selectedDate }) => {
  const recommendations = useMemo(() => {
    // Add null safety check
    if (!tipEntries || !Array.isArray(tipEntries)) {
      return null;
    }
    
    const realEntries = tipEntries.filter(entry => entry && !entry.isPlaceholder);
    
    if (realEntries.length < 5) {
      return null; // Not enough data for meaningful recommendations
    }

    // Analyze by day of week
    const dayStats: { [key: number]: { total: number; count: number; earnings: number } } = {};
    const sectionStats: { [key: string]: { total: number; count: number } } = {};

    realEntries.forEach(entry => {
      // Add null safety for entry properties
      if (!entry || !entry.date) return;
      
      const dayOfWeek = getDay(entry.date);
      const totalTips = (entry.creditTips || 0) + (entry.cashTips || 0);
      const totalEarnings = totalTips + ((entry.hoursWorked || 0) * (entry.hourlyRate || 0));
      
      // Day statistics
      if (!dayStats[dayOfWeek]) {
        dayStats[dayOfWeek] = { total: 0, count: 0, earnings: 0 };
      }
      dayStats[dayOfWeek].total += totalTips;
      dayStats[dayOfWeek].earnings += totalEarnings;
      dayStats[dayOfWeek].count += 1;

      // Section statistics
      const section = entry.section || 'Unknown';
      if (totalTips > 0) {
        if (!sectionStats[section]) {
          sectionStats[section] = { total: 0, count: 0 };
        }
        sectionStats[section].total += totalTips;
        sectionStats[section].count += 1;
      }
    });

    // Calculate averages and find best performers
    const dayAverages = Object.entries(dayStats).map(([day, stats]) => ({
      day: parseInt(day),
      avgTips: stats.total / stats.count,
      avgEarnings: stats.earnings / stats.count,
      dayName: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][parseInt(day)]
    }));

    const sectionAverages = Object.entries(sectionStats).map(([section, stats]) => ({
      section,
      avgTips: stats.total / stats.count,
      workCount: stats.count
    }));

    // Find best day and section - add safety checks
    if (dayAverages.length === 0 || sectionAverages.length === 0) {
      return null;
    }

    const bestDay = dayAverages.reduce((best, current) => 
      current.avgTips > best.avgTips ? current : best
    );

    const bestSection = sectionAverages.reduce((best, current) => 
      current.avgTips > best.avgTips ? current : best
    );

    // Get selected day's stats (or today if no date selected)
    const targetDate = selectedDate || new Date();
    const targetDayIndex = getDay(targetDate);
    const targetDayStats = dayAverages.find(d => d.day === targetDayIndex);
    
    // Find sections used on this day of week
    const targetDaySections = realEntries
      .filter(entry => entry.date && getDay(entry.date) === targetDayIndex)
      .map(entry => ({
        section: entry.section || 'Unknown',
        tips: (entry.creditTips || 0) + (entry.cashTips || 0)
      }));
      
    // Get alternative sections (ones not tried on this day)
    const usedSections = new Set(targetDaySections.map(s => s.section));
    const alternativeSections = sectionAverages.filter(s => !usedSections.has(s.section));

    // Get weather data for today (not selected date, always current day)
    const today = new Date();
    const todayKey = today.toISOString().split('T')[0];
    const weatherHistory = getWeatherHistory();
    const todaysWeather = weatherHistory[todayKey];
    const weatherRecommendations = todaysWeather ? getWeatherRecommendations(todaysWeather) : [];

    return {
      bestDay,
      bestSection,
      totalEntries: realEntries.length,
      todaysWeather,
      weatherRecommendations
    };
  }, [tipEntries, selectedDate]);

  if (!recommendations) {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            Tips & Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Keep logging your tips! Recommendations will appear after you have at least 5 entries.
          </p>
        </CardContent>
      </Card>
    );
  }

  const { bestDay, bestSection, todaysWeather, weatherRecommendations } = recommendations;

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="h-5 w-5" />
          Tips & Recommendations
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Best Day Recommendation */}
          <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
            <div className="p-2 bg-primary/10 rounded-full">
              <Calendar className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-sm">Best Day to Work</h4>
              <p className="text-sm text-muted-foreground mb-2">
                {bestDay.dayName}s have been your most profitable
              </p>
              <div className="flex gap-2">
                <Badge variant="secondary" className="text-xs">
                  Avg: ${bestDay.avgTips.toFixed(0)} tips
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  ${bestDay.avgEarnings.toFixed(0)} earnings
                </Badge>
              </div>
            </div>
          </div>

          {/* Best Section Recommendation */}
          <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
            <div className="p-2 bg-primary/10 rounded-full">
              <MapPin className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-sm">Top Performing Section</h4>
              <p className="text-sm text-muted-foreground mb-2">
                {bestSection.section} consistently performs well
              </p>
              <div className="flex gap-2">
                <Badge variant="secondary" className="text-xs">
                  Avg: ${bestSection.avgTips.toFixed(0)} tips
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  {bestSection.workCount} shifts worked
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Weather-based drink recommendations */}
        {todaysWeather && (
          <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-lg animate-fade-in">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-100 rounded-full">
                <CloudRain className="h-4 w-4 text-blue-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-lg text-blue-900">Today's Weather Insights</h4>
                  <Badge variant="secondary" className="bg-white/80 text-blue-700 font-medium">
                    {todaysWeather.temperature}°F - {todaysWeather.description}
                  </Badge>
                </div>
                
                {/* Weather metrics in cards */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="bg-white/60 rounded-lg p-3 text-center">
                    <p className="text-xs text-blue-600 font-medium uppercase tracking-wide">Temperature</p>
                    <p className="text-lg font-bold text-blue-900">{todaysWeather.temperature}°F</p>
                  </div>
                  <div className="bg-white/60 rounded-lg p-3 text-center">
                    <p className="text-xs text-blue-600 font-medium uppercase tracking-wide">Feels Like</p>
                    <p className="text-lg font-bold text-blue-900">{todaysWeather.feelsLike}°F</p>
                  </div>
                  <div className="bg-white/60 rounded-lg p-3 text-center">
                    <p className="text-xs text-blue-600 font-medium uppercase tracking-wide">Heat Index</p>
                    <p className={`text-lg font-bold ${todaysWeather.heatIndex >= 90 ? 'text-red-600' : 'text-blue-900'}`}>
                      {todaysWeather.heatIndex}°F
                    </p>
                  </div>
                </div>

                {/* Drink recommendations */}
                <div className="bg-white/60 rounded-lg p-3">
                  <h5 className="font-medium text-blue-900 mb-3 flex items-center gap-2">
                    <span>🍹</span>
                    Drink Suggestions for Today
                  </h5>
                  <div className="space-y-2">
                    {weatherRecommendations.slice(0, 3).map((recommendation, index) => (
                      <div key={index} className="flex items-start gap-2 p-2 bg-white/40 rounded text-sm">
                        <span className="text-blue-600 font-bold mt-0.5">•</span>
                        <p className="text-gray-800 leading-relaxed">
                          {recommendation.replace(/^[🍹🥤🧊☕🔥🌊🍋🍻🍲🍷💧]+\s*/, '')}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* No weather data message */}
        {!todaysWeather && (
          <div className="p-6 bg-gray-50/80 border border-gray-200 rounded-lg text-center animate-fade-in">
            <CloudRain className="h-8 w-8 text-gray-400 mx-auto mb-3" />
            <h4 className="font-medium text-gray-700 mb-2">No Weather Data Available</h4>
            <p className="text-sm text-gray-600 mb-1">Get personalized drink suggestions based on today's weather</p>
            <p className="text-xs text-gray-500">Click the weather icon in the top right to record today's conditions</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};