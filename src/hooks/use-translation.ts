
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
