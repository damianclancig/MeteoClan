
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from "@/components/ui/toaster"
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from "@vercel/speed-insights/next"
import Script from 'next/script';
import { dictionaries, defaultLocale } from '@/lib/i18n';


const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

// Use the production URL as the base for SEO, but allow override via environment variable.
const APP_URL = new URL(process.env.APP_URL || 'https://clima.clancig.com.ar');
const GOOGLE_ADSENSE_PUB_ID = process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_PUB_ID;

export async function generateMetadata(): Promise<Metadata> {
  const dict = dictionaries[defaultLocale];

  return {
    title: {
      default: dict.seoTitle,
      template: `%s | ${dict.appName}`,
    },
    description: dict.seoDescription,
    metadataBase: APP_URL,
    applicationName: dict.appName,
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
      title: dict.seoTitle,
      description: dict.seoDescription,
      siteName: dict.appName,
      images: [
        {
          url: '/assets/logo_big.png',
          width: 1200,
          height: 630,
          alt: `${dict.appName} - ${dict.appDescription}`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: dict.seoTitle,
      description: dict.seoDescription,
      images: ['/assets/logo_big.png'],
    },
    appleWebApp: {
      capable: true,
      statusBarStyle: 'default',
      title: dict.appName,
    },
    formatDetection: {
      telephone: false,
    },
    icons: {
      icon: [
        { url: '/favicon.png', type: 'image/png' },
      ],
      shortcut: '/favicon.png',
      apple: '/favicon.png',
    },
  };
}


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://image.pollinations.ai" />
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
