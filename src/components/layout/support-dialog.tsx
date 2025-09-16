"use client";

import { useState } from "react";
import { useTranslation } from "@/hooks/use-translation";

import { Button } from "@/components/ui/button"; // ShadCN Button
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog"; // ShadCN Dialog
import { Heart, Github, Briefcase, ClipboardCopy, Check } from "lucide-react"; // Icons

// Componente SVG para el ícono de PayPal
const PayPalIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" {...props}>
    <path fill="#ffffff" d="M7.017 21.933H3.122a.64.64 0 0 1-.631-.74L5.35 2.45a.64.64 0 0 1 .631-.54h7.384c2.287 0 4.07.493 5.103 1.6.84.883 1.12 2.046.847 3.604-.64 3.582-2.853 5.174-5.677 5.174h-2.81c-.365 0-.676.267-.732.629l-1.08 6.916c-.056.36-.367.63-.732.63Z"/>
    <path fill="#009cde" d="M19.986 6.41c-.048.269-.107.527-.177.777-.646 3.583-2.853 5.174-5.677 5.174h-2.81c-.364 0-.676.267-.732.63l-1.08 6.916c-.056.36-.367.629-.732.629H5.85l.314-1.98 1.002-6.426.063-.395a.64.64 0 0 1 .631-.54h3.972c2.287 0 4.07-.493 5.103-1.6a4.77 4.77 0 0 0 1.051-2.185c.048-.268.082-.541.099-.816a4.63 4.63 0 0 0-.102-1.214Z"/>
  </svg>
);
  
export function SupportDialog() {
  const { t } = useTranslation();

  const [isOpen, setIsOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:9002";
  const donationUrl = process.env.NEXT_PUBLIC_DONATION_URL;
  const paypalUrl = process.env.NEXT_PUBLIC_PAYPAL_URL;
  const portfolioUrl = process.env.NEXT_PUBLIC_PORTFOLIO_URL;
  const githubUrl = process.env.NEXT_PUBLIC_GITHUB_URL;


  const handleCopyLink = () => {
    navigator.clipboard.writeText(appUrl).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <button
          className="relative group"
          aria-label={t('support.title')}
        >
          <Heart className="h-8 w-8 text-red-500 fill-red-500 animate-[pulse-subtle_1.5s_cubic-bezier(0.4,0,0.6,1)_infinite]" />
        </button>
      </DialogTrigger>
      <DialogContent className="w-[calc(100vw-2rem)] sm:max-w-md p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-xl sm:text-2xl text-center">{t('support.title')}</DialogTitle>
          <DialogDescription className="text-center text-sm sm:text-base pt-2 text-foreground/80">
            {t('support.message1')}
          </DialogDescription>
        </DialogHeader>
        <div className="py-2 sm:py-4 text-sm sm:text-base space-y-2 sm:space-y-4 text-center">
            <p>{t('support.message2')}</p>
            <p>{t('support.message3')}</p>
        </div>
        <DialogFooter className="flex-col sm:flex-col sm:space-x-0 gap-2 sm:gap-3">
          <Button variant="secondary" className="w-full text-base h-auto py-2 sm:py-3" size="lg" onClick={handleCopyLink}>
            <div className="flex items-center justify-center w-full">
              <div className="w-10 mr-2 flex justify-center">
                {isCopied ? <Check className="h-5 w-5 sm:h-6 sm:w-6 text-green-500" /> : <ClipboardCopy className="h-5 w-5 sm:h-6 sm:w-6" />}
              </div>
              <span className="text-left">{isCopied ? t('support.copied') : t('support.copy_link')}</span>
            </div>
          </Button>
          {donationUrl && (
            <Button asChild className="w-full text-base h-auto py-2 sm:py-3" size="lg">
              <a href={donationUrl} target="_blank" rel="noopener noreferrer">
                <div className="flex items-center justify-center w-full">
                  <div className="w-10 mr-2 flex justify-center text-xl sm:text-2xl">☕</div>
                  <span className="text-left">{t('support.button_donate')}</span>
                </div>
              </a>
            </Button>
          )}
           {paypalUrl && (
            <Button asChild className="w-full text-base bg-[#003087] hover:bg-[#00205b] h-auto py-2 sm:py-3" size="lg">
              <a href={paypalUrl} target="_blank" rel="noopener noreferrer">
                <div className="flex items-center justify-center w-full">
                  <div className="w-10 mr-2 flex justify-center">
                      <PayPalIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                  </div>
                  <span className="text-left">{t('support.button_paypal')}</span>
                </div>
              </a>
            </Button>
          )}
          {portfolioUrl && (
            <Button asChild variant="secondary" className="w-full text-base h-auto py-2 sm:py-3" size="lg">
              <a href={portfolioUrl} target="_blank" rel="noopener noreferrer">
                <div className="flex items-center justify-center w-full">
                  <div className="w-10 mr-2 flex justify-center">
                      <Briefcase className="h-5 w-5 sm:h-6 sm:w-6" />
                  </div>
                  <span className="text-left">{t('support.button_portfolio')}</span>
                </div>
              </a>
            </Button>
          )}
          {githubUrl && (
            <Button asChild variant="secondary" className="w-full text-base h-auto py-2 sm:py-3" size="lg">
              <a href={githubUrl} target="_blank" rel="noopener noreferrer">
                <div className="flex items-center justify-center w-full">
                  <div className="w-10 mr-2 flex justify-center">
                    <Github className="h-5 w-5 sm:h-6 sm:w-6" />
                  </div>
                  <span className="text-left">{t('support.button_github')}</span>
                </div>
              </a>
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
