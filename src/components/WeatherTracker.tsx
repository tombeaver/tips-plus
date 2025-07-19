import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Cloud, Sun, CloudRain, Snowflake, MapPin, Thermometer } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export interface WeatherData {
  date: string;
  temperature: number;
  feelsLike: number;
  humidity: number;
  description: string;
  precipitation: number;
  windSpeed: number;
  visibility: number;
  location: string;
  heatIndex: number;
}

interface WeatherTrackerProps {
  selectedDate: Date;
  onWeatherRecorded?: (weather: WeatherData) => void;
  existingWeather?: WeatherData;
}

const WEATHER_STORAGE_KEY = 'tip-tracker-weather-data';

export const WeatherTracker: React.FC<WeatherTrackerProps> = ({
  selectedDate,
  onWeatherRecorded,
  existingWeather
}) => {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(existingWeather || null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const { toast } = useToast();

  const dateKey = selectedDate.toISOString().split('T')[0];

  useEffect(() => {
    // Load existing weather data for this date
    const savedWeather = localStorage.getItem(WEATHER_STORAGE_KEY);
    if (savedWeather) {
      const weatherHistory = JSON.parse(savedWeather);
      const existingData = weatherHistory[dateKey];
      if (existingData) {
        setWeatherData(existingData);
      }
    }
  }, [dateKey]);

  const saveWeatherData = (weather: WeatherData) => {
    const savedWeather = localStorage.getItem(WEATHER_STORAGE_KEY);
    const weatherHistory = savedWeather ? JSON.parse(savedWeather) : {};
    
    weatherHistory[dateKey] = weather;
    localStorage.setItem(WEATHER_STORAGE_KEY, JSON.stringify(weatherHistory));
    
    if (onWeatherRecorded) {
      onWeatherRecorded(weather);
    }
  };

  const getCurrentWeather = async () => {
    setIsLoading(true);
    setError('');

    try {
      // Get user's current position
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        if (!navigator.geolocation) {
          reject(new Error('Geolocation is not supported by this browser'));
          return;
        }

        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        });
      });

      const { latitude, longitude } = position.coords;

      // Use OpenWeatherMap API (free tier)
      const API_KEY = ''; // User needs to input this
      if (!API_KEY) {
        // For now, generate mock data based on location
        const mockWeather = await generateMockWeather(latitude, longitude);
        setWeatherData(mockWeather);
        saveWeatherData(mockWeather);
        
        toast({
          title: "Weather Recorded",
          description: "Mock weather data generated (API key needed for real data)",
          duration: 3000,
        });
        return;
      }

      // Real API call would go here
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=imperial`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch weather data');
      }

      const data = await response.json();
      
      const weather: WeatherData = {
        date: dateKey,
        temperature: Math.round(data.main.temp),
        feelsLike: Math.round(data.main.feels_like),
        humidity: data.main.humidity,
        description: data.weather[0].description,
        precipitation: data.rain?.['1h'] || data.snow?.['1h'] || 0,
        windSpeed: data.wind.speed,
        visibility: data.visibility / 1000, // Convert to km
        location: data.name,
        heatIndex: calculateHeatIndex(data.main.temp, data.main.humidity)
      };

      setWeatherData(weather);
      saveWeatherData(weather);
      
      toast({
        title: "Weather Recorded",
        description: `Recorded weather for ${weather.location}`,
        duration: 3000,
      });

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get weather data';
      setError(errorMessage);
      
      toast({
        title: "Weather Error",
        description: errorMessage,
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateMockWeather = async (lat: number, lon: number): Promise<WeatherData> => {
    // Generate realistic weather based on season and location
    const today = new Date();
    const month = today.getMonth();
    const isWinter = month === 11 || month === 0 || month === 1;
    const isSummer = month >= 5 && month <= 8;
    
    let baseTemp = 70;
    if (isWinter) baseTemp = 45;
    if (isSummer) baseTemp = 85;
    
    // Add some randomness
    const temperature = baseTemp + (Math.random() * 20 - 10);
    const humidity = 40 + Math.random() * 40;
    
    const descriptions = [
      'clear sky', 'few clouds', 'scattered clouds', 'broken clouds',
      'light rain', 'moderate rain', 'sunny', 'partly cloudy'
    ];

    return {
      date: dateKey,
      temperature: Math.round(temperature),
      feelsLike: Math.round(temperature + (Math.random() * 10 - 5)),
      humidity: Math.round(humidity),
      description: descriptions[Math.floor(Math.random() * descriptions.length)],
      precipitation: Math.random() > 0.7 ? Math.random() * 0.5 : 0,
      windSpeed: Math.random() * 15,
      visibility: 8 + Math.random() * 2,
      location: 'Current Location',
      heatIndex: calculateHeatIndex(temperature, humidity)
    };
  };

  const calculateHeatIndex = (temp: number, humidity: number): number => {
    if (temp < 80) return temp;
    
    const T = temp;
    const RH = humidity;
    
    let HI = -42.379 + 2.04901523 * T + 10.14333127 * RH - 0.22475541 * T * RH;
    HI += -0.00683783 * T * T - 0.05481717 * RH * RH + 0.00122874 * T * T * RH;
    HI += 0.00085282 * T * RH * RH - 0.00000199 * T * T * RH * RH;
    
    return Math.round(HI);
  };

  const getWeatherIcon = (description: string) => {
    if (description.includes('rain')) return <CloudRain className="h-5 w-5" />;
    if (description.includes('snow')) return <Snowflake className="h-5 w-5" />;
    if (description.includes('cloud')) return <Cloud className="h-5 w-5" />;
    return <Sun className="h-5 w-5" />;
  };

  const getHeatIndexColor = (heatIndex: number) => {
    if (heatIndex >= 105) return 'bg-red-500';
    if (heatIndex >= 90) return 'bg-orange-500';
    if (heatIndex >= 80) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getPrecipitationLevel = (precipitation: number) => {
    if (precipitation === 0) return 'None';
    if (precipitation < 0.1) return 'Light';
    if (precipitation < 0.3) return 'Moderate';
    return 'Heavy';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Thermometer className="h-5 w-5" />
          Weather Conditions
        </CardTitle>
        <CardDescription>
          Track weather to improve tip predictions
        </CardDescription>
      </CardHeader>
      <CardContent>
        {weatherData ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getWeatherIcon(weatherData.description)}
                <span className="font-medium capitalize">{weatherData.description}</span>
              </div>
              <Badge variant="secondary">
                <MapPin className="h-3 w-3 mr-1" />
                {weatherData.location}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Temperature</p>
                <p className="text-lg font-semibold">{weatherData.temperature}°F</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Feels Like</p>
                <p className="text-lg font-semibold">{weatherData.feelsLike}°F</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Humidity</p>
                <p className="text-lg font-semibold">{weatherData.humidity}%</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Precipitation</p>
                <p className="text-lg font-semibold">{getPrecipitationLevel(weatherData.precipitation)}</p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t">
              <div>
                <p className="text-sm text-muted-foreground">Heat Index</p>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${getHeatIndexColor(weatherData.heatIndex)}`}></div>
                  <span className="font-semibold">{weatherData.heatIndex}°F</span>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={getCurrentWeather}
                disabled={isLoading}
              >
                Update Weather
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 text-red-600 text-sm">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}
            <Button
              onClick={getCurrentWeather}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? 'Getting Weather...' : 'Record Today\'s Weather'}
            </Button>
            <p className="text-sm text-muted-foreground text-center">
              Weather data helps improve tip recommendations based on conditions
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Utility function to get weather data for analytics
export const getWeatherHistory = (): { [date: string]: WeatherData } => {
  const savedWeather = localStorage.getItem(WEATHER_STORAGE_KEY);
  return savedWeather ? JSON.parse(savedWeather) : {};
};

// Function to get weather recommendations for drinks
export const getWeatherRecommendations = (weather: WeatherData): string[] => {
  const recommendations: string[] = [];
  
  if (weather.heatIndex >= 90) {
    recommendations.push("🧊 Stock extra ice - high heat index suggests customers will want cold drinks");
    recommendations.push("🥤 Promote iced teas, cold brew, and frozen drinks");
    recommendations.push("🍻 Cold beer and cocktails will be popular");
  }
  
  if (weather.temperature >= 80) {
    recommendations.push("🌊 Customers will want refreshing beverages");
    recommendations.push("🍋 Lemonade and citrus drinks perform well in hot weather");
  }
  
  if (weather.precipitation > 0) {
    recommendations.push("☕ Hot drinks like coffee and tea will be more popular");
    recommendations.push("🍲 Comfort food and warm beverages increase on rainy days");
    recommendations.push("🍷 Wine sales typically increase during precipitation");
  }
  
  if (weather.temperature <= 60) {
    recommendations.push("🔥 Hot drinks, soups, and warm cocktails will be in demand");
    recommendations.push("☕ Promote hot coffee, hot chocolate, and mulled drinks");
  }
  
  if (weather.humidity >= 70) {
    recommendations.push("💧 High humidity makes people crave lighter, more refreshing drinks");
    recommendations.push("🧊 Extra ice will be needed as drinks warm up faster");
  }
  
  return recommendations;
};