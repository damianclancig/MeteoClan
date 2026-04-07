'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from '@/hooks/use-translation';
import { X, Download, Share, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function InstallBanner() {
  const { t } = useTranslation();
  const [showBanner, setShowBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  
  // Nuevo estado para la actualización
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false);
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);

  useEffect(() => {
    // === REGISTRO DEL SERVICE WORKER Y DETECCIÓN DE ACTUALIZACIÓN ===
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').then((registration) => {
        // Al registrar, si hay un worker en espera, significa que hay actualización
        if (registration.waiting) {
          setWaitingWorker(registration.waiting);
          setIsUpdateAvailable(true);
          setShowBanner(true);
        }

        // Si se encuentra una actualización futura
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              // Si se instaló correctamente y hay un controlador anterior
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                setWaitingWorker(newWorker);
                setIsUpdateAvailable(true);
                setShowBanner(true);
              }
            });
          }
        });
      }).catch((err) => console.log('Worker registration failed', err));

      // Importante: Escuchamos cuando el service worker toma el control para recargar
      let refreshing = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!refreshing) {
            refreshing = true;
            window.location.reload();
        }
      });
    }

    // === LÓGICA DE INSTALACIÓN PWA ===
    // 1. Check if already installed / standalone
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || ('standalone' in window.navigator && (window.navigator as any).standalone === true);
    
    // Si hay actualización pendiente, queremos mostrar el banner aunque esté en modo standalone
    if (isStandalone && !isUpdateAvailable) {
      return;
    }

    // 2. Check if dismissed recently (24 hours) - Sólo aplica para la instalación.
    const dismissedTime = localStorage.getItem('pwa_banner_dismissed');
    if (dismissedTime && !isUpdateAvailable) {
      const timePassed = Date.now() - parseInt(dismissedTime, 10);
      if (timePassed < 24 * 60 * 60 * 1000) {
        return;
      }
    }

    // Si ya sabemos que hay una actualización, devolvemos temprano para no sobreescribir con lógica de instalación
    if (isUpdateAvailable) return;

    // 3. Detect iOS for manual instructions
    const ua = window.navigator.userAgent;
    const isIOSDevice = /iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream;
    setIsIOS(isIOSDevice);

    if (isIOSDevice && !isStandalone) {
      setShowBanner(true);
    }

    // 4. Listen for beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      if (!isStandalone) setShowBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [isUpdateAvailable]);

  const handleDismiss = () => {
    if (!isUpdateAvailable) {
       localStorage.setItem('pwa_banner_dismissed', Date.now().toString());
    }
    setShowBanner(false);
  };

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowBanner(false);
      }
      setDeferredPrompt(null);
    }
  };

  const handleUpdate = () => {
    if (waitingWorker) {
      waitingWorker.postMessage({ type: 'SKIP_WAITING' });
    }
  };

  if (!showBanner) return null;

  // Render for Update
  if (isUpdateAvailable) {
    return (
      <div className="relative z-50 w-full px-4 py-3 bg-card/90 backdrop-blur-md border-b border-border/50 shadow-sm animate-in slide-in-from-top flex items-center justify-between pointer-events-auto">
        <div className="flex items-center flex-1 min-w-0 pr-4">
          <div className="w-10 h-10 shrink-0 bg-blue-500/20 rounded-xl flex items-center justify-center mr-3">
            <RefreshCcw className="w-5 h-5 text-blue-500" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-semibold text-foreground">{t('pwa.updateTitle') || 'Nueva versión'}</h3>
            <p className="text-xs text-muted-foreground mt-0.5">{t('pwa.updateDesc')}</p>
          </div>
        </div>
        
        <div className="flex items-center shrink-0 space-x-2">
          <Button size="sm" onClick={handleUpdate} className="rounded-full px-4 font-semibold shrink-0 bg-blue-600 hover:bg-blue-700 text-white">
            {t('pwa.updateButton') || 'Actualizar'}
          </Button>
          <Button size="icon" variant="ghost" onClick={handleDismiss} className="w-8 h-8 rounded-full text-muted-foreground shrink-0" aria-label={t('pwa.dismiss')}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  }

  // Render for Install
  return (
    <div className="relative z-50 w-full px-4 py-3 bg-card/80 backdrop-blur-md border-b border-border/50 shadow-sm animate-in slide-in-from-top flex items-center justify-between pointer-events-auto">
      <div className="flex items-center flex-1 min-w-0 pr-4">
        <div className="w-10 h-10 shrink-0 bg-primary/20 rounded-xl flex items-center justify-center mr-3">
          <Download className="w-5 h-5 text-primary" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold text-foreground">{t('pwa.installTitle')}</h3>
          {isIOS && !deferredPrompt ? (
            <div className="text-xs text-muted-foreground mt-0.5 leading-snug flex items-start">
              <Share className="w-3 h-3 inline mr-1 shrink-0 mt-0.5" />
              <span>{t('pwa.iosInstructions')}</span>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground mt-0.5">{t('pwa.installDesc')}</p>
          )}
        </div>
      </div>
      
      <div className="flex items-center shrink-0 space-x-2">
        {(!isIOS || deferredPrompt) && (
          <Button size="sm" onClick={handleInstall} className="rounded-full px-4 font-semibold shrink-0">
            {t('pwa.installButton')}
          </Button>
        )}
        <Button size="icon" variant="ghost" onClick={handleDismiss} className="w-8 h-8 rounded-full text-muted-foreground shrink-0" aria-label={t('pwa.dismiss')}>
          <X className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
