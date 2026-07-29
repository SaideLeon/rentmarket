'use client';

import React, { useState } from 'react';
import { X, Sparkles, CheckCircle2, ShieldCheck, Phone, CreditCard, ArrowRight } from 'lucide-react';
import { getCurrentUser, updateUserProfile, boostAd, boostAdAsync, getSettings } from '../../lib/store';
import { useToast } from '../ui/Toast';

interface PaymentModalProps {
  type: 'upgrade_plan' | 'boost_ad';
  adId?: string;
  adTitle?: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function PaymentModal({ type, adId, adTitle, onClose, onSuccess }: PaymentModalProps) {
  const { showToast } = useToast();
  const currentUser = getCurrentUser();
  const settings = getSettings();

  const [paymentMethod, setPaymentMethod] = useState<'mpesa' | 'emola' | 'stripe'>('mpesa');
  const [phoneNumber, setPhoneNumber] = useState(currentUser?.phone || '');
  const [processing, setProcessing] = useState(false);
  const [completed, setCompleted] = useState(false);

  const priceMZN = type === 'upgrade_plan' ? settings.proPlanPriceMonthlyMZN : settings.featuredPriceMZN;
  const titleText = type === 'upgrade_plan' 
    ? 'Subscrição Plano Pro Quelimane' 
    : `Impulsionar Anúncio "${adTitle?.substring(0, 30)}..."`;

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    if ((paymentMethod === 'mpesa' || paymentMethod === 'emola') && !phoneNumber.trim()) {
      showToast('Insira o número de telemóvel para a transação móvel.', 'error');
      return;
    }

    setProcessing(true);

    try {
      // 1. Initiate payment via server API endpoint
      const initRes = await fetch('/api/payments/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          type,
          adId,
          method: paymentMethod,
          phoneNumber
        })
      });

      const initData = await initRes.json();

      if (!initRes.ok || !initData.success) {
        throw new Error(initData.error || 'Erro ao iniciar o pagamento.');
      }

      showToast(initData.message || 'Solicitação de pagamento iniciada. Por favor confirme no seu telemóvel.');

      // If redirect URL provided (e.g. credit card / Stripe / PaySuite checkout), open in new window
      if (initData.checkoutUrl) {
        window.open(initData.checkoutUrl, '_blank');
      }

      // 2. Poll server for payment confirmation (server-authoritative)
      const paymentId = initData.paymentId;
      let isConfirmed = false;
      const maxAttempts = 30; // ~1.5 - 2 minutes polling

      for (let attempt = 0; attempt < maxAttempts; attempt++) {
        await new Promise(r => setTimeout(r, 3000));
        
        const statusRes = await fetch(`/api/payments/status?id=${paymentId}`);
        if (statusRes.ok) {
          const statusData = await statusRes.json();
          if (statusData.status === 'confirmed') {
            isConfirmed = true;
            break;
          }
          if (statusData.status === 'failed') {
            throw new Error('O pagamento foi recusado ou cancelado.');
          }
        }
      }

      if (isConfirmed) {
        showToast(
          type === 'upgrade_plan' 
            ? 'Parabéns! O seu plano foi atualizado para Pro Quelimane com sucesso!'
            : 'O seu anúncio foi impulsionado para o topo e agora está em Destaque!'
        );
        setProcessing(false);
        setCompleted(true);

        setTimeout(() => {
          onSuccess();
          onClose();
        }, 1500);
      } else {
        throw new Error('Aguardando confirmação do pagamento. Verifique o seu telemóvel ou tente novamente.');
      }
    } catch (err: any) {
      console.error('Erro no processamento de pagamento:', err);
      showToast(err.message || 'Erro ao processar pagamento. Tente novamente.', 'error');
      setProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 to-amber-700 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-200" />
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-100">Destaque &amp; Pagamento</span>
              <h3 className="font-bold text-base text-white">{titleText}</h3>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-amber-100 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {completed ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h4 className="font-bold text-xl text-slate-900">Pagamento Confirmado!</h4>
            <p className="text-xs text-slate-600">
              A transação de {priceMZN} MT foi concluída com sucesso via {paymentMethod.toUpperCase()}. O seu benefício já está ativo na plataforma!
            </p>
          </div>
        ) : (
          <form onSubmit={handlePay} className="p-6 space-y-5">
            
            {/* Amount Summary Box */}
            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-amber-900">Total a Pagar:</p>
                <p className="text-2xl font-black text-amber-900">{priceMZN} MT <span className="text-xs font-normal">/ 30 dias</span></p>
              </div>
              <span className="px-3 py-1 bg-amber-200 text-amber-900 font-bold text-xs rounded-full">
                {type === 'upgrade_plan' ? 'Plano Pro' : 'Destaque Topo'}
              </span>
            </div>

            {/* Payment Method Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Selecione o Meio de Pagamento em Moçambique:
              </label>
              <div className="grid grid-cols-3 gap-2">
                
                <button
                  type="button"
                  onClick={() => setPaymentMethod('mpesa')}
                  className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition ${
                    paymentMethod === 'mpesa'
                      ? 'border-red-600 bg-red-50 text-red-900 font-bold ring-2 ring-red-600'
                      : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span className="text-xs font-black text-red-600">M-PESA</span>
                  <span className="text-[10px] font-medium text-slate-500">Vodacom</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('emola')}
                  className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition ${
                    paymentMethod === 'emola'
                      ? 'border-orange-600 bg-orange-50 text-orange-900 font-bold ring-2 ring-orange-600'
                      : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span className="text-xs font-black text-orange-600">e-Mola</span>
                  <span className="text-[10px] font-medium text-slate-500">Movitel</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('stripe')}
                  className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition ${
                    paymentMethod === 'stripe'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold ring-2 ring-emerald-600'
                      : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <CreditCard className="w-4 h-4 text-emerald-600" />
                  <span className="text-[10px] font-medium text-slate-700">Cartão Visa</span>
                </button>

              </div>
            </div>

            {/* Mobile Number Input */}
            {(paymentMethod === 'mpesa' || paymentMethod === 'emola') && (
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">
                  Número de Telemóvel {paymentMethod.toUpperCase()}:
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    placeholder="84 XXX XXXX ou 86 XXX XXXX"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    required
                  />
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
                <p className="text-[11px] text-slate-500 pt-0.5">
                  Receberá um PIN no seu telemóvel para autorizar o débito direto de {priceMZN} MT.
                </p>
              </div>
            )}

            {paymentMethod === 'stripe' && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1">
                <p className="font-semibold text-slate-900">Pagamento Internacional por Cartão:</p>
                <p>Processado de forma segura via Stripe Checkout em USD/MZN equivalentes.</p>
              </div>
            )}

            <button
              type="submit"
              disabled={processing}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold text-sm shadow-md transition transform active:scale-98 disabled:opacity-50"
            >
              {processing ? (
                <span>A processar no telemóvel...</span>
              ) : (
                <>
                  <span>Confirmar &amp; Pagar {priceMZN} MT</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Transação Segura &amp; Encriptada no Rent Market</span>
            </div>

          </form>
        )}

      </div>
    </div>
  );
}
