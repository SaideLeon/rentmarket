'use client';

import React, { useEffect, useState } from 'react';
import { Download, X, Smartphone, CheckCircle, Share, PlusSquare, Sparkles, ShieldCheck } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function PWAInstaller() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [isInstalled, setIsInstalled] = useState(() => {
    if (typeof window === 'undefined') return false;
    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true ||
      document.referrer.includes('android-app://')
    );
  });
  const [isIOS] = useState(() => {
    if (typeof window === 'undefined') return false;
    return /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase());
  });
  const [isAndroid] = useState(() => {
    if (typeof window === 'undefined') return false;
    return /android/.test(window.navigator.userAgent.toLowerCase());
  });

  useEffect(() => {
    // 1. Register Service Worker
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((registration) => {
            console.log('[PWA] ServiceWorker registered with scope:', registration.scope);
          })
          .catch((error) => {
            console.error('[PWA] ServiceWorker registration failed:', error);
          });
      });
    }

    // 2. Listen for beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      setDeferredPrompt(promptEvent);

      // Check if user previously dismissed
      const dismissed = localStorage.getItem('rentmarket_pwa_banner_dismissed');
      const isStandaloneMode =
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true;

      if (!dismissed && !isStandaloneMode) {
        setShowBanner(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Listen for custom event trigger from Navbar/MobileNav/Footer
    const handleOpenPwaModal = () => {
      setShowGuideModal(true);
    };
    window.addEventListener('open-pwa-install', handleOpenPwaModal);

    // Listen for appinstalled
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowBanner(false);
      setShowGuideModal(false);
      setDeferredPrompt(null);
      console.log('[PWA] App was successfully installed!');
    };
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('open-pwa-install', handleOpenPwaModal);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [isInstalled]);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        if (choice.outcome === 'accepted') {
          setShowBanner(false);
          setShowGuideModal(false);
        }
        setDeferredPrompt(null);
      } catch (err) {
        console.error('[PWA] Error launching install prompt:', err);
      }
    } else {
      // Show manual step-by-step guide
      setShowGuideModal(true);
    }
  };

  const handleDismissBanner = () => {
    setShowBanner(false);
    localStorage.setItem('rentmarket_pwa_banner_dismissed', 'true');
  };

  if (isInstalled) {
    return null; // App is running natively as PWA
  }

  return (
    <>
      {/* Floating Bottom Banner for Android / Mobile / Desktop */}
      {showBanner && (
        <div className="fixed bottom-16 sm:bottom-6 left-3 right-3 sm:left-auto sm:right-6 sm:max-w-md bg-slate-900/95 backdrop-blur-md text-white p-4 rounded-2xl shadow-2xl border border-teal-500/30 z-50 transition-all duration-300 animate-in slide-in-from-bottom-5">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-teal-600 flex items-center justify-center shrink-0 shadow-md">
              <Smartphone className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5">
                <h3 className="font-bold text-sm text-white">Instalar App Mussika Online</h3>
                <span className="bg-teal-500/20 text-teal-300 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-teal-400/30">
                  Android & Web
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-snug">
                Instale como aplicação nativa no seu telemóvel para acesso rápido e offline sem usar browser.
              </p>
              
              <div className="mt-3 flex items-center gap-2">
                <button
                  onClick={handleInstallClick}
                  className="flex-1 bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs py-2 px-3.5 rounded-xl shadow-sm flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  Instalar Agora
                </button>
                <button
                  onClick={() => setShowGuideModal(true)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs py-2 px-3 rounded-xl transition-colors"
                >
                  Instruções
                </button>
              </div>
            </div>

            <button
              onClick={handleDismissBanner}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
              title="Fechar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Detailed Modal Guide for Android & iOS */}
      {showGuideModal && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg width-full p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto relative">
            <button
              onClick={() => setShowGuideModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center shrink-0">
                <Smartphone className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">Instalar Mussika Online</h2>
                <p className="text-xs text-slate-500">Aplicação Web Progressiva (PWA)</p>
              </div>
            </div>

            <div className="bg-teal-50 border border-teal-200 rounded-xl p-3.5 mb-5 text-xs text-teal-900 flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold block mb-0.5">Vantagens da Aplicação Nao-Nativa PWA:</span>
                • Funciona como uma aplicação Android nativa, diretamente do ecrã inicial.<br />
                • Não ocupa memória desnecessária e carrega instantaneamente.<br />
                • Funciona offline e com pouca cobertura de rede.
              </div>
            </div>

            {/* Direct Prompt Button if Browser supports native prompt */}
            {deferredPrompt && (
              <div className="mb-6 text-center bg-slate-50 p-4 rounded-xl border border-slate-200">
                <p className="text-xs font-medium text-slate-700 mb-3">
                  O seu navegador suporta a instalação direta num clique:
                </p>
                <button
                  onClick={handleInstallClick}
                  className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm py-3 px-4 rounded-xl shadow-md flex items-center justify-center gap-2 transition-all transform active:scale-95"
                >
                  <Download className="w-4 h-4" />
                  Instalar Aplicação Automaticamente
                </button>
              </div>
            )}

            {/* Android Instructions */}
            <div className="mb-5">
              <div className="flex items-center gap-2 font-semibold text-slate-900 text-sm mb-2 pb-1 border-b border-slate-100">
                <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center justify-center">1</span>
                <span>Instruções no Android (Google Chrome / Brave)</span>
              </div>
              <ol className="space-y-2.5 text-xs text-slate-600 pl-2">
                <li className="flex items-start gap-2">
                  <span className="font-bold text-slate-900">1.</span>
                  <span>Toque no botão de menu do Chrome <strong>(três pontos ⋮ no canto superior direito)</strong>.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-slate-900">2.</span>
                  <span>Selecione a opção <strong>&quot;Instalar Aplicação&quot;</strong> ou <strong>&quot;Adicionar ao ecrã principal&quot;</strong>.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-slate-900">3.</span>
                  <span>Confirme em <strong>&quot;Instalar&quot;</strong>. O ícone do Mussika Online aparecerá com as suas restantes aplicações.</span>
                </li>
              </ol>
            </div>

            {/* iOS Instructions */}
            <div className="mb-5">
              <div className="flex items-center gap-2 font-semibold text-slate-900 text-sm mb-2 pb-1 border-b border-slate-100">
                <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center">2</span>
                <span>Instruções no iPhone / iOS (Safari)</span>
              </div>
              <ol className="space-y-2.5 text-xs text-slate-600 pl-2">
                <li className="flex items-start gap-2">
                  <Share className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Toque no ícone de <strong>Partilhar (quadrado com seta para cima)</strong> na barra inferior do Safari.</span>
                </li>
                <li className="flex items-start gap-2">
                  <PlusSquare className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Deslize para baixo e escolha <strong>&quot;Adicionar ao Ecrã Principal&quot;</strong>.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Toque em <strong>&quot;Adicionar&quot;</strong> no canto superior direito.</span>
                </li>
              </ol>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setShowGuideModal(false)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs px-4 py-2 rounded-xl transition-colors"
              >
                Compreendi
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export function triggerPwaInstall() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('open-pwa-install'));
  }
}
