'use client';

import React, { useState } from 'react';
import { X, ShieldAlert, Send } from 'lucide-react';
import { submitReportAsync, getCurrentUser } from '../../lib/store';
import { useToast } from '../ui/Toast';

interface ReportModalProps {
  adId?: string;
  adTitle?: string;
  reportedUserId?: string;
  onClose: () => void;
}

export default function ReportModal({ adId, adTitle, reportedUserId, onClose }: ReportModalProps) {
  const { showToast } = useToast();
  const currentUser = getCurrentUser();

  const [reason, setReason] = useState<'spam' | 'fraud' | 'inappropriate' | 'fake_contact' | 'other'>('fraud');
  const [details, setDetails] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      showToast('Por favor, inicie sessão para denunciar.', 'info');
      return;
    }

    if (!details.trim()) {
      showToast('Descreva brevemente o motivo da denúncia.', 'error');
      return;
    }

    await submitReportAsync({
      reporterId: currentUser.id,
      reporterName: currentUser.name,
      adId,
      reportedUserId,
      reason,
      details: details.trim()
    });

    showToast('Denúncia enviada à equipa de moderação. Obrigado pelo apoio!');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
        
        <div className="bg-red-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-red-300" />
            <h3 className="font-bold text-base text-white">Denunciar Conteúdo Suspeito</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-red-200 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {adTitle && (
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs font-medium text-slate-700">
              Anúncio: <span className="font-bold text-slate-900">{adTitle}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Motivo da Denúncia:
            </label>
            <select
              value={reason}
              onChange={(e: any) => setReason(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-red-600"
            >
              <option value="fraud">Suspeita de Fraude / Burla</option>
              <option value="fake_contact">Contacto Falso ou Inexistente</option>
              <option value="inappropriate">Conteúdo Impróprio ou Ofensivo</option>
              <option value="spam">Spam ou Anúncio Duplicado</option>
              <option value="other">Outro Motivo</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Detalhes do Problema:
            </label>
            <textarea
              rows={4}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Explique resumidamente o que aconteceu ou porque considera este anúncio impróprio..."
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-600"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-sm shadow-md transition"
          >
            <Send className="w-4 h-4" />
            <span>Enviar Denúncia à Moderação</span>
          </button>
        </form>

      </div>
    </div>
  );
}
