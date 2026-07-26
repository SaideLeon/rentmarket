'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase, isSupabaseConfigured } from '../../../lib/supabase';
import { loginOrRegisterGoogleUser, syncUserFromSupabaseProfile } from '../../../lib/store';
import { getSupabaseProfileById } from '../../../lib/api/auth';
import { useToast } from '../../../components/ui/Toast';
import { Loader2, CheckCircle, AlertCircle, ShieldCheck } from 'lucide-react';

export default function AuthCallbackPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMsg, setErrorMsg] = useState('');

  const resolveProfile = async (user: any) => {
    const email = user.email || '';
    const name = user.user_metadata?.full_name || user.user_metadata?.name || email.split('@')[0];
    const avatarUrl = user.user_metadata?.avatar_url || user.user_metadata?.picture;

    let supaProfile = await getSupabaseProfileById(user.id);
    if (!supaProfile) {
      // Retry once in case trigger is still inserting
      await new Promise(r => setTimeout(r, 400));
      supaProfile = await getSupabaseProfileById(user.id);
    }

    if (supaProfile) {
      return syncUserFromSupabaseProfile(supaProfile);
    }

    return loginOrRegisterGoogleUser({ email, name, avatarUrl });
  };

  useEffect(() => {
    let isMounted = true;

    const processAuth = async () => {
      if (!isSupabaseConfigured || !supabase) {
        if (isMounted) {
          setStatus('error');
          setErrorMsg('Supabase não está configurado no ambiente.');
        }
        return;
      }

      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) throw error;

        if (session && session.user) {
          const profile = await resolveProfile(session.user);
          if (isMounted) {
            setStatus('success');
            showToast(`Bem-vindo, ${profile.name}! Autenticado via Google Supabase.`);
            setTimeout(() => {
              router.push(profile.role === 'admin' ? '/admin' : '/dashboard');
            }, 600);
          }
        } else {
          // Listen for hash fragment authentication processing
          const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (session && session.user && isMounted) {
              const profile = await resolveProfile(session.user);
              setStatus('success');
              showToast(`Bem-vindo, ${profile.name}! Autenticado via Google Supabase.`);
              setTimeout(() => {
                router.push(profile.role === 'admin' ? '/admin' : '/dashboard');
              }, 600);
              authListener.subscription.unsubscribe();
            }
          });
        }
      } catch (err: any) {
        console.error('Erro no callback de autenticação Supabase:', err);
        if (isMounted) {
          setStatus('error');
          setErrorMsg(err.message || 'Falha ao autenticar com o Google via Supabase.');
        }
      }
    };

    processAuth();

    return () => {
      isMounted = false;
    };
  }, [router, showToast]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-12">
      <div className="bg-white rounded-3xl border border-slate-200 p-8 max-w-sm w-full text-center space-y-4 shadow-xl">
        
        {status === 'loading' && (
          <div className="space-y-4">
            <Loader2 className="w-10 h-10 text-emerald-600 animate-spin mx-auto" />
            <div>
              <h2 className="text-lg font-bold text-slate-900">A Autenticar com o Google...</h2>
              <p className="text-xs text-slate-500 mt-1">A processar os dados da conta através do Supabase</p>
            </div>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-4">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center mx-auto">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Sessão Iniciada com Sucesso!</h2>
              <p className="text-xs text-slate-500 mt-1">A reencaminhar para a sua área de utilizador...</p>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-4">
            <div className="w-12 h-12 bg-red-100 text-red-700 rounded-2xl flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Falha na Autenticação</h2>
              <p className="text-xs text-red-600 mt-1">{errorMsg}</p>
            </div>
            <button
              onClick={() => router.push('/login')}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition"
            >
              Voltar ao Login
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
