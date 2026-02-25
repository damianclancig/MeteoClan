'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { dictionaries, Locale, defaultLocale } from '@/lib/i18n';

interface TranslationContextType {
    locale: Locale;
    setLocale: (locale: Locale) => void;
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

export function TranslationProvider({ children, initialLocale }: { children: ReactNode, initialLocale?: Locale }) {
    const [locale, setLocaleState] = useState<Locale>(initialLocale || defaultLocale);

    useEffect(() => {
        // Run auto-detection if we don't have a forced language in URL (param lang)
        // We now consider 'es' as the neutral starting point for hydration matching
        const hasUrlParam = typeof window !== 'undefined' && window.location.search.includes('lang=');

        if (!hasUrlParam) {
            const savedLocale = typeof window !== 'undefined' ? localStorage.getItem('meteoclan-locale') as Locale : null;

            if (savedLocale && savedLocale in dictionaries) {
                setLocaleState(savedLocale);
            } else if (typeof window !== 'undefined' && navigator.language) {
                const browserLang = navigator.language.split('-')[0] as Locale;
                if (browserLang in dictionaries) {
                    setLocaleState(browserLang);
                }
            }
        }
    }, [initialLocale]);

    const setLocale = useCallback((newLocale: Locale) => {
        setLocaleState(newLocale);
        if (typeof window !== 'undefined') {
            localStorage.setItem('meteoclan-locale', newLocale);
        }
    }, []);

    return (
        <TranslationContext.Provider value={{ locale, setLocale }}>
            {children}
        </TranslationContext.Provider>
    );
}

export function useTranslationContext() {
    const context = useContext(TranslationContext);
    if (context === undefined) {
        throw new Error('useTranslationContext must be used within a TranslationProvider');
    }
    return context;
}
