
'use client';

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/hooks/use-translation";
import { Briefcase, Github, Coffee, Share2 } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";


interface SupportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SupportDialog({ open, onOpenChange }: SupportDialogProps) {
  const { t } = useTranslation();
  const { toast } = useToast();

  const donationUrl = process.env.NEXT_PUBLIC_DONATION_URL || "https://cafecito.app/damianclancig";
  const portfolioUrl = process.env.NEXT_PUBLIC_PORTFOLIO_URL || "https://www.clancig.com.ar";
  const githubUrl = process.env.NEXT_PUBLIC_GITHUB_URL || "https://github.com/damianclancig/weather-wise";
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:9002";

  const handleShare = () => {
    navigator.clipboard.writeText(appUrl)
      .then(() => {
        toast({
            title: t('support.link_copied'),
        });
      })
      .catch(err => {
        console.error('Failed to copy text: ', err);
      });
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('support.title')}</AlertDialogTitle>
          <AlertDialogDescription className="text-foreground/80">
            {t('support.description')}
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <div className="flex flex-col space-y-4 my-4">
            <Button variant="outline" onClick={handleShare}>
                <Share2 />
                {t('support.share_button')}
            </Button>

            <Button variant="outline" asChild>
                <Link href={donationUrl} target="_blank" rel="noopener noreferrer">
                    <Coffee />
                    {t('support.button_donate')}
                </Link>
            </Button>
            <Button variant="outline" asChild>
                <Link href={portfolioUrl} target="_blank" rel="noopener noreferrer">
                    <Briefcase />
                    {t('support.button_portfolio')}
                </Link>
            </Button>
            <Button variant="outline" asChild>
                <Link href={githubUrl} target="_blank" rel="noopener noreferrer">
                    <Github />
                    {t('support.button_github')}
                </Link>
            </Button>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel>{t('support.close')}</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
