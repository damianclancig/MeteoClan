'use client';

import type { WeatherData, DailyForecast, CurrentWeather, HourlyForecast, NormalizedLocation } from '@/lib/types';
import { getWeather } from '@/app/actions';
import { generateCityBackgroundAction } from '@/app/ai-actions';
import { dictionaries, Locale, defaultLocale } from '@/lib/i18n';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from '@/hooks/use-translation';
import { useState, useEffect, useCallback, useActionState, useRef } from 'react';
import NextImage from 'next/image';

import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { SearchControls } from '@/components/weather/search-controls';
import { CurrentWeather as CurrentWeatherComponent } from '@/components/weather/current-weather';
import { Forecast } from '@/components/weather/forecast';
import { WeatherSkeleton } from '@/components/weather/weather-skeleton';
import { AlertTriangle } from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';
import { MoonCalendar } from '@/components/weather/moon-calendar';
import { AdBanner } from '@/components/ads/ad-banner';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { cn } from '@/lib/utils';
import { getCachedLocation, setCachedLocation } from '@/services/geocoding';

type FormState = {
  message: string;
  weatherData?: WeatherData;
  normalizedLocation?: NormalizedLocation;
  success: boolean;
  errorDetail?: string;
};

const initialState: FormState = {
  message: '',
  success: false,
};

// Combina propiedades para la tarjeta de display principal
type DisplayWeather = CurrentWeather | (DailyForecast & Pick<CurrentWeather, 'location' | 'timezone' | 'latitude'>);

const ErrorDisplay = ({ error, t }: { error: FormState; t: (key: string) => string }) => (
  <GlassCard className="mt-10 p-6">
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

const LoadingDisplay = () => (
  <div className="w-full mt-2">
    <WeatherSkeleton />
  </div>
);

export function WeatherMain({ initialLocale }: { initialLocale?: Locale }) {
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

  // Easter Egg: alternar visibilidad del contenido
  const toggleContent = useCallback(() => {
    setContentVisible(prev => !prev);
  }, []);

  useEffect(() => {
    setCurrentDate(new Date());
  }, []);

  /**
   * Submite el formulario oculto para iniciar la carga de datos.
   * Maneja 3 casos:
   * 1. Ubicación normalizada desde localStorage (lat+lon+cityKey ya procesados)
   * 2. Coordenadas GPS crudas (serán normalizadas en el server action)
   * 3. Fallback a Nueva York
   */
  const submitInitialForm = useCallback(
    async (options?: { lat?: number; lon?: number; normalizedLocation?: NormalizedLocation }) => {
      if (!initialFetchFormRef.current) return;
      const form = initialFetchFormRef.current;

      const latInput = form.elements.namedItem('latitude') as HTMLInputElement;
      const lonInput = form.elements.namedItem('longitude') as HTMLInputElement;
      const locInput = form.elements.namedItem('location') as HTMLInputElement;
      const cityKeyInput = form.elements.namedItem('cityKey') as HTMLInputElement;

      if (options?.normalizedLocation) {
        // Usar ubicación normalizada (desde localStorage o server action previo)
        const { lat, lon, cityKey, displayName } = options.normalizedLocation;
        latInput.value = lat.toString();
        lonInput.value = lon.toString();
        locInput.value = displayName;
        cityKeyInput.value = cityKey;
      } else if (options?.lat !== undefined && options?.lon !== undefined) {
        // GPS crudo: se normalizará en el server action
        latInput.value = options.lat.toString();
        lonInput.value = options.lon.toString();
        locInput.value = '';
        cityKeyInput.value = '';
      } else {
        // Fallback: búsqueda por nombre de ciudad
        locInput.value = 'New York';
        latInput.value = '';
        lonInput.value = '';
        cityKeyInput.value = '';
      }

      form.requestSubmit();
    },
    []
  );

  const handleDaySelect = useCallback(
    (day: DailyForecast) => {
      if (!weatherData) return;
      const newDisplayData: DisplayWeather = {
        ...day,
        location: weatherData.current.location,
        timezone: weatherData.current.timezone,
        latitude: weatherData.current.latitude,
      };
      setDisplayData(newDisplayData);
      setHourlyData(day.hourly);
      setSelectedDayId(day.dt);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [weatherData]
  );

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
      position => {
        submitInitialForm({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        });
      },
      () => {
        setIsLoading(false);
        toast({
          title: t('errorTitle'),
          description: t('geolocationError'),
          variant: 'destructive',
        });
      }
    );
  }, [submitInitialForm, toast, t]);

  // Carga inicial: intentar localStorage → GPS → fallback
  useEffect(() => {
    if (isInitialFetchDone.current) return;
    isInitialFetchDone.current = true;

    // Verificar si hay una ubicación normalizada guardada en localStorage
    const cachedLocation = getCachedLocation();
    if (cachedLocation) {
      submitInitialForm({ normalizedLocation: cachedLocation });
      return;
    }

    // Si no hay caché, intentar geolocalización GPS
    navigator.geolocation.getCurrentPosition(
      position =>
        submitInitialForm({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        }),
      () => submitInitialForm() // Fallback: New York
    );
  }, [submitInitialForm]);

  // Reaccionar al resultado del server action
  useEffect(() => {
    if (state.success && state.weatherData) {
      setWeatherData(state.weatherData);
      setDisplayData(state.weatherData.current);
      setHourlyData(state.weatherData.hourly);
      setSelectedDayId('today');
      setError(null);
      setLastUpdated(state.weatherData.lastUpdated);
      setIsLoading(false);

      // Persistir la ubicación normalizada en localStorage para futuras visitas
      if (state.normalizedLocation) {
        setCachedLocation(state.normalizedLocation);
      }
    } else if (!state.success && state.message) {
      if (state.message === 'noLocationProvided' && weatherData) return;
      setError(state);
      setIsLoading(false);
    }
  }, [state]); // eslint-disable-line react-hooks/exhaustive-deps

  // Generar imagen de fondo con IA cuando cambia la ciudad o el clima
  useEffect(() => {
    const location = weatherData?.current?.location;
    const description = weatherData?.current?.description;
    if (location && description) {
      const generate = async () => {
        try {
          const response = await generateCityBackgroundAction(location, description);
          if (response.imageUrl) setBackgroundImage(response.imageUrl);
          else setBackgroundImage('');
        } catch (e) {
          console.error('Error generando imagen de fondo:', e);
          setBackgroundImage('');
        }
      };
      generate();
    }
  }, [weatherData?.current?.location, weatherData?.current?.description]);

  const latitudeForMoon = weatherData?.latitude;
  const owmRawDaily = weatherData?.owmRawDaily;

  return (
    <div className={cn('relative flex flex-col min-h-dvh transition-all duration-700', !contentVisible && 'overflow-hidden')}>

      {/* 1. Capa de Fondo */}
      <div className="fixed inset-0 z-0 bg-background" onClick={toggleContent}>
        {backgroundImage ? (
          <NextImage
            src={backgroundImage}
            alt={
              weatherData
                ? `${t('weatherBackgroundFor')} ${weatherData.current.location} - ${t(`weather.${weatherData.current.description}`)}`
                : 'Weather background'
            }
            fill
            className="object-cover transition-opacity duration-1000 ease-in-out"
            priority
            unoptimized={backgroundImage.startsWith('http')}
          />
        ) : (
          <div className="h-full w-full bg-background" />
        )}
        <div className="absolute inset-0 bg-black/50" />
      </div>

      <h1 className="sr-only">
        {t('appTitle')} - {t('appDescription')}
      </h1>

      {/* 2. Estructura de UI */}
      <div className="relative z-10 flex flex-col min-h-dvh pointer-events-none">

        {/* Header */}
        <header className="shrink-0 pointer-events-auto" onClick={e => e.stopPropagation()}>
          <Header />
        </header>

        {/* Formulario oculto para carga inicial - incluye campo cityKey */}
        <form ref={initialFetchFormRef} action={formAction} className="hidden">
          <input type="hidden" name="latitude" />
          <input type="hidden" name="longitude" />
          <input type="hidden" name="location" />
          <input type="hidden" name="cityKey" />
        </form>

        {/* Main */}
        <main
          className={cn(
            'flex-1 flex flex-col items-center justify-center w-full min-h-[800px] transition-all duration-500 pointer-events-auto',
            !contentVisible ? 'opacity-0 invisible' : 'opacity-100 visible'
          )}
          onClick={toggleContent}
        >
          <div className="w-full max-w-4xl px-4 py-8 mx-auto">
            <div className="mb-8 relative" onClick={e => e.stopPropagation()}>
              <SearchControls
                formAction={formAction}
                onRefreshLocation={handleRefreshLocation}
                locale={locale}
              />
            </div>

            <div className="w-full flex flex-col items-center">
              {isLoading ? (
                <div className="w-full" onClick={e => e.stopPropagation()}>
                  <LoadingDisplay />
                </div>
              ) : error && !weatherData ? (
                <div onClick={e => e.stopPropagation()}>
                  <ErrorDisplay error={error} t={t} />
                </div>
              ) : weatherData && displayData ? (
                <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in">
                  <div className="lg:col-span-3" onClick={e => e.stopPropagation()}>
                    <GlassCard id="current-weather">
                      <CurrentWeatherComponent
                        data={displayData}
                        hourlyData={hourlyData}
                        locale={locale}
                        lastUpdated={lastUpdated}
                      />
                    </GlassCard>
                  </div>

                  <div className="lg:col-span-3 border-none" onClick={e => e.stopPropagation()}>
                    <AdBanner />
                  </div>

                  <div className="lg:col-span-3" onClick={e => e.stopPropagation()}>
                    <GlassCard id="forecast">
                      <Forecast
                        data={weatherData.forecast}
                        onDaySelect={handleDaySelect}
                        onShowToday={handleShowToday}
                        selectedDayId={selectedDayId}
                      />
                    </GlassCard>
                  </div>

                  {currentDate && latitudeForMoon !== undefined && !isNaN(currentDate.getTime()) && (
                    <div className="lg:col-span-3" onClick={e => e.stopPropagation()}>
                      <GlassCard id="moon-calendar">
                        <MoonCalendar
                          date={currentDate}
                          latitude={latitudeForMoon}
                          owmRawDaily={owmRawDaily}
                          timezone={displayData?.timezone}
                        />
                      </GlassCard>
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer
          className={cn(
            'shrink-0 w-full transition-opacity duration-500',
            !contentVisible ? 'opacity-0 invisible' : 'opacity-100 visible'
          )}
        >
          <div className="pointer-events-auto" onClick={e => e.stopPropagation()}>
            <Footer />
          </div>
        </footer>
      </div>
    </div>
  );
}
