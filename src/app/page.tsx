import type { Metadata } from 'next';
import { WeatherMain } from '@/components/weather/weather-main';
import { dictionaries, Locale, defaultLocale } from '@/lib/i18n';

interface PageProps {
  searchParams: Promise<{ lang?: string }>;
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const params = await searchParams;
  const lang = (params.lang as Locale) || defaultLocale;
  const dict = dictionaries[lang] || dictionaries[defaultLocale];

  return {
    title: dict.seoTitle,
    description: dict.seoDescription,
    openGraph: {
      title: dict.seoTitle,
      description: dict.appDescription,
    },
    twitter: {
      title: dict.seoTitle,
      description: dict.appDescription,
    },
  };
}

import { TranslationProvider } from '@/components/layout/translation-provider';
import { StructuredData } from '@/components/seo/structured-data';

export default async function Home({ searchParams }: PageProps) {
  const params = await searchParams;
  const lang = params.lang as Locale; // No default here to allow detection in Provider

  return (
    <TranslationProvider initialLocale={lang}>
      <StructuredData lang={lang} />
      <WeatherMain initialLocale={lang} />
    </TranslationProvider>
  );
}
