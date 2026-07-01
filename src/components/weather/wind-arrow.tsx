/*
 * Copyright 2026 Clancig FullstackWeb
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


'use client';

import { Navigation } from 'lucide-react';
import type { Locale } from '@/lib/i18n';

interface WindArrowProps {
  degrees: number;
  locale: Locale;
}

const directions: Record<Locale, string[]> = {
    en: ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'],
    es: ['N', 'NE', 'E', 'SE', 'S', 'SO', 'O', 'NO'],
    pt: ['N', 'NE', 'L', 'SE', 'S', 'SO', 'O', 'NO'],
};

const getWindDirection = (degrees: number, locale: Locale) => {
  const localeDirections = directions[locale] || directions['en'];
  const index = Math.round(degrees / 45) % 8;
  return localeDirections[index];
};

export function WindArrow({ degrees, locale }: WindArrowProps) {
  const direction = getWindDirection(degrees, locale);

  return (
    <div className="flex items-center gap-1">
      <Navigation
        className="w-3 h-3 transition-transform duration-500"
        style={{ transform: `rotate(${degrees - 45}deg)` }}
      />
      <span className="text-xs font-medium">{direction}</span>
    </div>
  );
}
