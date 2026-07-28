'use client';

import React, { useState, useEffect, useCallback, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  MapPin, 
  Phone, 
  MessageSquare, 
  Heart, 
  Share2, 
  ShieldAlert, 
  CheckCircle2, 
  Sparkles, 
  Calendar, 
  Eye, 
  Star, 
  ArrowLeft,
  ChevronRight,
  User,
  ShieldCheck,
  Clock
} from 'lucide-react';
import { initializeStore, getAdById, getAdByIdAsync, getAds, getAdsAsync, getUserReviews, getUserReviewsAsync, toggleFavorite, isFavorite, getCurrentUser } from '../../../lib/store';
import { Ad, Review } from '../../../lib/types';
import ContactModal from '../../../components/ads/ContactModal';
import ReviewModal from '../../../components/ads/ReviewModal';
import ReportModal from '../../../components/ads/ReportModal';
import AdCard from '../../../components/ads/AdCard';
import { useToast } from '../../../components/ui/Toast';

export default function AdDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { showToast } = useToast();
  const currentUser = getCurrentUser();
  const currentUserId = currentUser?.id;

  const [ad, setAd] = useState<Ad | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [relatedAds, setRelatedAds] = useState<Ad[]>([]);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const [isFav, setIsFav] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  const loadAd = useCallback(async () => {
    initializeStore();
    const loadedAd = await getAdByIdAsync(resolvedParams.id);
    if (loadedAd) {
      setAd(loadedAd);
      if (currentUserId) {
        setIsFav(isFavorite(currentUserId, loadedAd.id));
      }
      if (loadedAd.userId) {
        const userRevs = await getUserReviewsAsync(loadedAd.userId);
        setReviews(userRevs);
      }

      // Load related ads
      const allCategoryAds = await getAdsAsync({ categoryId: loadedAd.categoryId, status: 'active' });
      const related = allCategoryAds
        .filter(a => a.id !== loadedAd.id)
        .slice(0, 4);
      setRelatedAds(related);
    }
  }, [resolvedParams.id, currentUserId]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadAd();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadAd]);

  if (!ad) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <p className="text-base font-semibold text-slate-600">Anúncio não encontrado ou removido.</p>
        <Link href="/anuncios" className="inline-block px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold">
          Voltar à Lista de Anúncios
        </Link>
      </div>
    );
  }

  const imagesList = ad.images && ad.images.length > 0 
    ? ad.images 
    : [ad.coverImage || 'https://images.unsplash.com/photo-1584824486509-112e4181ff6b?auto=format&fit=crop&q=80&w=800'];

  const formattedPrice = ad.price === null || ad.price === undefined
    ? 'A combinar'
    : `${ad.price.toLocaleString('pt-MZ')} MT`;

  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  const handleToggleFavorite = () => {
    if (!currentUser) {
      showToast('Inicie sessão para guardar nos favoritos.', 'info');
      return;
    }
    const updated = toggleFavorite(currentUser.id, ad.id);
    setIsFav(updated);
    showToast(updated ? 'Guardado nos favoritos!' : 'Removido dos favoritos.');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: ad.title,
        text: `Veja este anúncio no Rent Market: ${ad.title}`,
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      showToast('Link do anúncio copiado para a área de transferência!');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 pb-28 md:pb-8">
      
      {/* Breadcrumbs & Back */}
      <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
        <Link href="/anuncios" className="flex items-center gap-1 hover:text-emerald-700 transition">
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar aos Anúncios</span>
        </Link>

        <div className="hidden sm:flex items-center gap-1.5 text-slate-400">
          <Link href="/" className="hover:text-slate-700">Início</Link>
          <ChevronRight className="w-3 h-3" />
          <Link href="/anuncios" className="hover:text-slate-700">Quelimane</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-slate-700 font-bold truncate max-w-[200px]">{ad.categoryName || 'Geral'}</span>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Col: Photo Gallery & Details (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Photo Gallery Box */}
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden p-3 shadow-xs space-y-3">
            <div className="relative aspect-16/10 w-full bg-slate-900 rounded-2xl overflow-hidden group">
              <img
                src={imagesList[activeImageIndex]}
                alt={ad.title}
                className="w-full h-full object-contain"
              />

              {ad.isFeatured && (
                <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-amber-500 text-white font-bold text-xs shadow-md flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Destaque</span>
                </span>
              )}

              <div className="absolute top-4 right-4 flex items-center gap-2">
                <button
                  onClick={handleToggleFavorite}
                  className={`p-2.5 rounded-full backdrop-blur-md transition ${
                    isFav ? 'bg-red-500 text-white' : 'bg-white/80 text-slate-700 hover:bg-white'
                  }`}
                  title="Guardar Anúncio"
                >
                  <Heart className={`w-4 h-4 ${isFav ? 'fill-white' : ''}`} />
                </button>
                <button
                  onClick={handleShare}
                  className="p-2.5 rounded-full bg-white/80 text-slate-700 hover:bg-white backdrop-blur-md transition"
                  title="Partilhar Anúncio"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Thumbnail Selector */}
            {imagesList.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {imagesList.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`w-20 h-16 rounded-xl overflow-hidden border-2 transition shrink-0 ${
                      activeImageIndex === idx ? 'border-emerald-600 ring-2 ring-emerald-600/30' : 'border-slate-200 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt={`Miniatura ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Ad Main Overview Info */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
            
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500">
                <span className={`px-2.5 py-0.5 rounded-full uppercase tracking-wider text-[10px] ${
                  ad.listingType === 'servico' ? 'bg-blue-100 text-blue-800' : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {ad.listingType === 'servico' ? 'Serviço' : 'Produto'}
                </span>
                <span>&bull;</span>
                <span>{ad.categoryName}</span>
                <span>&bull;</span>
                <span className="text-slate-700 font-bold">{ad.subcategory}</span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
                {ad.title}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1 border-t border-slate-100">
                <span className="flex items-center gap-1 font-semibold text-slate-700">
                  <MapPin className="w-4 h-4 text-emerald-600" />
                  {ad.bairro}, Quelimane
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  {new Date(ad.createdAt).toLocaleDateString('pt-MZ')}
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="w-4 h-4 text-slate-400" />
                  {ad.viewsCount} visualizações
                </span>
              </div>
            </div>

            {/* Price Banner */}
            <div className="p-4 bg-slate-900 text-white rounded-2xl flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-400">Preço Solicitado:</p>
                <p className="text-2xl sm:text-3xl font-black text-emerald-400">{formattedPrice}</p>
              </div>
              <span className="px-3 py-1 bg-slate-800 text-slate-300 font-semibold text-xs rounded-xl border border-slate-700">
                {ad.priceType === 'fixed' && 'Preço Fixo'}
                {ad.priceType === 'starting_at' && 'A partir de'}
                {ad.priceType === 'negotiable' && 'A combinar'}
              </span>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <h3 className="font-bold text-slate-900 text-base">Descrição Detalhada:</h3>
              <p className="text-slate-700 text-sm sm:text-base leading-relaxed whitespace-pre-line font-normal">
                {ad.description}
              </p>
            </div>

            {/* Report Button */}
            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setShowReportModal(true)}
                className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-red-600 font-medium transition"
              >
                <ShieldAlert className="w-4 h-4" />
                <span>Denunciar este anúncio</span>
              </button>
            </div>

          </div>

          {/* Seller Reviews Section */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Avaliações do Anunciante</h3>
                <p className="text-xs text-slate-500">Comentários de clientes que já contactaram {ad.user?.name}</p>
              </div>

              <button
                onClick={() => setShowReviewModal(true)}
                className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs rounded-xl border border-emerald-200 transition"
              >
                Deixar Avaliação
              </button>
            </div>

            {reviews.length > 0 ? (
              <div className="space-y-4">
                {reviews.map(rev => (
                  <div key={rev.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <img
                          src={rev.authorAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=300'}
                          alt={rev.authorName}
                          className="w-7 h-7 rounded-full object-cover"
                        />
                        <span className="font-bold text-slate-900 text-xs">{rev.authorName}</span>
                      </div>
                      <div className="flex items-center gap-1 text-amber-500 text-xs font-bold">
                        <Star className="w-3.5 h-3.5 fill-amber-500" />
                        <span>{rev.rating}.0</span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed font-normal">{rev.comment}</p>
                    <span className="text-[10px] text-slate-400 block">{new Date(rev.createdAt).toLocaleDateString('pt-MZ')}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 font-medium text-center py-4 bg-slate-50 rounded-2xl">
                Ainda não há avaliações registradas para este anunciante. Seja o primeiro a avaliar!
              </p>
            )}
          </div>

        </div>

        {/* Right Col: Sticky Contact Sidebar */}
        <div className="space-y-6">
          
          {/* Main Action Box */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-md space-y-5 sticky top-24">
            
            <div className="text-center pb-4 border-b border-slate-100 space-y-1">
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Contacto Direto</span>
              <h3 className="font-bold text-slate-900 text-lg">Negociar com o Anunciante</h3>
            </div>

            {/* Visible Contact Number Box */}
            {(ad.phone || ad.whatsapp) && (
              <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200 text-center space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                  Número de Contacto Direto:
                </span>
                <div className="flex items-center justify-center gap-2 text-emerald-950 font-black text-base sm:text-lg">
                  <Phone className="w-5 h-5 text-emerald-600" />
                  <a href={`tel:${ad.phone || ad.whatsapp}`} className="hover:underline">
                    {ad.phone || ad.whatsapp}
                  </a>
                </div>
              </div>
            )}

            {/* Primary Action Button */}
            <button
              onClick={() => setShowContactModal(true)}
              className="w-full py-4 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-2xl shadow-lg transition transform active:scale-98 flex items-center justify-center gap-2"
            >
              <Phone className="w-5 h-5" />
              <span>Abrir Opções WhatsApp &amp; Chamada</span>
            </button>

            {/* Advertiser Card */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
              <div className="flex items-center gap-3">
                <img
                  src={ad.user?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300'}
                  alt={ad.user?.name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-emerald-600"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <h4 className="font-bold text-slate-900 text-sm truncate">{ad.user?.name}</h4>
                    {ad.user?.verificationStatus === 'verified' && (
                      <span title="Verificado">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 font-medium">
                    {ad.user?.bairro || ad.bairro}, Quelimane
                  </p>
                </div>
              </div>

              {ad.user?.bio && (
                <p className="text-xs text-slate-600 leading-relaxed italic border-t border-slate-200/60 pt-2">
                  &quot;{ad.user.bio}&quot;
                </p>
              )}

              <Link
                href={`/perfil/${ad.userId}`}
                className="w-full py-2 bg-white hover:bg-slate-100 text-slate-800 text-xs font-bold rounded-xl border border-slate-300 flex items-center justify-center gap-1 transition"
              >
                <User className="w-3.5 h-3.5 text-emerald-600" />
                <span>Ver Todos os Anúncios do Vendedor</span>
              </Link>
            </div>

            {/* Safety Box */}
            <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-amber-950">
                <ShieldCheck className="w-4 h-4 text-amber-600" />
                <span>Negociação Segura em Quelimane</span>
              </div>
              <p className="leading-relaxed text-[11px]">
                Encontre-se em locais públicos e movimentados para verificar o item ou serviço antes de realizar transferências móveis (M-Pesa / e-Mola).
              </p>
            </div>

          </div>

        </div>

      </div>

      {/* RELATED ADS */}
      {relatedAds.length > 0 && (
        <section className="pt-8 border-t border-slate-200 space-y-6">
          <h2 className="text-xl font-bold text-slate-900">Anúncios Relacionados em Quelimane</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedAds.map(relAd => (
              <AdCard key={relAd.id} ad={relAd} />
            ))}
          </div>
        </section>
      )}

      {/* Fixed Sticky Mobile Contact Bar */}
      <div className="md:hidden fixed bottom-14 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200 p-3 shadow-xl flex items-center gap-2">
        <a
          href={`tel:${ad.phone}`}
          className="flex-1 py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-1.5"
        >
          <Phone className="w-4 h-4 text-emerald-400" />
          <span>Ligar</span>
        </a>

        <button
          onClick={() => setShowContactModal(true)}
          className="flex-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5"
        >
          <MessageSquare className="w-4 h-4" />
          <span>Ver Contactos &amp; WhatsApp</span>
        </button>
      </div>

      {/* Modals */}
      {showContactModal && (
        <ContactModal ad={ad} onClose={() => setShowContactModal(false)} />
      )}

      {showReviewModal && ad.userId && (
        <ReviewModal
          targetUserId={ad.userId}
          targetUserName={ad.user?.name || 'Anunciante'}
          adId={ad.id}
          onClose={() => setShowReviewModal(false)}
          onSuccess={loadAd}
        />
      )}

      {showReportModal && (
        <ReportModal
          adId={ad.id}
          adTitle={ad.title}
          reportedUserId={ad.userId}
          onClose={() => setShowReportModal(false)}
        />
      )}

    </div>
  );
}
