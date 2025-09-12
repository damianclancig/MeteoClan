
'use client';

import { Github, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useTranslation } from '@/hooks/use-translation';
import { SupportDialog } from './support-dialog';
import { useState } from 'react';

export function Footer() {
  const currentYear = new Date().getFullYear();
  const { t } = useTranslation();
  const [isSupportDialogOpen, setIsSupportDialogOpen] = useState(false);

  return (
    <>
      <footer className="w-full border-t border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 text-foreground/60">
        <div className="container mx-auto flex items-center justify-between py-4 px-4">
          <div className="text-sm">
             <p>© {currentYear} {t('footer.rights')}</p>
             <p>
              {t('footer.designedBy')}{' '}
              <Link href="https://www.clancig.com.ar" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground/80">
                  clancig.com.ar
              </Link>
             </p>
          </div>
          <div className="flex items-center">
            <Button variant="ghost" size="icon" onClick={() => setIsSupportDialogOpen(true)}>
              <Heart className="h-6 w-6 text-red-500 fill-red-500 animate-pulse-heart" />
              <span className="sr-only">{t('support.title')}</span>
            </Button>
          </div>
        </div>
      </footer>
      <SupportDialog open={isSupportDialogOpen} onOpenChange={setIsSupportDialogOpen} />
    </>
  );
}
