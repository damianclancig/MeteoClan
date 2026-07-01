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

import { useCallback } from 'react';
import { dictionaries, defaultLocale } from '@/lib/i18n';
import { useTranslationContext } from '@/components/layout/translation-provider';

export function useTranslation() {
  const { locale, setLocale } = useTranslationContext();

  const t = useCallback((key: string, values?: Record<string, string | number>): string => {
    if (key.includes('undefined')) {
      return key;
    }
    const dict = dictionaries[locale] || dictionaries[defaultLocale];
    const keys = key.split('.');
    let result: any = dict;
    for (const k of keys) {
      result = result?.[k];
      if (result === undefined) {
        return key;
      }
    }

    let str = result as string;

    if (values) {
      Object.entries(values).forEach(([k, v]) => {
        str = str.replace(`{${k}}`, String(v));
      });
    }

    return str || key;
  },
    [locale]
  );

  return { t, locale, setLocale };
}
