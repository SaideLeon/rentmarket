'use client';

import React, { useState } from 'react';
import { Sparkles, Check, ArrowRight, ShieldCheck, Phone, Zap } from 'lucide-react';
import { getCurrentUser } from '../../lib/store';
import PaymentModal from '../../components/payments/PaymentModal';

export default function PlanosPage() {
  const currentUser = getCurrentUser();
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      
      {/* Title */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <span className="text-xs font-bold text-amber-600 uppercase tracking-wider bg-amber-100 px-3 py-1 rounded-full">
          Cresça no Mussika Online
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Planos &amp; Destaques de Anúncios
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
          Aumente a visibilidade dos seus serviços e produtos na cidade de Quelimane. Receba até 5x mais contactos de clientes diretamente no seu WhatsApp!
        </p>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
        
        {/* FREE PLAN */}
        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-xs flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-3 py-1 rounded-full inline-block">
              Plano Inicial
            </span>
            <div>
              <h2 className="text-2xl font-black text-slate-900">Grátis</h2>
              <p className="text-xs text-slate-500 font-medium">Ideal para quem está a começar e quer testar a plataforma</p>
            </div>

            <div className="text-3xl font-black text-slate-900 pt-2">
              0 MT <span className="text-xs font-normal text-slate-500">/ para sempre</span>
            </div>

            <ul className="space-y-3 text-xs text-slate-700 pt-4 border-t border-slate-100 font-medium">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Até <strong>3 anúncios ativos</strong> em simultâneo</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Validade de <strong>30 dias</strong> por anúncio (com renovação grátis)</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Botão direto de contacto WhatsApp &amp; Chamada</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Página de perfil público com lista de anúncios</span>
              </li>
            </ul>
          </div>

          <button
            disabled
            className="w-full py-3.5 bg-slate-100 text-slate-500 font-bold text-xs sm:text-sm rounded-xl cursor-default text-center"
          >
            {currentUser?.plan === 'free' ? 'Seu Plano Atual' : 'Plano Grátis Incluído'}
          </button>
        </div>

        {/* PRO PLAN */}
        <div className="bg-slate-900 text-white rounded-3xl p-8 shadow-xl flex flex-col justify-between space-y-6 relative overflow-hidden border-2 border-amber-500/80">
          
          <div className="absolute top-0 right-0 bg-gradient-to-l from-amber-500 to-amber-600 text-slate-950 font-black text-[10px] uppercase tracking-wider px-4 py-1.5 rounded-bl-2xl shadow-md flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" />
            Mais Popular
          </div>

          <div className="space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-300 bg-amber-950 px-3 py-1 rounded-full inline-block border border-amber-800">
              Profissional &amp; Negócios
            </span>
            <div>
              <h2 className="text-2xl font-black text-white">Pro Quelimane</h2>
              <p className="text-xs text-slate-400 font-medium">Para profissionais independentes e comerciantes que vivem de vendas</p>
            </div>

            <div className="text-3xl font-black text-amber-400 pt-2">
              250 MT <span className="text-xs font-normal text-slate-400">/ mês</span>
            </div>

            <ul className="space-y-3 text-xs text-slate-200 pt-4 border-t border-slate-800 font-medium">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-amber-400 shrink-0" />
                <span><strong>Anúncios ilimitados</strong> sem restrições de limite</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-amber-400 shrink-0" />
                <span><strong>Destaque automático</strong> no topo das pesquisas e página inicial</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Selo Oficial de <strong>Anunciante Verificado</strong> no perfil</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Estatísticas avançadas de visualizações e cliques</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Atendimento de suporte prioritário via WhatsApp</span>
              </li>
            </ul>
          </div>

          <button
            onClick={() => setShowPaymentModal(true)}
            className="w-full py-4 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-sm rounded-xl shadow-lg transition transform active:scale-98 flex items-center justify-center gap-2"
          >
            <span>Subscrever Pro Quelimane (250 MT)</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* Payment Accept Banner */}
      <div className="bg-white rounded-3xl p-8 border border-slate-200 text-center space-y-4">
        <h3 className="font-bold text-slate-900 text-base">Pagamentos Rápidos e Seguros em Moçambique</h3>
        <p className="text-xs text-slate-500 max-w-lg mx-auto">
          Aceitamos pagamento instantâneo com M-Pesa, e-Mola e cartões bancários. O seu anúncio passa a ter destaque imediatamente após a transação.
        </p>

        <div className="flex items-center justify-center gap-3 pt-2">
          <span className="px-3 py-1.5 bg-red-50 text-red-700 font-bold text-xs rounded-xl border border-red-200">
            M-PESA (Vodacom)
          </span>
          <span className="px-3 py-1.5 bg-orange-50 text-orange-700 font-bold text-xs rounded-xl border border-orange-200">
            e-Mola (Movitel)
          </span>
          <span className="px-3 py-1.5 bg-slate-100 text-slate-800 font-bold text-xs rounded-xl border border-slate-200">
            Stripe / Visa
          </span>
        </div>
      </div>

      {showPaymentModal && (
        <PaymentModal
          type="upgrade_plan"
          onClose={() => setShowPaymentModal(false)}
          onSuccess={() => {}}
        />
      )}

    </div>
  );
}
