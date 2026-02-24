"use client";

import { useTranslation } from "@/hooks/use-translation";
import { SupportDialog } from "./support-dialog";

export function Footer() {
  const currentYear = new Date().getFullYear();
  const { t } = useTranslation();

  return (
    <>
      <footer className="w-full text-foreground/60">
        <div className="container mx-auto flex items-center justify-between py-4 px-4">
          <div className="text-sm">
            <p>
              © {currentYear} {t("footer.rights")}
            </p>
            <p>
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
          <div className="flex items-center">
            <SupportDialog />
          </div>
        </div>
      </footer>
    </>
  );
}
