import { dictionaries, Locale, defaultLocale } from '@/lib/i18n';

export function StructuredData({ lang }: { lang?: string }) {
    const locale = (lang as Locale) || defaultLocale;
    const dict = dictionaries[locale] || dictionaries[defaultLocale];

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "WebApplication",
        "name": "MeteoClan",
        "url": "https://clima.clancig.com.ar",
        "description": dict.seoDescription,
        "applicationCategory": "WeatherApplication",
        "operatingSystem": "Web",
        "abstract": dict.appDescription,
        "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
        },
        "author": {
            "@type": "Person",
            "name": "Damian Clancig",
            "url": "https://www.clancig.com.ar"
        }
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
    );
}
