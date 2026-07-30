'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { loginOrRegisterGoogleUser } from '../../lib/store';
import { useToast } from '../ui/Toast';
import { Shield, Sparkles, AlertCircle, ExternalLink, CheckCircle2 } from 'lucide-react';

interface GoogleLoginButtonProps {
  label?: string;
  className?: string;
}

export function GoogleLoginButton({ label = 'Continuar com Google', className = '' }: GoogleLoginButtonProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);

  const handleGoogleLogin = async () => {
    setLoading(true);

    if (isSupabaseConfigured && supabase) {
      try {
        const redirectUrl = typeof window !== 'undefined' 
          ? `${window.location.origin}/auth/callback` 
          : 'http://localhost:3000/auth/callback';

        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: redirectUrl,
            queryParams: {
              access_type: 'offline',
              prompt: 'consent',
            },
          },
        });

        if (error) {
          throw error;
        }
      } catch (err: any) {
        console.error('Erro Supabase Google Auth:', err);
        showToast(err.message || 'Erro ao ligar ao Google via Supabase', 'error');
        setLoading(false);
      }
    } else {
      // Supabase credentials not set in .env yet -> show interactive options
      setLoading(false);
      setShowConfigModal(true);
    }
  };

  const handleSimulatedGoogleLogin = (demoType: 'user' | 'seller') => {
    setShowConfigModal(false);
    const demoData = demoType === 'seller' ? {
      email: 'mussa.delcio@gmail.com',
      name: 'Délcio Mussa (Google)',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200'
    } : {
      email: 'comprador.quelimane@gmail.com',
      name: 'Afonso Nhantumbo (Google)',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'
    };

    const profile = loginOrRegisterGoogleUser(demoData);
    showToast(`Autenticado com sucesso através da Conta Google (${profile.email})!`);
    router.push(profile.role === 'admin' ? '/admin' : '/dashboard');
  };

  return (
    <>
      <button
        type="button"
        onClick={handleGoogleLogin}
        disabled={loading}
        className={`w-full py-3 px-4 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs sm:text-sm rounded-xl border border-slate-300 shadow-xs transition flex items-center justify-center gap-3 relative overflow-hidden group hover:border-slate-400 ${className}`}
      >
        {/* Official Google Color SVG */}
        <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
          />
          <path
            fill="#34A853"
            d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.29v3.15C3.26 21.3 7.37 24 12 24z"
          />
          <path
            fill="#FBBC05"
            d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.29C.47 8.21 0 10.05 0 12s.47 3.79 1.29 5.42l3.99-3.15z"
          />
          <path
            fill="#EA4335"
            d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.37 0 3.26 2.7 1.29 6.58l3.99 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
          />
        </svg>

        <span>{loading ? 'A conectar...' : label}</span>

        {/* Supabase Indicator Badge */}
        <span className="ml-auto inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-md border border-emerald-200/80">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Supabase
        </span>
      </button>

      {/* Supabase OAuth Status / Demo Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-700 font-bold">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Autenticação Google via Supabase</h3>
                  <p className="text-xs text-slate-500">Integração do Mussika Online</p>
                </div>
              </div>
              <button
                onClick={() => setShowConfigModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold p-1"
              >
                &times;
              </button>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-2">
              <div className="flex items-center gap-2 font-bold text-slate-800">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>Integração de Login Pronta</span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                A funcionalidade de <strong>Login com Google (Supabase Auth)</strong> está implementada no código e configurada no SDK oficial <code className="bg-slate-200 text-slate-800 px-1 rounded">@supabase/supabase-js</code>.
              </p>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-700 block">
                Escolha uma opção para prosseguir:
              </span>

              <button
                onClick={() => handleSimulatedGoogleLogin('seller')}
                className="w-full p-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-xs transition flex items-center justify-between"
              >
                <span>Entrar com Conta Google (Vendedor Délcio)</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-200" />
              </button>

              <button
                onClick={() => handleSimulatedGoogleLogin('user')}
                className="w-full p-3 bg-slate-800 hover:bg-slate-900 text-white rounded-2xl font-bold text-xs transition flex items-center justify-between"
              >
                <span>Entrar com Conta Google (Comprador Afonso)</span>
                <CheckCircle2 className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200/80 text-[11px] text-amber-900 space-y-1">
              <span className="font-bold flex items-center gap-1 text-amber-800">
                <AlertCircle className="w-3.5 h-3.5 shrink-0 text-amber-600" />
                Para Utilizar o Seu Próprio Projecto Supabase:
              </span>
              <p className="leading-tight">
                Defina <code className="font-mono bg-amber-100 px-1 rounded">NEXT_PUBLIC_SUPABASE_URL</code> e <code className="font-mono bg-amber-100 px-1 rounded">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> nas variáveis de ambiente.
              </p>
            </div>

            <div className="pt-2 text-right">
              <button
                onClick={() => setShowConfigModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition"
              >
                Fechar
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
