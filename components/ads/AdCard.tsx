'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  MapPin, 
  Heart, 
  Sparkles, 
  CheckCircle2, 
  MessageSquare, 
  Phone, 
  Star,
  Eye,
  Clock
} from 'lucide-react';
import { Ad } from '../../lib/types';
import { getCurrentUser, toggleFavorite, isFavorite, getUserReviews } from '../../lib/store';
import { useToast } from '../ui/Toast';

interface AdCardProps {
  ad: Ad;
  onContactClick?: (ad: Ad) => void;
}

export default function AdCard({ ad, onContactClick }: AdCardProps) {
  const { showToast } = useToast();
  const currentUser = getCurrentUser();
  const [favorite, setFavorite] = useState(() => 
    currentUser ? isFavorite(currentUser.id, ad.id) : false
  );
  const [now] = useState(() => Date.now());

  const reviews = ad.userId ? getUserReviews(ad.userId) : [];
  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!currentUser) {
      showToast('Inicie sessão para guardar nos favoritos.', 'info');
      return;
    }
    const isNowFav = toggleFavorite(currentUser.id, ad.id);
    setFavorite(isNowFav);
    showToast(isNowFav ? 'Anúncio guardado nos favoritos!' : 'Removido dos favoritos.');
  };

  const formattedPrice = ad.price === null || ad.price === undefined
    ? 'A combinar'
    : `${ad.price.toLocaleString('pt-MZ')} MT`;

  const isNew = (() => {
    if (!ad.createdAt) return false;
    const createdTime = new Date(ad.createdAt).getTime();
    if (isNaN(createdTime)) return false;
    const diffHours = (now - createdTime) / (1000 * 60 * 60);
    return diffHours >= 0 && diffHours <= 24;
  })();

  return (
    <div className={`AdCard group relative bg-white rounded-2xl overflow-hidden shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between border ${
      ad.isFeatured ? 'border-2 border-emerald-500/20 shadow-xs' : 'border-slate-100 hover:border-slate-200'
    }`}>
      
      {/* Cover Image & Badges */}
      <div className="relative aspect-4/3 w-full bg-slate-200 overflow-hidden">
        <Link href={`/anuncio/${ad.id}`}>
          <img
            src={ad.coverImage || (ad.images && ad.images[0]) || 'https://images.unsplash.com/photo-1584824486509-112e4181ff6b?auto=format&fit=crop&q=80&w=800'}
            alt={ad.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        </Link>

        {/* Favorite Button */}
        <button
          onClick={handleFavoriteClick}
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all shadow-sm ${
            favorite
              ? 'bg-red-500 text-white hover:bg-red-600'
              : 'bg-white/80 text-slate-700 hover:bg-white hover:text-red-500'
          }`}
          title={favorite ? 'Remover dos Favoritos' : 'Guardar nos Favoritos'}
        >
          <Heart className={`w-3.5 h-3.5 ${favorite ? 'fill-white' : ''}`} />
        </button>

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1 items-start z-10">
          {isNew && (
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-white font-extrabold text-[10px] tracking-wider uppercase shadow-md flex items-center gap-1 animate-fade-in border border-amber-300/40">
              <Sparkles className="w-3 h-3 fill-amber-200" />
              <span>NOVO</span>
            </span>
          )}

          {ad.isFeatured && (
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-600 text-white font-bold text-[10px] tracking-wide uppercase shadow-sm flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              <span>DESTAQUE</span>
            </span>
          )}

          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-tight backdrop-blur-sm shadow-xs ${
            ad.listingType === 'servico'
              ? 'bg-white/90 text-slate-700'
              : 'bg-slate-900/90 text-white'
          }`}>
            {ad.listingType === 'servico' ? 'Serviço' : 'Produto'}
          </span>
        </div>

        {/* Price Tag Overlay */}
        <div className="absolute bottom-3 left-3 bg-slate-900/90 backdrop-blur-md text-white px-3 py-1 rounded-xl text-xs sm:text-sm font-bold shadow-sm border border-white/10">
          {formattedPrice}
        </div>
      </div>

      {/* Card Details Body */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        
        <div className="space-y-1.5">
          {/* Category & Subcategory */}
          <div className="flex items-center justify-between text-[11px] font-medium text-slate-500">
            <span className="truncate max-w-[180px]">{ad.categoryName || 'Geral'} &bull; {ad.subcategory}</span>
            <div className="flex items-center gap-1 text-slate-400">
              <Eye className="w-3 h-3" />
              <span>{ad.viewsCount}</span>
            </div>
          </div>

          {/* Title */}
          <Link href={`/anuncio/${ad.id}`}>
            <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-snug line-clamp-2 group-hover:text-emerald-700 transition">
              {ad.title}
            </h3>
          </Link>
        </div>

        {/* Bairro & Seller Info */}
        <div className="pt-2 border-t border-slate-100 space-y-2">
          
          <div className="flex items-center justify-between text-xs text-slate-600">
            <div className="flex items-center gap-1 text-slate-600 font-medium">
              <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="truncate max-w-[140px]">{ad.bairro}</span>
            </div>

            {avgRating && (
              <div className="flex items-center gap-1 text-amber-600 font-bold text-xs bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                <span>{avgRating}</span>
              </div>
            )}
          </div>

          {/* Seller Preview & Direct Contact Button */}
          <div className="flex items-center justify-between pt-1">
            <Link 
              href={`/perfil/${ad.userId}`}
              className="flex items-center gap-2 group/user max-w-[150px] truncate"
            >
              {ad.user?.avatarUrl ? (
                <img
                  src={ad.user.avatarUrl}
                  alt={ad.user.name}
                  className="w-6 h-6 rounded-full object-cover border border-slate-200"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-600 text-[10px] font-bold flex items-center justify-center">
                  {ad.user?.name.charAt(0) || 'A'}
                </div>
              )}
              <span className="text-xs text-slate-700 font-medium group-hover/user:text-emerald-600 truncate">
                {ad.user?.name.split(' ')[0] || 'Anunciante'}
              </span>
              {ad.user?.verificationStatus === 'verified' && (
                <span title="Verificado">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                </span>
              )}
            </Link>

            {/* Quick Contact Button displaying phone number */}
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (onContactClick) onContactClick(ad);
              }}
              className="px-2.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-600 text-emerald-800 hover:text-white text-xs font-bold transition flex items-center gap-1 shrink-0 border border-emerald-200 shadow-2xs"
              title={`Ligar / WhatsApp: ${ad.phone || ad.whatsapp || 'Contactar'}`}
            >
              <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="text-[11px]">
                {ad.phone ? ad.phone.replace('+258 ', '') : 'Contactar'}
              </span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
