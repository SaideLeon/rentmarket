'use client';

import React, { useState } from 'react';
import { X, Star, Send } from 'lucide-react';
import { addReview, getCurrentUser } from '../../lib/store';
import { useToast } from '../ui/Toast';

interface ReviewModalProps {
  targetUserId: string;
  targetUserName: string;
  adId?: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ReviewModal({ targetUserId, targetUserName, adId, onClose, onSuccess }: ReviewModalProps) {
  const { showToast } = useToast();
  const currentUser = getCurrentUser();

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [hoverRating, setHoverRating] = useState(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      showToast('Por favor, inicie sessão para avaliar.', 'info');
      return;
    }

    if (!comment.trim()) {
      showToast('Escreva um comentário sobre o seu contacto/negócio.', 'error');
      return;
    }

    addReview({
      targetUserId,
      authorId: currentUser.id,
      authorName: currentUser.name,
      authorAvatar: currentUser.avatarUrl,
      adId,
      rating,
      comment: comment.trim()
    });

    showToast('Avaliação publicada com sucesso! Obrigado pelo feedback.');
    onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
        
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <h3 className="font-bold text-base text-white">Avaliar {targetUserName}</h3>
          <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2 text-center">
              Como foi a sua experiência com este anunciante?
            </label>
            <div className="flex items-center justify-center gap-2 my-3">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 text-amber-400 hover:scale-125 transition-transform"
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= (hoverRating || rating)
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-slate-300'
                    }`}
                  />
                </button>
              ))}
            </div>
            <p className="text-center text-xs text-slate-500 font-medium">
              {rating === 5 && 'Excelente (5/5)'}
              {rating === 4 && 'Muito Bom (4/5)'}
              {rating === 3 && 'Razoável (3/5)'}
              {rating === 2 && 'Fraco (2/5)'}
              {rating === 1 && 'Mau (1/5)'}
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              O seu comentário público:
            </label>
            <textarea
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Ex: Profissional muito pontual no bairro Coalane, serviço impecável e preço justo."
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm shadow-md transition"
          >
            <Send className="w-4 h-4" />
            <span>Publicar Avaliação</span>
          </button>
        </form>

      </div>
    </div>
  );
}
