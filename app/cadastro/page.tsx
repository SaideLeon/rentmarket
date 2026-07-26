'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { UserPlus, CheckCircle2 } from 'lucide-react';
import { initializeStore, registerUser } from '../../lib/store';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { QUELIMANE_BAIRROS } from '../../lib/data/initialData';
import { useToast } from '../../components/ui/Toast';
import { GoogleLoginButton } from '../../components/auth/GoogleLoginButton';

export default function CadastroPage() {
  const router = useRouter();
  const { showToast } = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [bairro, setBairro] = useState(QUELIMANE_BAIRROS[0]);
  const [password, setPassword] = useState('');
  const [bio, setBio] = useState('');

  const [submitting, setSubmitting] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    initializeStore();

    if (!name.trim() || !email.trim() || !phone.trim() || !password.trim()) {
      showToast('Preencha todos os campos obrigatórios.', 'error');
      return;
    }

    if (password.length < 6) {
      showToast('A palavra-passe deve ter pelo menos 6 caracteres.', 'error');
      return;
    }

    setSubmitting(true);

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password: password.trim(),
          options: {
            data: {
              name: name.trim(),
              phone: phone.trim(),
              whatsapp: whatsapp.trim() || phone.trim(),
              bairro,
              bio: bio.trim()
            }
          }
        });

        if (error) {
          showToast(`Erro ao registar no Supabase: ${error.message}`, 'error');
          setSubmitting(false);
          return;
        }

        if (data.user) {
          // Update profiles table if trigger did not populate all custom fields
          await supabase.from('profiles').upsert({
            id: data.user.id,
            name: name.trim(),
            email: email.trim(),
            phone: phone.trim(),
            whatsapp: whatsapp.trim() || phone.trim(),
            bairro,
            city: 'Quelimane',
            bio: bio.trim() || 'Utilizador do Rent Market',
            role: 'user',
            plan: 'free'
          });

          // Sync local state
          const newUser = registerUser({
            name: name.trim(),
            email: email.trim(),
            phone: phone.trim(),
            whatsapp: whatsapp.trim() || phone.trim(),
            bairro,
            bio: bio.trim()
          });

          setSubmitting(false);
          showToast(`Conta criada com sucesso! Bem-vindo ao Rent Market, ${newUser.name}!`);
          router.push('/dashboard');
          return;
        }
      } catch (err: any) {
        console.warn('Exceção ao registar utilizador no Supabase, a utilizar registo local:', err);
      }
    }

    // Local fallback registration
    setTimeout(() => {
      const newUser = registerUser({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        whatsapp: whatsapp.trim() || phone.trim(),
        bairro,
        bio: bio.trim()
      });

      setSubmitting(false);
      showToast(`Conta criada com sucesso! Bem-vindo ao Rent Market, ${newUser.name}!`);
      router.push('/dashboard');
    }, 600);
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-12 space-y-6">
      
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Criar Conta no Rent Market</h1>
        <p className="text-xs text-slate-500">Registo gratuito para compradores e anunciantes da cidade</p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        
        {/* Google Supabase Registration Option */}
        <div className="space-y-3">
          <GoogleLoginButton label="Registar com Google (Supabase)" />
          
          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-200 w-full" />
            <span className="bg-white px-3 text-[11px] font-bold text-slate-600 tracking-wider uppercase shrink-0">
              Ou criar conta manual
            </span>
          </div>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Nome Completo:</label>
            <input
              type="text"
              placeholder="Ex: Mário Mussa"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-600"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">E-mail:</label>
              <input
                type="email"
                placeholder="seuemail@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-600"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Nº de Telemóvel:</label>
              <input
                type="tel"
                placeholder="+258 84 XXX XXXX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-600"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Bairro em Quelimane:</label>
              <select
                value={bairro}
                onChange={(e) => setBairro(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-600"
              >
                {QUELIMANE_BAIRROS.map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Palavra-passe:</label>
              <input
                type="password"
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-600"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Biografia Curta / Especialidade (Opcional):</label>
            <input
              type="text"
              placeholder="Ex: Eletricista credenciado no bairro Coalane com 5 anos de experiência."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-md transition transform active:scale-98 flex items-center justify-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            <span>{submitting ? 'A criar conta...' : 'Criar Minha Conta Grátis'}</span>
          </button>

        </form>

        <div className="text-center pt-2 border-t border-slate-100 text-xs text-slate-600">
          Já tem conta registada?{' '}
          <Link href="/login" className="font-bold text-emerald-700 hover:underline">
            Iniciar Sessão
          </Link>
        </div>

      </div>

    </div>
  );
}
