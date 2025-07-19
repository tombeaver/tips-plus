import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Cloud, Sun, CloudRain, Snowflake, Thermometer, MapPin, Droplets } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';
import { WeatherData, getWeatherHistory } from '@/components/WeatherTracker';

interface WeatherIconProps {
  selectedDate: Date;
  onWeatherRecorded?: (weather: WeatherData) => void;
}

const WEATHER_STORAGE_KEY = 'tip-tracker-weather-data';

export const WeatherIcon: React.FC<WeatherIconProps> = ({
  selectedDate,
  onWeatherRecorded
}) => {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const dateKey = selectedDate.toISOString().split('T')[0];

  useEffect(() => {
    const weatherHistory = getWeatherHistory();
    const existingData = weatherHistory[dateKey];
    if (existingData) {
      setWeatherData(existingData);
    } else {
      setWeatherData(null);
    }
  }, [dateKey]);

  const getWeatherIcon = (description?: string, size = 'h-4 w-4') => {
    if (!description) return <Thermometer className={size} />;
    if (description.includes('rain')) return <CloudRain className={size} />;
    if (description.includes('snow')) return <Snowflake className={size} />;
    if (description.includes('cloud')) return <Cloud className={size} />;
    return <Sun className={size} />;
  };

  const saveWeatherData = (weather: WeatherData) => {
    const savedWeather = localStorage.getItem(WEATHER_STORAGE_KEY);
    const weatherHistory = savedWeather ? JSON.parse(savedWeather) : {};
    
    weatherHistory[dateKey] = weather;
    localStorage.setItem(WEATHER_STORAGE_KEY, JSON.stringify(weatherHistory));
    
    if (onWeatherRecorded) {
      onWeatherRecorded(weather);
    }
  };

  const generateMockWeather = async (): Promise<WeatherData> => {
    const today = new Date();
    const month = today.getMonth();
    const isWinter = month === 11 || month === 0 || month === 1;
    const isSummer = month >= 5 && month <= 8;
    
    let baseTemp = 70;
    if (isWinter) baseTemp = 45;
    if (isSummer) baseTemp = 85;
    
    const temperature = baseTemp + (Math.random() * 20 - 10);
    const humidity = 40 + Math.random() * 40;
    
    const descriptions = [
      'clear sky', 'few clouds', 'scattered clouds', 'broken clouds',
      'light rain', 'moderate rain', 'sunny', 'partly cloudy'
    ];

    const calculateHeatIndex = (temp: number, humidity: number): number => {
      if (temp < 80) return temp;
      
      const T = temp;
      const RH = humidity;
      
      let HI = -42.379 + 2.04901523 * T + 10.14333127 * RH - 0.22475541 * T * RH;
      HI += -0.00683783 * T * T - 0.05481717 * RH * RH + 0.00122874 * T * T * RH;
      HI += 0.00085282 * T * RH * RH - 0.00000199 * T * T * RH * RH;
      
      return Math.round(HI);
    };

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

  const getCurrentWeather = async () => {
    setIsLoading(true);

    try {
      const mockWeather = await generateMockWeather();
      setWeatherData(mockWeather);
      saveWeatherData(mockWeather);
      
      toast({
        title: "Weather Recorded",
        description: `${mockWeather.temperature}°F - ${mockWeather.description}`,
        duration: 3000,
      });
    } catch (err) {
      toast({
        title: "Weather Error",
        description: "Failed to get weather data",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getHeatIndexColor = (heatIndex: number) => {
    if (heatIndex >= 105) return 'text-red-500';
    if (heatIndex >= 90) return 'text-orange-500';
    if (heatIndex >= 80) return 'text-yellow-600';
    return 'text-green-500';
  };

  const getPrecipitationLevel = (precipitation: number) => {
    if (precipitation === 0) return 'None';
    if (precipitation < 0.1) return 'Light';
    if (precipitation < 0.3) return 'Moderate';
    return 'Heavy';
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 relative"
        >
          {weatherData ? (
            <>
              {getWeatherIcon(weatherData.description)}
              <Badge 
                variant="secondary" 
                className="absolute -top-1 -right-1 h-4 w-auto min-w-4 px-1 text-xs font-medium"
              >
                {weatherData.temperature}°
              </Badge>
            </>
          ) : (
            <Thermometer className="h-4 w-4 text-muted-foreground" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3" align="end">
        {weatherData ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getWeatherIcon(weatherData.description, 'h-5 w-5')}
                <span className="font-medium capitalize text-sm">{weatherData.description}</span>
              </div>
              <Badge variant="outline" className="text-xs">
                <MapPin className="h-3 w-3 mr-1" />
                {weatherData.location}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-muted-foreground text-xs">Temperature</p>
                <p className="font-semibold">{weatherData.temperature}°F</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Feels Like</p>
                <p className="font-semibold">{weatherData.feelsLike}°F</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Humidity</p>
                <div className="flex items-center gap-1">
                  <Droplets className="h-3 w-3" />
                  <span className="font-semibold">{weatherData.humidity}%</span>
                </div>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Precipitation</p>
                <p className="font-semibold">{getPrecipitationLevel(weatherData.precipitation)}</p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t">
              <div>
                <p className="text-muted-foreground text-xs">Heat Index</p>
                <span className={`font-semibold ${getHeatIndexColor(weatherData.heatIndex)}`}>
                  {weatherData.heatIndex}°F
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={getCurrentWeather}
                disabled={isLoading}
                className="text-xs h-7"
              >
                {isLoading ? "..." : "Update"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center space-y-3">
            <p className="text-sm text-muted-foreground">No weather data for this date</p>
            <Button
              onClick={getCurrentWeather}
              disabled={isLoading}
              size="sm"
              className="w-full"
            >
              {isLoading ? 'Getting Weather...' : 'Record Weather'}
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};