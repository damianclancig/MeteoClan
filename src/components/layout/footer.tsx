"use client";

import { useState } from "react";
import { useTranslation } from "@/hooks/use-translation";
import { SupportDialog } from "./support-dialog";
import { LegalDialog } from "./legal-dialog";

export function Footer() {
  const currentYear = new Date().getFullYear();
  const { t } = useTranslation();

  const [legalOpen, setLegalOpen] = useState(false);
  const [legalTab, setLegalTab] = useState<"terms" | "privacy">("terms");

  const openLegal = (tab: "terms" | "privacy") => {
    setLegalTab(tab);
    setLegalOpen(true);
  };

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
              <a href="https://openweathermap.org/" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground/80">
                OpenWeatherMap
              </a>
              . {t('attribution.geocoding')}{' '}
              <a href="https://openweathermap.org/api/geocoding-api" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground/80">
                OWM Geocoding
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
            <p className="mt-1 flex items-center justify-center gap-3">
              <button
                onClick={() => openLegal("terms")}
                className="underline hover:text-foreground/80 transition-colors"
              >
                {t("legal.link_terms")}
              </button>
              <span aria-hidden="true">·</span>
              <button
                onClick={() => openLegal("privacy")}
                className="underline hover:text-foreground/80 transition-colors"
              >
                {t("legal.link_privacy")}
              </button>
            </p>
          </div>

          {/* Support - Right */}
          <div className="flex items-center justify-center md:justify-end order-3">
            <SupportDialog />
          </div>

        </div>
      </footer>

      <LegalDialog
        initialTab={legalTab}
        open={legalOpen}
        onOpenChange={setLegalOpen}
      />
    </>
  );
}
