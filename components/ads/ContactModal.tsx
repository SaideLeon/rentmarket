'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  Phone, 
  MessageSquare, 
  Send, 
  CheckCircle2, 
  ShieldCheck, 
  MapPin, 
  Star,
  Mail
} from 'lucide-react';
import { Ad, Review } from '../../lib/types';
import { getCurrentUser, sendMessageAsync, getUserReviewsAsync } from '../../lib/store';
import { useToast } from '../ui/Toast';
import GmailModal from '../gmail/GmailModal';
import { notifyAdvertiserNewMessage } from '../../lib/gmailNotifier';
import { getAccessToken, googleSignIn } from '../../lib/firebase';

interface ContactModalProps {
  ad: Ad;
  onClose: () => void;
}

export default function ContactModal({ ad, onClose }: ContactModalProps) {
  const { showToast } = useToast();
  const currentUser = getCurrentUser();

  const [activeTab, setActiveTab] = useState<'direct' | 'chat' | 'gmail'>('direct');
  const [messageText, setMessageText] = useState(`Olá ${ad.user?.name.split(' ')[0] || 'anunciante'}, vi o seu anúncio "${ad.title}" no Rent Market e gostaria de saber mais informações.`);
  const [sending, setSending] = useState(false);
  const [showGmailModal, setShowGmailModal] = useState(false);

  const [reviews, setReviews] = useState<Review[]>([]);
  useEffect(() => {
    if (ad.userId) {
      getUserReviewsAsync(ad.userId).then(setReviews);
    }
  }, [ad.userId]);

  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  const rawPhone = ad.whatsapp || ad.phone || '';
  const cleanWhatsappNumber = rawPhone.replace(/[^0-9]/g, '');
  const formattedWhatsappLink = cleanWhatsappNumber.startsWith('258')
    ? `https://wa.me/${cleanWhatsappNumber}?text=${encodeURIComponent(`Olá! Vi o seu anúncio "${ad.title}" no Rent Market.`)}`
    : `https://wa.me/258${cleanWhatsappNumber}?text=${encodeURIComponent(`Olá! Vi o seu anúncio "${ad.title}" no Rent Market.`)}`;

  const [notifyViaGmail, setNotifyViaGmail] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    document.body.style.overflow = 'hidden';
    return () => {
      clearTimeout(timer);
      document.body.style.overflow = '';
    };
  }, []);

  const handleSendInAppMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      showToast('Por favor, inicie sessão para enviar mensagem.', 'info');
      return;
    }

    if (!messageText.trim()) return;

    setSending(true);
    
    // Save in-app message
    await sendMessageAsync({
      adId: ad.id,
      adTitle: ad.title,
      senderId: currentUser.id,
      senderName: currentUser.name,
      receiverId: ad.userId,
      receiverName: ad.user?.name || 'Anunciante',
      content: messageText.trim()
    });

    // Dispatch Gmail email notification if requested
    let notifyMsg = 'Mensagem enviada com sucesso no aplicativo!';
    if (notifyViaGmail) {
      const result = await notifyAdvertiserNewMessage({
        adId: ad.id,
        adTitle: ad.title,
        senderName: currentUser.name,
        receiverId: ad.userId,
        receiverName: ad.user?.name || 'Anunciante',
        receiverEmail: ad.user?.email,
        messageContent: messageText.trim()
      });

      if (result.emailSent) {
        notifyMsg = `Mensagem enviada e notificação entregue via Gmail ao anunciante (${result.recipientEmail})!`;
      } else if (result.recipientEmail) {
        notifyMsg = `Mensagem salva! Para notificar por e-mail, conecte o Gmail no topo do site.`;
      }
    }

    setSending(false);
    showToast(notifyMsg, 'success');
    onClose();
  };

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9990] bg-slate-900/60 backdrop-blur-sm overflow-y-auto p-3 sm:p-6 flex items-center justify-center min-h-screen">
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] my-auto flex flex-col overflow-y-auto border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div>
            <span className="text-xs text-emerald-400 font-bold uppercase tracking-wider">Opções de Contacto</span>
            <h3 className="font-bold text-lg text-white leading-tight">Falar com o Anunciante</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Advertiser Mini Profile Card */}
        <div className="p-4 bg-slate-50 border-b border-slate-200/80 flex items-center gap-3">
          <img
            src={ad.user?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300'}
            alt={ad.user?.name}
            className="w-12 h-12 rounded-full object-cover border-2 border-emerald-600"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <h4 className="font-bold text-slate-900 text-sm truncate">{ad.user?.name}</h4>
              {ad.user?.verificationStatus === 'verified' && (
                <span className="inline-flex items-center gap-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  Verificado
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-emerald-600" />
                {ad.bairro}
              </span>
              {avgRating && (
                <span className="flex items-center gap-0.5 text-amber-600 font-bold">
                  <Star className="w-3 h-3 fill-amber-500" />
                  {avgRating} ({reviews.length})
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Option Tabs */}
        <div className="flex border-b border-slate-200">
          <button
            onClick={() => setActiveTab('direct')}
            className={`flex-1 py-3 text-xs sm:text-sm font-bold text-center border-b-2 transition ${
              activeTab === 'direct'
                ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            WhatsApp &amp; Chamada
          </button>
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex-1 py-3 text-xs sm:text-sm font-bold text-center border-b-2 transition ${
              activeTab === 'chat'
                ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            Plataforma
          </button>
          <button
            onClick={() => setActiveTab('gmail')}
            className={`flex-1 py-3 text-xs sm:text-sm font-bold text-center border-b-2 transition flex items-center justify-center gap-1 ${
              activeTab === 'gmail'
                ? 'border-red-600 text-red-700 bg-red-50/50'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Mail className="w-3.5 h-3.5 text-red-500" />
            <span>Via Gmail</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-6 space-y-4">
          {activeTab === 'gmail' ? (
            <div className="space-y-4 text-center py-2">
              <div className="p-4 bg-red-50 rounded-2xl border border-red-100 flex flex-col items-center gap-2">
                <div className="p-3 bg-red-600 text-white rounded-full shadow-md">
                  <Mail className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-slate-900 text-sm">Enviar E-mail via Gmail Oficial</h4>
                <p className="text-xs text-slate-600 max-w-sm">
                  Envie uma mensagem formal diretamente do seu Gmail para o anunciante {ad.user?.name}.
                </p>
                <button
                  onClick={() => setShowGmailModal(true)}
                  className="mt-2 w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs transition shadow-sm flex items-center justify-center gap-2"
                >
                  <Mail className="w-4 h-4" />
                  <span>Abrir Compositor do Gmail</span>
                </button>
              </div>
            </div>
          ) : activeTab === 'direct' ? (
            <div className="space-y-4">
              <p className="text-xs text-slate-600 leading-relaxed">
                Escolha a forma mais direta para negociar com o anunciante em Quelimane.
              </p>

              {/* WhatsApp Button */}
              <a
                href={formattedWhatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm shadow-md transition transform active:scale-98"
              >
                <MessageSquare className="w-5 h-5" />
                <span>Abrir Conversa no WhatsApp</span>
              </a>

              {/* Call Phone Button */}
              <a
                href={`tel:${ad.phone || ad.whatsapp}`}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-sm shadow-md transition transform active:scale-98"
              >
                <Phone className="w-5 h-5 text-emerald-400" />
                <span>Ligar Agora ({ad.phone || ad.whatsapp})</span>
              </a>

              {/* Safety Reminder */}
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p>
                  <strong>Dica de Segurança:</strong> Recomendamos encontrar-se em locais públicos movimentados em Quelimane para inspecionar os artigos ou acordar o serviço antes de efetuar qualquer pagamento.
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSendInAppMessage} className="space-y-3">
              <label className="block text-xs font-bold text-slate-700">
                Escreva a sua mensagem para {ad.user?.name}:
              </label>
              <textarea
                rows={4}
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Ex: Olá, ainda está disponível? Pode fazer no bairro Coalane?"
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                required
              />

              {/* Gmail Notification Option */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={notifyViaGmail}
                    onChange={(e) => setNotifyViaGmail(e.target.checked)}
                    className="w-4 h-4 text-red-600 rounded border-slate-300 focus:ring-red-500"
                  />
                  <span className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-red-500" />
                    <span>Notificar anunciante por Gmail</span>
                  </span>
                </label>
                <span className="text-[10px] text-slate-500 bg-slate-200/60 px-2 py-0.5 rounded-full font-medium">
                  {ad.user?.email || 'e-mail do anunciante'}
                </span>
              </div>

              <button
                type="submit"
                disabled={sending}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm shadow-md transition disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>{sending ? 'A Enviar...' : 'Enviar Mensagem'}</span>
              </button>
            </form>
          )}

        </div>

      </div>

      {showGmailModal && (
        <GmailModal
          onClose={() => setShowGmailModal(false)}
          initialTo={ad.user?.email || 'anunciante@rentmarket.co.mz'}
          initialSubject={`Interesse no anúncio: ${ad.title}`}
          initialBody={`Olá ${ad.user?.name || 'Anunciante'},\n\nEstou interessado no seu anúncio "${ad.title}" disponível no Rent Market.\n\nGostaria de obter mais detalhes sobre o artigo e condições de entrega.\n\nObrigado.`}
        />
      )}
    </div>,
    document.body
  );
}
