"use client";

import { useTranslation } from "@/hooks/use-translation";
import { SupportDialog } from "./support-dialog";

export function Footer() {
  const currentYear = new Date().getFullYear();
  const { t } = useTranslation();

  return (
    <>
      <footer className="w-full text-foreground/60 border-t border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto grid grid-cols-1 md:grid-cols-3 items-center gap-4 py-6 px-4">

          {/* Copyright & Brand - Left */}
          <div className="text-sm order-2 md:order-1 text-center md:text-left">
            <p className="font-medium text-foreground/80">
              © {currentYear} {t("footer.rights")}
            </p>
            <p className="text-xs mt-1">
              {t("footer.designedBy")}{" "}
              <a
                href="https://www.clancig.com.ar"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-foreground/80"
              >
                clancig.com.ar
              </a>
            </p>
          </div>

          {/* Credits - Center */}
          <div className="text-[10px] sm:text-xs order-1 md:order-2 text-center flex flex-col gap-1 px-2">
            <p>
              {t('attribution.weather')}{' '}
              <a href="https://open-meteo.com/" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground/80">
                Open-Meteo
              </a>
              . {t('attribution.geocoding')}{' '}
              <a href="https://www.bigdatacloud.com/" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground/80">
                BigDataCloud
              </a>
              .
            </p>
            <p>
              {t('attribution.images')}{' '}
              <a href="https://ai.google.dev/" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground/80">
                Google Gemini
              </a>
              . {t('attribution.moon')}
            </p>
          </div>

          {/* Support - Right */}
          <div className="flex items-center justify-center md:justify-end order-3">
            <SupportDialog />
          </div>

        </div>
      </footer>
    </>
  );
}
