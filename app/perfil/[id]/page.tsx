'use client';

import React, { useState, useEffect, useCallback, use } from 'react';
import Link from 'next/link';
import { 
  MapPin, 
  Phone, 
  CheckCircle2, 
  Star, 
  Calendar, 
  MessageSquare, 
  ShieldCheck, 
  Store 
} from 'lucide-react';
import { initializeStore, getAllUsers, getAds, getUserReviews } from '../../../lib/store';
import { UserProfile, Ad, Review } from '../../../lib/types';
import AdCard from '../../../components/ads/AdCard';
import ReviewModal from '../../../components/ads/ReviewModal';
import ContactModal from '../../../components/ads/ContactModal';

export default function PublicProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);

  const [profileUser, setProfileUser] = useState<UserProfile | null>(null);
  const [userAds, setUserAds] = useState<Ad[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);

  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedAdForContact, setSelectedAdForContact] = useState<Ad | null>(null);

  const loadProfile = useCallback(() => {
    initializeStore();
    const allUsers = getAllUsers();
    const found = allUsers.find(u => u.id === resolvedParams.id);
    if (found) {
      setProfileUser(found);
      setUserAds(getAds({ userId: found.id, status: 'active' }));
      setReviews(getUserReviews(found.id));
    }
  }, [resolvedParams.id]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadProfile();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadProfile]);

  if (!profileUser) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <p className="text-sm font-semibold text-slate-600">Perfil de utilizador não encontrado.</p>
        <Link href="/anuncios" className="inline-block px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold">
          Ver Anúncios
        </Link>
      </div>
    );
  }

  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Profile Header Banner */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          
          <div className="flex items-center gap-4">
            <img
              src={profileUser.avatarUrl}
              alt={profileUser.name}
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-4 border-emerald-600 shadow-md"
            />
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900">{profileUser.name}</h1>
                {profileUser.verificationStatus === 'verified' && (
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1 border border-emerald-200" title="Identidade Verificada">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Verificado</span>
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 font-medium">
                <span className="flex items-center gap-1 text-slate-700 font-bold">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                  {profileUser.bairro}, Quelimane
                </span>
                <span>&bull;</span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  No Mercado desde {new Date(profileUser.createdAt).toLocaleDateString('pt-MZ', { month: 'short', year: 'numeric' })}
                </span>
              </div>

              {avgRating && (
                <div className="flex items-center gap-1 pt-1 text-amber-600 text-xs font-bold">
                  <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                  <span>{avgRating} de 5.0 ({reviews.length} avaliações)</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 self-stretch sm:self-auto">
            <button
              onClick={() => setShowReviewModal(true)}
              className="flex-1 sm:flex-initial px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs rounded-xl border border-emerald-200 transition"
            >
              Deixar Avaliação
            </button>
          </div>

        </div>

        {profileUser.bio && (
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-xs sm:text-sm text-slate-700 leading-relaxed font-normal">
            <p className="font-bold text-slate-900 mb-1">Sobre o Anunciante:</p>
            <p>{profileUser.bio}</p>
          </div>
        )}
      </div>

      {/* User Ads Grid */}
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Store className="w-5 h-5 text-emerald-600" />
          <h2 className="text-xl font-bold text-slate-900">
            Anúncios Ativos de {profileUser.name.split(' ')[0]} ({userAds.length})
          </h2>
        </div>

        {userAds.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {userAds.map(ad => (
              <AdCard key={ad.id} ad={ad} onContactClick={setSelectedAdForContact} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-10 text-center border border-slate-200 text-xs text-slate-500">
            Este anunciante não tem anúncios ativos de momento.
          </div>
        )}
      </div>

      {/* Reviews Section */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
        <h3 className="text-lg font-bold text-slate-900">Histórico de Avaliações</h3>
        {reviews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reviews.map(rev => (
              <div key={rev.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-xs">{rev.authorName}</span>
                  <div className="flex items-center gap-1 text-amber-500 text-xs font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-500" />
                    <span>{rev.rating}.0</span>
                  </div>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">{rev.comment}</p>
                <span className="text-[10px] text-slate-400 block">{new Date(rev.createdAt).toLocaleDateString('pt-MZ')}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-500 font-medium text-center py-4 bg-slate-50 rounded-2xl">
            Ainda não foram registadas avaliações para este utilizador.
          </p>
        )}
      </div>

      {/* Modals */}
      {showReviewModal && (
        <ReviewModal
          targetUserId={profileUser.id}
          targetUserName={profileUser.name}
          onClose={() => setShowReviewModal(false)}
          onSuccess={loadProfile}
        />
      )}

      {selectedAdForContact && (
        <ContactModal
          ad={selectedAdForContact}
          onClose={() => setSelectedAdForContact(null)}
        />
      )}

    </div>
  );
}
