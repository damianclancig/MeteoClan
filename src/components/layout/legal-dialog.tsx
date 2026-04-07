"use client";

import { useMemo } from "react";
import { useTranslation } from "@/hooks/use-translation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";

type LegalTab = "terms" | "privacy";

interface LegalDialogProps {
  initialTab?: LegalTab;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function LegalSection({ title, content }: { title: string; content: string }) {
  return (
    <div className="mb-5">
      <h3 className="font-semibold text-foreground mb-1 text-sm">{title}</h3>
      <p className="text-foreground/70 text-xs leading-relaxed whitespace-pre-line">{content}</p>
    </div>
  );
}

export function LegalDialog({ initialTab = "terms", open, onOpenChange }: LegalDialogProps) {
  const { t } = useTranslation();

  const termsSections = useMemo(() => [
    { title: t("legal.terms.s1_title"), content: t("legal.terms.s1_content") },
    { title: t("legal.terms.s2_title"), content: t("legal.terms.s2_content") },
    { title: t("legal.terms.s3_title"), content: t("legal.terms.s3_content") },
    { title: t("legal.terms.s4_title"), content: t("legal.terms.s4_content") },
    { title: t("legal.terms.s5_title"), content: t("legal.terms.s5_content") },
    { title: t("legal.terms.s6_title"), content: t("legal.terms.s6_content") },
  ], [t]);

  const privacySections = useMemo(() => [
    { title: t("legal.privacy.s1_title"), content: t("legal.privacy.s1_content") },
    { title: t("legal.privacy.s2_title"), content: t("legal.privacy.s2_content") },
    { title: t("legal.privacy.s3_title"), content: t("legal.privacy.s3_content") },
    { title: t("legal.privacy.s4_title"), content: t("legal.privacy.s4_content") },
    { title: t("legal.privacy.s5_title"), content: t("legal.privacy.s5_content") },
    { title: t("legal.privacy.s6_title"), content: t("legal.privacy.s6_content") },
  ], [t]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100vw-2rem)] sm:max-w-lg p-4 sm:p-6 flex flex-col max-h-[85dvh]">
        <DialogHeader className="shrink-0">
          <DialogTitle className="text-lg sm:text-xl text-center">
            {t("legal.dialog_title")}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue={initialTab} className="flex flex-col flex-1 min-h-0 mt-2">
          <TabsList className="grid grid-cols-2 shrink-0">
            <TabsTrigger value="terms" className="text-xs sm:text-sm">
              {t("legal.tab_terms")}
            </TabsTrigger>
            <TabsTrigger value="privacy" className="text-xs sm:text-sm">
              {t("legal.tab_privacy")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="terms" className="flex-1 min-h-0 mt-3">
            <ScrollArea className="h-full max-h-[55dvh] pr-2">
              <p className="text-[10px] text-foreground/50 mb-4">{t("legal.last_updated")}</p>
              {termsSections.map((s) => (
                <LegalSection key={s.title} title={s.title} content={s.content} />
              ))}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="privacy" className="flex-1 min-h-0 mt-3">
            <ScrollArea className="h-full max-h-[55dvh] pr-2">
              <p className="text-[10px] text-foreground/50 mb-4">{t("legal.last_updated")}</p>
              {privacySections.map((s) => (
                <LegalSection key={s.title} title={s.title} content={s.content} />
              ))}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
