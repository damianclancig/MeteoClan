
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from "@/components/ui/toaster"
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from "@vercel/speed-insights/next"
import Script from 'next/script';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

// Use the production URL as the base for SEO, but allow override via environment variable.
const APP_URL = new URL(process.env.APP_URL || 'https://clima.clancig.com.ar');
const GOOGLE_ADSENSE_PUB_ID = process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_PUB_ID;

export const metadata: Metadata = {
  title: {
    default: 'WeatherWise - Pronóstico del Tiempo Preciso con IA',
    template: '%s | WeatherWise',
  },
  description: 'Consulta el clima con WeatherWise: pronósticos precisos por hora, búsqueda global y fondos espectaculares generados por IA (Gemini). Datos de temperatura, viento, humedad y fases lunares en tiempo real.',
  metadataBase: APP_URL,
  applicationName: 'WeatherWise',
  keywords: [
    'clima', 'tiempo', 'pronóstico', 'temperatura', 'weather', 'forecast', 'ia', 'ai',
    'inteligencia artificial', 'gemini', 'multilenguaje', 'multi-idioma', 'fases lunares',
    'direccion del viento', 'pronóstico del tiempo por hora', 'clima hoy', 'pronóstico a 7 días',
    'mapa del tiempo', 'IA generativa paisajes', 'hourly weather', '7 day forecast',
    'AI weather app', 'Generative AI weather', 'clima preciso', 'meteorología',
    'weather forecast worldwide', 'real-time weather updates', 'clima en vivo'
  ],
  authors: [{ name: 'Clancig FullstackDev', url: new URL('https://www.clancig.com.ar') }],
  creator: 'Clancig FullstackDev',
  alternates: {
    canonical: '/',
    languages: {
      'es-AR': '/?lang=es',
      'en-US': '/?lang=en',
      'pt-BR': '/?lang=pt',
    },
  },
  openGraph: {
    type: 'website',
    url: APP_URL,
    title: 'WeatherWise - El Pronóstico del Tiempo Reimaginado con IA',
    description: 'Experimenta el clima como nunca antes. Pronósticos precisos combinados con paisajes dinámicos generados por IA que reflejan el estado real del tiempo en cualquier lugar del mundo.',
    siteName: 'WeatherWise',
    images: [
      {
        url: '/og-image.webp',
        width: 1200,
        height: 630,
        alt: 'WeatherWise - Visualización del clima con Inteligencia Artificial',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'WeatherWise - Pronóstico del Tiempo e IA',
    description: 'Datos meteorológicos precisos y fondos generados por IA. La forma más visual de ver el clima.',
    images: ['/og-image.webp'],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'WeatherWise',
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: 'any' }
    ],
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
  manifest: '/manifest.webmanifest',
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html className="dark" suppressHydrationWarning>
      <head>
        {GOOGLE_ADSENSE_PUB_ID && (
          <Script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${GOOGLE_ADSENSE_PUB_ID}`}
            crossOrigin="anonymous"
            strategy="afterInteractive"
          />
        )}
      </head>
      <body className={cn('font-sans antialiased', inter.variable)}>
        {children}
        <Toaster />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
