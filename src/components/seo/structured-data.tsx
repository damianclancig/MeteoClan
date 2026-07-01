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
