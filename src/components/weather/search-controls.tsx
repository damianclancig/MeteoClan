
'use client';

import { useState, useEffect, useRef, useCallback, useTransition } from 'react';
import { useFormStatus } from 'react-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Loader, MapPin } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';
import type { CitySuggestion } from '@/lib/types';
import { getCitySuggestions } from '@/app/actions';
import { normalizeLocation } from '@/services/geocoding';

function SubmitButton() {
  const { pending } = useFormStatus();
  const { t } = useTranslation();

  return (
    <Button type="submit" disabled={pending} aria-label={t('search')}>
      {pending ? <Loader className="animate-spin" /> : <Search />}
    </Button>
  );
}

interface SearchControlsProps {
  formAction: (payload: FormData) => void;
  onRefreshLocation: () => void;
  locale: string;
}

export function SearchControls({ formAction, onRefreshLocation, locale }: SearchControlsProps) {
  const { t } = useTranslation();
  const [isPending, startTransition] = useTransition();
  const { pending } = useFormStatus();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<CitySuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const handleSuggestionClick = (suggestion: CitySuggestion) => {
    if (!formRef.current) return;

    // Generar el cityKey a partir de los datos de la sugerencia
    const normalized = normalizeLocation({
      name: suggestion.name.split(',')[0]?.trim() ?? suggestion.name,
      lat: suggestion.lat,
      lon: suggestion.lon,
      country: suggestion.name.split(',').at(-1)?.trim() ?? '',
      state: suggestion.name.split(',')[1]?.trim(),
    });

    const formData = new FormData(formRef.current);
    formData.set('location', suggestion.name);
    formData.set('latitude', suggestion.lat.toString());
    formData.set('longitude', suggestion.lon.toString());
    formData.set('cityKey', normalized.cityKey);

    startTransition(() => {
      formAction(formData);
    });

    setQuery('');
    setShowSuggestions(false);
  };

  const handleRefresh = () => {
    setQuery('');
    setShowSuggestions(false);
    onRefreshLocation();
  };

  const handleFormAction = (formData: FormData) => {
    formAction(formData);
    setQuery('');
    setShowSuggestions(false);
  };

  useEffect(() => {
    if (query.length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const debounceTimeout = setTimeout(async () => {
      const newSuggestions = await getCitySuggestions(query, locale);
      setSuggestions(newSuggestions);
      setShowSuggestions(newSuggestions.length > 0);
    }, 400); // 400ms de debounce para OWM Geocoding

    return () => clearTimeout(debounceTimeout);
  }, [query, locale]);

  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (
      searchContainerRef.current &&
      !searchContainerRef.current.contains(event.target as Node)
    ) {
      setShowSuggestions(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [handleClickOutside]);

  return (
    <div ref={searchContainerRef} className="flex items-center space-x-2 w-full">
      <Button
        variant="ghost"
        size="icon"
        onClick={handleRefresh}
        disabled={pending || isPending}
        aria-label={t('useMyLocationTooltip')}
      >
        <MapPin />
      </Button>
      <form ref={formRef} action={handleFormAction} className="relative flex flex-grow items-center space-x-2">
        <Input
          type="text"
          name="location"
          placeholder={t('searchPlaceholder')}
          className="bg-card/80 border-border/60 focus:ring-ring"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length >= 3 && setShowSuggestions(true)}
          autoComplete="off"
        />
        {/* Campos ocultos: lat, lon y cityKey son populados por selección de sugerencia */}
        <input type="hidden" name="latitude" />
        <input type="hidden" name="longitude" />
        <input type="hidden" name="cityKey" />

        <SubmitButton />

        {showSuggestions && (
          <div className="absolute top-full mt-2 w-full bg-popover rounded-md shadow-lg border border-border/60 z-50">
            <ul>
              {suggestions.map((s, index) => (
                <li
                  key={`${s.lat}-${s.lon}-${index}`}
                  className="px-4 py-2 cursor-pointer hover:bg-accent hover:text-accent-foreground"
                  onClick={() => handleSuggestionClick(s)}
                >
                  {s.name}
                </li>
              ))}
            </ul>
          </div>
        )}
      </form>
    </div>
  );
}
