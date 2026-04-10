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
import { InstallBanner } from '@/components/pwa/install-banner';

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

const TEST_OPTIONS = [
  { value: 'real', label: '--- DATOS REALES ---' },
  // Tormentas (2xx)
  { value: '200', label: '200: Tormenta Lluvia Ligera' },
  { value: '201', label: '201: Tormenta Lluvia' },
  { value: '202', label: '202: Tormenta Lluvia Fuerte' },
  { value: '210', label: '210: Tormenta Ligera' },
  { value: '211', label: '211: Tormenta' },
  { value: '212', label: '212: Tormenta Fuerte' },
  { value: '230', label: '230: Tormenta Llovizna Ligera' },
  { value: '231', label: '231: Tormenta Llovizna' },
  { value: '232', label: '232: Tormenta Llovizna Fuerte' },
  // Llovizna (3xx)
  { value: '300', label: '300: Llovizna Ligera' },
  { value: '301', label: '301: Llovizna' },
  { value: '310', label: '310: Llovizna Lluvia Ligera' },
  { value: '313', label: '313: Llovizna/Lluvia' },
  // Lluvia (5xx)
  { value: '500', label: '500: Lluvia Ligera' },
  { value: '501', label: '501: Lluvia Moderada' },
  { value: '502', label: '502: Lluvia Fuerte' },
  { value: '503', label: '503: Lluvia Muy Fuerte' },
  { value: '504', label: '504: Lluvia Extrema' },
  { value: '511', label: '511: Lluvia Gélida' },
  { value: '520', label: '520: Chubascos Ligeros' },
  { value: '521', label: '521: Chubascos' },
  // Nieve (6xx)
  { value: '600', label: '600: Nieve Ligera' },
  { value: '601', label: '601: Nieve' },
  { value: '602', label: '602: Nieve Fuerte' },
  { value: '611', label: '611: Aguanieve' },
  { value: '612', label: '612: Chubascos Aguanieve' },
  { value: '615', label: '615: Lluvia y Nieve' },
  { value: '620', label: '620: Chubascos Nieve' },
  // Atmósfera (7xx)
  { value: '701', label: '701: Neblina' },
  { value: '711', label: '711: Humo' },
  { value: '721', label: '721: Calima' },
  { value: '741', label: '741: Niebla' },
  { value: '781', label: '781: TORNADO 🌪️' },
  // Nubes (8xx)
  { value: '800', label: '800: Cielo Despejado' },
  { value: '801', label: '801: Pocas Nubes' },
  { value: '802', label: '802: Nubes Dispersas' },
  { value: '803', label: '803: Nuboso' },
  { value: '804', label: '804: Cubierto' },
];

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


  const parseDateStringForMoon = (dt: string | number) => {
    const dtStr = String(dt);
    if (!dtStr.includes('T')) {
      return new Date(`${dtStr}T12:00:00Z`);
    }
    return new Date(dtStr);
  };

  const [lastUpdated, setLastUpdated] = useState<string>('');

  const [contentVisible, setContentVisible] = useState(true);

  // MODO TEST (v5.0): Centralizado en weather-main
  const [testMode, setTestMode] = useState<{
    weather: string;
    astro: 'auto' | 'day' | 'night';
  }>({
    weather: 'real',
    astro: 'auto'
  });

  const showDevToolbar = process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_VERCEL_ENV === 'preview';

  const initialFetchFormRef = useRef<HTMLFormElement>(null);
  const isInitialFetchDone = useRef(false);

  // Easter Egg: alternar visibilidad del contenido
  const toggleContent = useCallback(() => {
    setContentVisible(prev => !prev);
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

  const [isBackgroundLoading, setIsBackgroundLoading] = useState(false);

  // Generar imagen de fondo con IA cuando cambia la ciudad o el clima
  useEffect(() => {
    const location = weatherData?.current?.location;
    const condition = weatherData?.current?.description; // Clave de traducción (ej: 'clear_sky')
    const main = weatherData?.current?.main; // Categoría principal (ej: 'Clear')

    if (location && condition) {
      const generate = async () => {
        setIsBackgroundLoading(true);
        try {
          const device = window.innerWidth < 768 ? 'mobile' : 'desktop';
          const params = new URLSearchParams({
            city: location,
            condition: condition,
            main: main || '',
            device: device
          });

          const response = await fetch(`/api/ai-background?${params.toString()}`);
          const data = await response.json();

          if (data.imageBase64) {
            setBackgroundImage(data.imageBase64);
          } else {
            setBackgroundImage('');
          }
        } catch (e) {
          console.error('Error generando imagen de fondo:', e);
          setBackgroundImage('');
        } finally {
          setIsBackgroundLoading(false);
        }
      };
      generate();
    }
  }, [weatherData?.current?.location, weatherData?.current?.description, weatherData?.current?.main]);

  const latitudeForMoon = weatherData?.latitude;
  const owmRawDaily = weatherData?.owmRawDaily;

  return (
    <div className={cn('relative flex flex-col min-h-dvh transition-all duration-700', !contentVisible && 'overflow-hidden')}>

      {/* 1. Capa de Fondo */}
      <div className="fixed inset-0 z-0 bg-background" onClick={toggleContent}>
        {/* Skeleton de Gradiente Dinámico */}
        {isBackgroundLoading && (
          <div
            className={cn(
              "absolute inset-0 transition-opacity duration-1000 animate-pulse bg-gradient-to-br",
              weatherData?.current?.main === 'Clear' ? "from-amber-400 to-blue-500" :
                weatherData?.current?.main === 'Clouds' ? "from-gray-400 to-slate-600" :
                  weatherData?.current?.main === 'Rain' ? "from-blue-700 to-slate-900" :
                    weatherData?.current?.main === 'Thunderstorm' ? "from-purple-900 to-black" :
                      weatherData?.current?.main === 'Snow' ? "from-blue-100 to-white" :
                        "from-slate-700 to-slate-900"
            )}
          />
        )}

        {backgroundImage ? (
          <NextImage
            src={backgroundImage}
            alt={
              weatherData
                ? `${t('weatherBackgroundFor')} ${weatherData.current.location} - ${t(`weather.${weatherData.current.description}`)}`
                : 'Weather background'
            }
            fill
            className={cn(
              "object-cover transition-opacity duration-1000 ease-in-out",
              isBackgroundLoading ? "opacity-0" : "opacity-100"
            )}
            priority
            unoptimized={backgroundImage.startsWith('data:')}
          />
        ) : (
          <div className="h-full w-full bg-background" />
        )}
        <div className="absolute inset-0 bg-black/40" />
      </div>

      <h1 className="sr-only">
        {t('appTitle')} - {t('appDescription')}
      </h1>

      {/* 2. Estructura de UI */}
      <div className="relative z-10 flex flex-col min-h-dvh pointer-events-none">

        {/* Header e InstallBanner persistentes */}
        <div className="sticky top-0 z-50 shrink-0 pointer-events-auto" onClick={e => e.stopPropagation()}>
          <Header />
          <InstallBanner />
        </div>

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
                    {/* DEV TOOLBAR (v5.0): Entre buscador y card */}
                    {showDevToolbar && (
                      <div className="w-full flex flex-wrap items-center justify-center gap-3 mt-2 mb-2 animate-in fade-in duration-300">
                        <div className="flex bg-white/5 backdrop-blur-md rounded-full border border-white/10 p-0.5">
                          {[
                            { id: 'auto', label: 'Auto' },
                            { id: 'day', label: '☀️' },
                            { id: 'night', label: '🌙' }
                          ].map((mode) => (
                            <button
                              key={mode.id}
                              onClick={() => setTestMode(prev => ({ ...prev, astro: mode.id as any }))}
                              className={cn(
                                "px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase transition-all duration-300",
                                testMode.astro === mode.id 
                                  ? "bg-primary text-white scale-105" 
                                  : "text-white/30 hover:text-white/60"
                              )}
                            >
                              {mode.label}
                            </button>
                          ))}
                        </div>

                        <select
                          value={testMode.weather}
                          onChange={(e) => setTestMode(prev => ({ ...prev, weather: e.target.value }))}
                          className="bg-white/5 backdrop-blur-sm text-white/60 border border-white/10 text-[9px] rounded-full px-3 py-1 cursor-pointer outline-none hover:bg-white/10 transition-colors uppercase font-black"
                        >
                          {TEST_OPTIONS.map(opt => (
                            <option key={opt.value} value={opt.value} className="bg-slate-900 text-white">
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    <div className={cn(
                      "transition-all duration-700 ease-in-out",
                      contentVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10 pointer-events-none"
                    )}>
                      <GlassCard id="current-weather" className="w-full overflow-hidden relative">
                        <CurrentWeatherComponent
                          data={displayData}
                          hourlyData={hourlyData}
                          locale={locale}
                          lastUpdated={lastUpdated}
                          testMode={testMode}
                        />
                      </GlassCard>
                    </div>
                  </div>

                  <div className="lg:col-span-3 border-none" onClick={e => e.stopPropagation()}>
                    <AdBanner />
                  </div>

                  <div className="lg:col-span-3" onClick={e => e.stopPropagation()}>
                    <GlassCard id="forecast" className="scroll-mt-20 lg:scroll-mt-24 overflow-hidden w-full relative">
                      <Forecast
                        data={weatherData.forecast}
                        onDaySelect={handleDaySelect}
                        onShowToday={handleShowToday}
                        selectedDayId={selectedDayId}
                      />
                    </GlassCard>
                  </div>

                  {latitudeForMoon !== undefined && (
                    <div className="lg:col-span-3" onClick={e => e.stopPropagation()}>
                      <GlassCard id="moon-calendar" className="scroll-mt-20 lg:scroll-mt-24">
                        <MoonCalendar
                          date={new Date()}
                          latitude={latitudeForMoon}
                          owmRawDaily={owmRawDaily}
                          timezone={weatherData.current.timezone}
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
