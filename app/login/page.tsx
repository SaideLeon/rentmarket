'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LogIn, ArrowRight, ShieldCheck, User, Sparkles, AlertCircle } from 'lucide-react';
import { initializeStore, getAllUsers, setCurrentUser } from '../../lib/store';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { useToast } from '../../components/ui/Toast';
import { GoogleLoginButton } from '../../components/auth/GoogleLoginButton';

export default function LoginPage() {
  const router = useRouter();
  const { showToast } = useToast();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    initializeStore();
    setErrorMessage('');

    if (!identifier.trim() || !password.trim()) {
      setErrorMessage('Credenciais inválidas. Verifique os dados introduzidos e tente novamente.');
      return;
    }

    setLoading(true);

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: identifier.trim(),
          password: password.trim()
        });

        if (error) {
          console.warn('Erro ao autenticar com o Supabase:', error.message);
        } else if (data.user) {
          // Check profile for ban status and role
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();

          if (profile?.is_banned) {
            setLoading(false);
            setErrorMessage(`A sua conta foi suspensa pela administração. Motivo: ${profile.ban_reason || 'Violação dos termos de serviço'}.`);
            await supabase.auth.signOut();
            return;
          }

          setLoading(false);
          const userRole = profile?.role || 'user';
          setCurrentUser(data.user.id);
          showToast(`Bem-vindo de volta, ${profile?.name || data.user.email}!`);
          router.push(userRole === 'admin' ? '/admin' : '/dashboard');
          return;
        }
      } catch (err) {
        console.warn('Exceção no Supabase Auth, a utilizar fallback local:', err);
      }
    }

    // Fallback store login
    setTimeout(() => {
      const users = getAllUsers();
      const found = users.find(u => 
        u.email.toLowerCase() === identifier.toLowerCase().trim() ||
        u.phone.includes(identifier.trim())
      );

      if (found) {
        if (found.isBanned) {
          setLoading(false);
          setErrorMessage(`A sua conta foi suspensa pela administração. Motivo: ${found.banReason || 'Violação das regras do mercado'}.`);
          return;
        }

        setCurrentUser(found.id);
        setLoading(false);
        showToast(`Bem-vindo de volta, ${found.name}!`);
        router.push(found.role === 'admin' ? '/admin' : '/dashboard');
      } else {
        setLoading(false);
        setErrorMessage('Credenciais inválidas. Verifique o e-mail/telemóvel ou a palavra-passe.');
      }
    }, 500);
  };

  const handleQuickDemoLogin = (userId: string) => {
    initializeStore();
    const updated = setCurrentUser(userId);
    if (updated) {
      if (updated.isBanned) {
        showToast(`Esta conta foi suspensa: ${updated.banReason}`, 'error');
        return;
      }
      showToast(`Sessão iniciada como ${updated.name}`);
      router.push(updated.role === 'admin' ? '/admin' : '/dashboard');
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12 space-y-6">
      
      {/* Title */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center font-bold text-xl mx-auto shadow-xs">
          MQ
        </div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Entrar na sua Conta</h1>
        <p className="text-xs text-slate-500">Aceda aos seus anúncios, mensagens e definições em Quelimane</p>
      </div>

      {/* Main Form */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        
        {/* Google Supabase Login Option */}
        <div className="space-y-3">
          <GoogleLoginButton label="Entrar com Google (Supabase)" />
          
          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-200 w-full" />
            <span className="bg-white px-3 text-[11px] font-bold text-slate-600 tracking-wider uppercase shrink-0">
              Ou com E-mail / Palavra-passe
            </span>
          </div>
        </div>

        {errorMessage && (
          <div className="p-3.5 bg-red-50 text-red-900 border border-red-200 rounded-2xl text-xs font-medium flex items-start gap-2.5 shadow-xs">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">E-mail ou Nº de Telemóvel:</label>
            <input
              type="text"
              placeholder="exemplo@gmail.com ou +258 84 XXX XXXX"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-600"
              required
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-slate-700">Palavra-passe:</label>
              <Link href="/recuperar-senha" className="text-[11px] font-bold text-emerald-700 hover:underline">
                Esqueceu a senha?
              </Link>
            </div>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-600"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-md transition transform active:scale-98 flex items-center justify-center gap-2"
          >
            <LogIn className="w-4 h-4" />
            <span>{loading ? 'A verificar autenticação...' : 'Entrar na Conta'}</span>
          </button>
        </form>

        <div className="text-center pt-2 border-t border-slate-100 text-xs text-slate-600">
          Ainda não tem conta?{' '}
          <Link href="/cadastro" className="font-bold text-emerald-700 hover:underline">
            Registar-se Grátis
          </Link>
        </div>

      </div>

      {/* Demo Quick Access Buttons */}
      <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 space-y-2">
        <span className="text-[11px] font-bold text-amber-900 uppercase tracking-wider block">
          Acesso Rápido para Testes de Demonstração:
        </span>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <button
            onClick={() => handleQuickDemoLogin('usr_delcio')}
            className="p-2 bg-white hover:bg-amber-100 text-slate-800 font-bold rounded-lg border border-amber-300 text-left transition"
          >
            Entrar como Délcio (Vendedor)
          </button>
          <button
            onClick={() => handleQuickDemoLogin('usr_admin')}
            className="p-2 bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold rounded-lg border border-slate-800 text-left transition"
          >
            Entrar como Admin
          </button>
        </div>
      </div>

    </div>
  );
}
