'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Send, CheckCircle2 } from 'lucide-react';
import { useToast } from '../../components/ui/Toast';

export default function RecuperarSenhaPage() {
  const { showToast } = useToast();
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailOrPhone.trim()) return;

    setSent(true);
    showToast('Instruções de recuperação enviadas via SMS/E-mail!');
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 space-y-6">
      
      <Link href="/login" className="inline-flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-slate-900">
        <ArrowLeft className="w-4 h-4" />
        <span>Voltar ao Login</span>
      </Link>

      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        
        <div className="space-y-1">
          <h1 className="text-xl font-bold text-slate-900">Recuperar Palavra-passe</h1>
          <p className="text-xs text-slate-500">Insira o e-mail ou telemóvel associado à sua conta do Rent Market</p>
        </div>

        {sent ? (
          <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
            <h3 className="font-bold text-emerald-900 text-sm">Código de Recuperação Enviado!</h3>
            <p className="text-xs text-emerald-800 leading-relaxed">
              Enviamos uma mensagem para <strong>{emailOrPhone}</strong> com o link seguro para redefinir a sua senha.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">E-mail ou Telemóvel:</label>
              <input
                type="text"
                placeholder="exemplo@gmail.com ou +258 84 XXX XXXX"
                value={emailOrPhone}
                onChange={(e) => setEmailOrPhone(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-600"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-md transition flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>Enviar Código de Recuperação</span>
            </button>
          </form>
        )}

      </div>

    </div>
  );
}
