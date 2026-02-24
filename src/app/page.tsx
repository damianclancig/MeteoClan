

'use client';

import { useState, useEffect, useCallback, useActionState, useRef } from 'react';

import type { WeatherData, DailyForecast, CurrentWeather, HourlyForecast } from '@/lib/types';
import { getWeather } from '@/app/actions';
import { generateCityBackgroundAction } from '@/app/ai-actions';
import { useToast } from "@/hooks/use-toast"
import { useTranslation } from '@/hooks/use-translation';

import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { ApiAttribution } from '@/components/layout/api-attribution';
import { SearchControls } from '@/components/weather/search-controls';
import { CurrentWeather as CurrentWeatherComponent } from '@/components/weather/current-weather';
import { Forecast } from '@/components/weather/forecast';
import { Loader, AlertTriangle } from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';
import { MoonCalendar } from '@/components/weather/moon-calendar';
import { AdBanner } from '@/components/ads/ad-banner';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { cn } from '@/lib/utils';


type FormState = {
  message: string;
  weatherData?: WeatherData;
  success: boolean;
  errorDetail?: string;
};

const initialState: FormState = {
  message: '',
  success: false,
};

// This new type will hold the data for the main display card.
// It must include all properties needed by child components.
// We combine properties from CurrentWeather and DailyForecast.
type DisplayWeather = CurrentWeather | (DailyForecast & Pick<CurrentWeather, 'location' | 'timezone' | 'latitude'>);


const MainContentWrapper = ({ visible, children, onClick }: { visible: boolean; children: React.ReactNode, onClick: (e: React.MouseEvent<HTMLElement>) => void }) => (
  <main className="w-full flex-grow px-4 py-8 flex flex-col justify-center" onClick={onClick}>
    <div className={cn("w-full", !visible && "hidden")}>
      {children}
    </div>
  </main>
);

const ErrorDisplay = ({ error, t }: { error: FormState, t: (key: string) => string }) => (
  <GlassCard className="mt-20 p-6">
    <div className="flex flex-col items-center justify-center text-destructive-foreground gap-4">
      <AlertTriangle className="w-12 h-12 text-destructive" />
      <h2 className="text-2xl font-bold">{t('errorTitle')}</h2>
      <p>{t(error.message)}</p>
      {error.errorDetail && (
        <Accordion type="single" collapsible className="w-full text-foreground/80">
          <AccordionItem value="item-1">
            <AccordionTrigger>{t('technicalDetails')}</AccordionTrigger>
            <AccordionContent className="bg-black/20 p-2 rounded-md font-mono text-xs">
              {error.errorDetail}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )}
    </div>
  </GlassCard>
);

const LoadingDisplay = ({ t }: { t: (key: string) => string }) => (
  <div className="flex flex-col items-center justify-center text-foreground/80 gap-4 mt-20">
    <Loader className="w-12 h-12 animate-spin" />
    <p className="text-xl">{t('loading')}</p>
  </div>
);


export default function Home() {
  const [state, formAction] = useActionState(getWeather, initialState);
  const { t, locale } = useTranslation();

  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [displayData, setDisplayData] = useState<DisplayWeather | null>(null);
  const [hourlyData, setHourlyData] = useState<HourlyForecast[]>([]);
  const [selectedDayId, setSelectedDayId] = useState<string | null>('today');

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<FormState | null>(null);
  const [backgroundImage, setBackgroundImage] = useState<string>('');

  const [currentDate, setCurrentDate] = useState<Date | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [contentVisible, setContentVisible] = useState(true);

  const initialFetchFormRef = useRef<HTMLFormElement>(null);
  const isInitialFetchDone = useRef(false);

  const toggleContent = (e: React.MouseEvent<HTMLElement>) => {
    // Only trigger if the click is on the background itself, not on its children
    if (e.target === e.currentTarget) {
      setContentVisible(prev => !prev);
    }
  };

  useEffect(() => {
    // Set the current date once on component mount
    setCurrentDate(new Date());
  }, []);

  const submitInitialForm = useCallback(async (lat?: number, lon?: number) => {
    if (initialFetchFormRef.current) {
      const form = initialFetchFormRef.current;
      const latInput = form.elements.namedItem('latitude') as HTMLInputElement;
      const lonInput = form.elements.namedItem('longitude') as HTMLInputElement;
      const locInput = form.elements.namedItem('location') as HTMLInputElement;

      if (lat && lon) {
        latInput.value = lat.toString();
        lonInput.value = lon.toString();
        locInput.value = ''; // Let server action resolve name
      } else {
        // Fallback to a default location if geolocation fails
        locInput.value = 'New York';
        latInput.value = '';
        lonInput.value = '';
      }

      form.requestSubmit();
    }
  }, []);

  const handleDaySelect = useCallback((day: DailyForecast) => {
    if (!weatherData) return;

    const newDisplayData: DisplayWeather = {
      ...day,
      location: weatherData.current.location,
      timezone: weatherData.current.timezone,
      latitude: weatherData.current.latitude
    };

    setDisplayData(newDisplayData);
    setHourlyData(day.hourly);
    setSelectedDayId(day.dt);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [weatherData]);

  const handleShowToday = useCallback(() => {
    if (weatherData) {
      setDisplayData(weatherData.current);
      setHourlyData(weatherData.hourly);
      setSelectedDayId('today');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [weatherData]);

  const { toast } = useToast();

  const handleRefreshLocation = useCallback(() => {
    setIsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        submitInitialForm(position.coords.latitude, position.coords.longitude);
      },
      (error) => {
        setIsLoading(false);
        toast({
          title: t('errorTitle'),
          description: t('geolocationError'),
          variant: 'destructive'
        });
      }
    );
  }, [submitInitialForm, toast, t]);

  // Effect for initial data fetch based on geolocation
  useEffect(() => {
    if (isInitialFetchDone.current) return;
    isInitialFetchDone.current = true;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        submitInitialForm(position.coords.latitude, position.coords.longitude);
      },
      () => {
        // Fallback if user denies geolocation
        submitInitialForm();
      }
    );
  }, [submitInitialForm]);

  // Effect to handle state changes from server action
  useEffect(() => {
    if (state.success && state.weatherData) {
      setWeatherData(state.weatherData);
      setDisplayData(state.weatherData.current);
      setHourlyData(state.weatherData.hourly);
      setSelectedDayId('today');
      setError(null);
      setLastUpdated(state.weatherData.lastUpdated);
      setIsLoading(false);
    } else if (!state.success && state.message) {
      if (state.message === 'noLocationProvided' && weatherData) {
        return; // Ignore if we already have some data
      }
      setError(state);
      setIsLoading(false);
    }
  }, [state]);

  // Effect to generate background image after weather data is loaded
  useEffect(() => {
    if (weatherData?.current) {
      const generate = async () => {
        try {
          // Usamos la Server Action local para evitar problemas de CORS
          const response = await generateCityBackgroundAction(
            weatherData.current.location,
            weatherData.current.description,
          );
          if (response.imageUrl) {
            setBackgroundImage(response.imageUrl);
          } else {
            // Fallback to a default gradient background
            setBackgroundImage('');
          }
        } catch (e) {
          console.error("Failed to generate background image asynchronously", e);
          setBackgroundImage('');
        }
      };
      generate();
    }
  }, [weatherData?.current]);

  const latitudeForMoon = weatherData?.latitude;

  return (
    <>
      {/* Background Layer */}
      <div className="fixed inset-0 z-[-1] bg-background">
        {backgroundImage ? (
          <img
            src={backgroundImage}
            alt="Generated weather background"
            className="h-full w-full object-cover transition-opacity duration-1000 ease-in-out"
          />
        ) : (
          <div className="h-full w-full bg-background" />
        )}
        <div className="absolute inset-0 bg-black/50" />
      </div>

      {/* Content Layer */}
      <div className={cn("relative z-0 flex min-h-screen flex-col")}>
        <Header />
        <form ref={initialFetchFormRef} action={formAction} className="hidden">
          <input type="hidden" name="latitude" />
          <input type="hidden" name="longitude" />
          <input type="hidden" name="location" />
        </form>
        <MainContentWrapper visible={contentVisible} onClick={toggleContent}>
          <div className="w-full max-w-4xl mx-auto mb-8 relative">
            <SearchControls formAction={formAction} onRefreshLocation={handleRefreshLocation} locale={locale} />
          </div>
          <div className="flex justify-center items-start h-full">
            {isLoading ? (
              <LoadingDisplay t={t} />
            ) : error && !weatherData ? (
              <ErrorDisplay error={error} t={t} />
            ) : weatherData && displayData ? (
              <div className="w-full max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in">
                <GlassCard className="lg:col-span-3" id="current-weather">
                  <CurrentWeatherComponent
                    data={displayData}
                    hourlyData={hourlyData}
                    locale={locale}
                    lastUpdated={lastUpdated}
                  />
                </GlassCard>

                <div className="lg:col-span-3">
                  <AdBanner />
                </div>

                <GlassCard className="lg:col-span-3" id="forecast">
                  <Forecast
                    data={weatherData.forecast}
                    onDaySelect={handleDaySelect}
                    onShowToday={handleShowToday}
                    selectedDayId={selectedDayId}
                  />
                </GlassCard>

                {currentDate && latitudeForMoon !== undefined && !isNaN(currentDate.getTime()) && (
                  <GlassCard className="lg:col-span-3" id="moon-calendar">
                    <MoonCalendar date={currentDate} latitude={latitudeForMoon} />
                  </GlassCard>
                )}
              </div>
            ) : null}
          </div>
        </MainContentWrapper>
        <ApiAttribution />
        <Footer />
      </div>
    </>
  );
}
