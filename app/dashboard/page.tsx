'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Store, 
  MessageSquare, 
  Heart, 
  Sparkles, 
  ShieldCheck, 
  Settings, 
  PlusCircle, 
  Eye, 
  Phone, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Edit, 
  Trash2, 
  Send, 
  Upload, 
  Save, 
  MapPin, 
  User,
  Zap,
  ChevronRight,
  X,
  Loader2,
  Link as LinkIcon,
  FileText,
  Pause,
  Play
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { uploadProductImage, isSupabaseConfigured } from '../../lib/supabase';
import { notifyAdvertiserNewMessage } from '../../lib/gmailNotifier';
import { 
  initializeStore, 
  getCurrentUser, 
  getAds, 
  getAdsAsync, 
  getMessages, 
  getMessagesAsync, 
  getFavorites, 
  getFavoritesAsync, 
  renewAdAsync, 
  deleteAdAsync, 
  updateAdAsync, 
  sendMessageAsync, 
  updateUserProfileAsync, 
  submitVerificationRequest,
  getVerificationRequests,
  getSettings
} from '../../lib/store';
import { Ad, UserProfile, Message, VerificationRequest } from '../../lib/types';
import PaymentModal from '../../components/payments/PaymentModal';
import { QUELIMANE_BAIRROS } from '../../lib/data/initialData';
import { useToast } from '../../components/ui/Toast';

function DashboardContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { showToast } = useToast();

  const [user, setUser] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState<string>(searchParams?.get('tab') || 'ads');

  // User Ads state
  const [myAds, setMyAds] = useState<Ad[]>([]);
  const [recentlyToggledId, setRecentlyToggledId] = useState<string | null>(null);
  
  // Messages state
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedPartnerId, setSelectedPartnerId] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');

  // Favorites state
  const [favoriteAds, setFavoriteAds] = useState<Ad[]>([]);

  // Verification state
  const [docType, setDocType] = useState<'bi' | 'nuit' | 'licenca'>('bi');
  const [docNumber, setDocNumber] = useState('');
  
  // Front image
  const [docFrontPath, setDocFrontPath] = useState('');
  const [docFrontPreviewUrl, setDocFrontPreviewUrl] = useState('');
  const [uploadingFront, setUploadingFront] = useState(false);
  
  // Back image (BI require front & back)
  const [docBackPath, setDocBackPath] = useState('');
  const [docBackPreviewUrl, setDocBackPreviewUrl] = useState('');
  const [uploadingBack, setUploadingBack] = useState(false);

  const [docPreviewModal, setDocPreviewModal] = useState<{ title: string; url: string } | null>(null);
  const [verificationReqs, setVerificationReqs] = useState<VerificationRequest[]>([]);
  
  const docFrontInputRef = React.useRef<HTMLInputElement | null>(null);
  const docBackInputRef = React.useRef<HTMLInputElement | null>(null);

  // Settings State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [bairro, setBairro] = useState('');
  const [bio, setBio] = useState('');

  // Payment Modal State
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [boostTargetAd, setBoostTargetAd] = useState<Ad | null>(null);

  const loadDashboard = useCallback(async () => {
    initializeStore();
    const currentUser = getCurrentUser();
    if (!currentUser) {
      router.push('/login');
      return;
    }
    setUser(currentUser);

    // Load ads
    const ads = await getAdsAsync({ userId: currentUser.id, status: 'all' });
    setMyAds(ads);

    // Load messages
    const msgs = await getMessagesAsync(currentUser.id);
    setMessages(msgs);
    if (msgs.length > 0 && !selectedPartnerId) {
      const firstPartner = msgs[0].senderId === currentUser.id ? msgs[0].receiverId : msgs[0].senderId;
      setSelectedPartnerId(firstPartner);
    }

    // Load favorites
    const favs = await getFavoritesAsync(currentUser.id);
    setFavoriteAds(favs);

    // Load verifications
    const verifs = getVerificationRequests().filter(v => v.userId === currentUser.id);
    setVerificationReqs(verifs);

    // Profile Settings
    setName(currentUser.name);
    setPhone(currentUser.phone);
    setWhatsapp(currentUser.whatsapp || currentUser.phone);
    setBairro(currentUser.bairro);
    setBio(currentUser.bio || '');
  }, [router, selectedPartnerId]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadDashboard();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadDashboard, searchParams]);

  if (!user) return null;

  const activeAdsCount = myAds.filter(a => a.status === 'active').length;
  const pendingAdsCount = myAds.filter(a => a.status === 'pending_approval').length;
  const expiredAdsCount = myAds.filter(a => a.status === 'expired').length;

  const totalViews = myAds.reduce((sum, a) => sum + a.viewsCount, 0);
  const totalContacts = myAds.reduce((sum, a) => sum + a.contactsCount, 0);

  const handleRenewAd = async (id: string) => {
    await renewAdAsync(id);
    showToast('Anúncio renovado por mais 30 dias!');
    await loadDashboard();
  };

  const handleTogglePause = async (ad: Ad) => {
    const newStatus = ad.status === 'active' ? 'paused' : 'active';
    setRecentlyToggledId(ad.id);
    await updateAdAsync(ad.id, { status: newStatus });
    showToast(newStatus === 'paused' ? 'Anúncio pausado com sucesso.' : 'Anúncio reativado e visível!');
    await loadDashboard();
    setTimeout(() => {
      setRecentlyToggledId(null);
    }, 1500);
  };

  const handleDeleteAd = async (id: string) => {
    if (window.confirm('Tem certeza que deseja apagar este anúncio?')) {
      await deleteAdAsync(id);
      showToast('Anúncio apagado.');
      await loadDashboard();
    }
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyContent.trim() || !selectedPartnerId) return;

    const partnerMsgs = messages.filter(m => m.senderId === selectedPartnerId || m.receiverId === selectedPartnerId);
    const lastMsg = partnerMsgs[partnerMsgs.length - 1];

    const receiverName = lastMsg?.senderId === user.id ? lastMsg.receiverName || 'Utilizador' : lastMsg.senderName || 'Utilizador';
    const adTitle = lastMsg?.adTitle || 'Contacto no Mussika Online';
    const adId = lastMsg?.adId || 'ad_1';

    await sendMessageAsync({
      adId,
      adTitle,
      senderId: user.id,
      senderName: user.name,
      receiverId: selectedPartnerId,
      receiverName,
      content: replyContent.trim()
    });

    // Notify recipient via Gmail service
    await notifyAdvertiserNewMessage({
      adId,
      adTitle,
      senderName: user.name,
      receiverId: selectedPartnerId,
      receiverName,
      messageContent: replyContent.trim()
    });

    setReplyContent('');
    showToast('Resposta enviada (e notificação enviada ao utilizador)!', 'success');
    loadDashboard();
  };

  const handleDocFrontFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type && !file.type.startsWith('image/')) {
      showToast('Por favor selecione um ficheiro de imagem válido (JPG, PNG, WEBP).', 'error');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      showToast('A imagem do documento é demasiado grande (máximo 10MB).', 'error');
      return;
    }

    const localPreview = URL.createObjectURL(file);
    setDocFrontPreviewUrl(localPreview);
    setUploadingFront(true);

    try {
      const { uploadPrivateDocument } = await import('../../lib/api/verification');
      const { path } = await uploadPrivateDocument(file, user.id);
      if (path) {
        setDocFrontPath(path);
        showToast('Foto da frente carregada com sucesso!', 'info');
      } else {
        const fallbackUrl = await uploadProductImage(file);
        setDocFrontPath(fallbackUrl);
        setDocFrontPreviewUrl(fallbackUrl);
        showToast('Foto da frente anexada!', 'info');
      }
    } catch (err) {
      console.error('Erro ao carregar documento:', err);
      showToast('Erro ao processar a foto da frente.', 'error');
    } finally {
      setUploadingFront(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleDocBackFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type && !file.type.startsWith('image/')) {
      showToast('Por favor selecione um ficheiro de imagem válido (JPG, PNG, WEBP).', 'error');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      showToast('A imagem do documento é demasiado grande (máximo 10MB).', 'error');
      return;
    }

    const localPreview = URL.createObjectURL(file);
    setDocBackPreviewUrl(localPreview);
    setUploadingBack(true);

    try {
      const { uploadPrivateDocument } = await import('../../lib/api/verification');
      const { path } = await uploadPrivateDocument(file, user.id);
      if (path) {
        setDocBackPath(path);
        showToast('Foto do verso carregada com sucesso!', 'info');
      } else {
        const fallbackUrl = await uploadProductImage(file);
        setDocBackPath(fallbackUrl);
        setDocBackPreviewUrl(fallbackUrl);
        showToast('Foto do verso anexada!', 'info');
      }
    } catch (err) {
      console.error('Erro ao carregar verso:', err);
      showToast('Erro ao processar a foto do verso.', 'error');
    } finally {
      setUploadingBack(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleSubmitVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docNumber.trim()) {
      showToast('Insira o número do documento.', 'error');
      return;
    }

    if (docType === 'bi') {
      if (!docFrontPreviewUrl) {
        showToast('Para o BI (Bilhete de Identidade), é obrigatório anexar a FRENTE do documento.', 'error');
        return;
      }
      if (!docBackPreviewUrl) {
        showToast('Para o BI (Bilhete de Identidade), é obrigatório anexar o VERSO do documento.', 'error');
        return;
      }
    } else {
      if (!docFrontPreviewUrl) {
        showToast('Por favor, faça upload da foto do documento.', 'error');
        return;
      }
    }

    const frontPathVal = docFrontPath || docFrontPreviewUrl;
    const backPathVal = docBackPath || docBackPreviewUrl;

    const combinedImagePath = backPathVal ? `${frontPathVal},${backPathVal}` : frontPathVal;
    const combinedImageUrl = docBackPreviewUrl ? `${docFrontPreviewUrl},${docBackPreviewUrl}` : docFrontPreviewUrl;

    if (isSupabaseConfigured) {
      try {
        const { createVerificationRequestSupabase } = await import('../../lib/api/verification');
        await createVerificationRequestSupabase({
          userId: user.id,
          documentType: docType,
          documentNumber: docNumber.trim(),
          documentImagePath: combinedImagePath
        });
      } catch (err) {
        console.warn('Erro ao guardar pedido de verificação no Supabase:', err);
      }
    }

    submitVerificationRequest({
      userId: user.id,
      userName: user.name,
      userPhone: user.phone,
      documentType: docType,
      documentNumber: docNumber.trim(),
      documentImageUrl: combinedImageUrl,
      documentBackImageUrl: docBackPreviewUrl || undefined,
      documentImagePath: combinedImagePath
    });

    showToast('Solicitação de verificação submetida! A nossa equipa analisará o seu documento.');
    loadDashboard();
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateUserProfileAsync(user.id, {
      name: name.trim(),
      phone: phone.trim(),
      whatsapp: whatsapp.trim(),
      bairro,
      bio: bio.trim()
    });

    showToast('Dados de perfil guardados com sucesso!');
    await loadDashboard();
  };

  // Group messages by partner user
  const chatPartnersMap = new Map<string, { partnerName: string; lastMsg: Message; unread: boolean }>();
  messages.forEach(m => {
    const partnerId = m.senderId === user.id ? m.receiverId : m.senderId;
    const partnerName = m.senderId === user.id ? m.receiverName || 'Utilizador' : m.senderName || 'Utilizador';
    chatPartnersMap.set(partnerId, {
      partnerName,
      lastMsg: m,
      unread: m.receiverId === user.id && !m.read
    });
  });
  const chatPartners = Array.from(chatPartnersMap.entries());

  const currentChatMsgs = selectedPartnerId 
    ? messages.filter(m => m.senderId === selectedPartnerId || m.receiverId === selectedPartnerId)
    : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Banner & Overview Cards */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <img
              src={user.avatarUrl}
              alt={user.name}
              className="w-16 h-16 rounded-full object-cover border-2 border-emerald-600"
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900">{user.name}</h1>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  user.plan === 'pro' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'
                }`}>
                  Plano {user.plan}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">{user.bairro}, Quelimane &bull; {user.phone}</p>
            </div>
          </div>

          <Link
            href="/anunciar"
            className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Publicar Novo Anúncio</span>
          </Link>
        </div>

        {/* Overview Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-100 text-xs">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <span className="text-slate-500 font-medium block">Anúncios Ativos:</span>
            <span className="text-2xl font-black text-emerald-700">{activeAdsCount}</span>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <span className="text-slate-500 font-medium block">Visualizações Totais:</span>
            <span className="text-2xl font-black text-slate-900">{totalViews}</span>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <span className="text-slate-500 font-medium block">Contactos Recebidos:</span>
            <span className="text-2xl font-black text-blue-700">{totalContacts}</span>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <span className="text-slate-500 font-medium block">Estado da Verificação:</span>
            <span className={`text-sm font-bold block pt-1 ${
              user.verificationStatus === 'verified' ? 'text-emerald-700' : 'text-amber-700'
            }`}>
              {user.verificationStatus === 'verified' ? 'Identidade Verificada' : 'Não Verificado'}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex overflow-x-auto gap-2 border-b border-slate-200 pb-2 text-xs font-bold text-slate-600">
        {[
          { id: 'ads', label: 'Meus Anúncios', icon: <Store className="w-4 h-4" /> },
          { id: 'messages', label: 'Mensagens / Chat', icon: <MessageSquare className="w-4 h-4" /> },
          { id: 'favorites', label: 'Favoritos Guardados', icon: <Heart className="w-4 h-4" /> },
          { id: 'plan', label: 'Meu Plano & Destaques', icon: <Sparkles className="w-4 h-4 text-amber-500" /> },
          { id: 'verification', label: 'Selo de Verificação', icon: <ShieldCheck className="w-4 h-4" /> },
          { id: 'settings', label: 'Definições da Conta', icon: <Settings className="w-4 h-4" /> }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-3 rounded-2xl transition whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* TAB 1: MEUS ANÚNCIOS */}
      {activeTab === 'ads' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Gestão dos Seus Anúncios em Quelimane</h2>
            <span className="text-xs font-semibold text-slate-500">Total: {myAds.length} anúncio(s)</span>
          </div>

          {myAds.length > 0 ? (
            <div className="space-y-4">
              <AnimatePresence>
                {myAds.map(ad => {
                  const isRecentlyToggled = recentlyToggledId === ad.id;
                  const isPaused = ad.status === 'paused';
                  return (
                    <motion.div
                      key={ad.id}
                      layout
                      initial={{ opacity: 0, y: 12 }}
                      animate={{
                        opacity: isPaused ? 0.85 : 1,
                        y: 0,
                        scale: isRecentlyToggled ? [1, 1.015, 1] : 1,
                      }}
                      transition={{ duration: 0.3 }}
                      className={`rounded-3xl border p-4 sm:p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors duration-300 ${
                        isPaused
                          ? 'bg-slate-50/90 border-slate-300/80'
                          : 'bg-white border-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="relative shrink-0">
                          <img
                            src={ad.coverImage}
                            alt={ad.title}
                            className={`w-20 h-20 rounded-2xl object-cover border shrink-0 transition-all duration-300 ${
                              isPaused ? 'border-slate-300 grayscale-[25%]' : 'border-slate-200'
                            }`}
                          />
                          {isPaused && (
                            <div className="absolute inset-0 bg-slate-900/20 rounded-2xl flex items-center justify-center">
                              <Pause className="w-6 h-6 text-white drop-shadow-md" />
                            </div>
                          )}
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <AnimatePresence mode="wait">
                              <motion.span
                                key={ad.status}
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.8, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase inline-flex items-center gap-1.5 shadow-2xs ${
                                  ad.status === 'active' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                                  ad.status === 'pending_approval' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                                  ad.status === 'paused' ? 'bg-slate-200 text-slate-700 border border-slate-300' :
                                  'bg-slate-100 text-slate-600 border border-slate-200'
                                }`}
                              >
                                {ad.status === 'active' && (
                                  <>
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    Ativo
                                  </>
                                )}
                                {ad.status === 'pending_approval' && 'Pendente Aprovação'}
                                {ad.status === 'paused' && (
                                  <>
                                    <Pause className="w-3 h-3 text-slate-600" />
                                    Pausado
                                  </>
                                )}
                                {ad.status === 'expired' && 'Expirado'}
                              </motion.span>
                            </AnimatePresence>

                            {ad.isFeatured && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-white flex items-center gap-0.5 shadow-2xs">
                                <Sparkles className="w-3 h-3" /> Destaque
                              </span>
                            )}

                            <AnimatePresence>
                              {isRecentlyToggled && (
                                <motion.span
                                  initial={{ opacity: 0, x: -8, scale: 0.9 }}
                                  animate={{ opacity: 1, x: 0, scale: 1 }}
                                  exit={{ opacity: 0, x: -8, scale: 0.9 }}
                                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                                    isPaused
                                      ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                      : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                                  }`}
                                >
                                  {isPaused ? 'Pausado!' : 'Reativado!'}
                                </motion.span>
                              )}
                            </AnimatePresence>
                          </div>

                          <Link href={`/anuncio/${ad.id}`} className="font-bold text-slate-900 text-sm hover:text-emerald-700 transition line-clamp-1">
                            {ad.title}
                          </Link>

                          <p className="text-xs text-slate-500 font-medium">
                            {ad.bairro} &bull; {ad.price ? `${ad.price} MT` : 'A combinar'} &bull; {ad.viewsCount} visualizações &bull; {ad.contactsCount} contactos
                          </p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-wrap items-center gap-2 self-stretch sm:self-auto pt-2 sm:pt-0 border-t sm:border-0 border-slate-100">
                        <button
                          onClick={() => handleRenewAd(ad.id)}
                          className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs rounded-xl border border-emerald-200 transition flex items-center gap-1"
                          title="Renovar Validade por mais 30 dias"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          <span>Renovar</span>
                        </button>

                        <button
                          onClick={() => {
                            setBoostTargetAd(ad);
                            setShowPaymentModal(true);
                          }}
                          className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1"
                          title="Impulsionar anúncio para o topo"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Impulsionar</span>
                        </button>

                        <Link
                          href={`/anuncio/${ad.id}/editar`}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition flex items-center gap-1"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          <span>Editar</span>
                        </Link>

                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleTogglePause(ad)}
                          className={`px-3 py-1.5 font-bold text-xs rounded-xl transition-all duration-200 flex items-center gap-1.5 shadow-2xs ${
                            ad.status === 'active'
                              ? 'bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200'
                              : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200'
                          }`}
                          title={ad.status === 'active' ? 'Pausar Anúncio (Ocultar dos resultados)' : 'Reativar Anúncio (Tornar visível)'}
                        >
                          <AnimatePresence mode="wait">
                            <motion.div
                              key={ad.status}
                              initial={{ rotate: ad.status === 'active' ? -45 : 45, opacity: 0, scale: 0.8 }}
                              animate={{ rotate: 0, opacity: 1, scale: 1 }}
                              exit={{ rotate: ad.status === 'active' ? 45 : -45, opacity: 0, scale: 0.8 }}
                              transition={{ duration: 0.18 }}
                              className="flex items-center gap-1"
                            >
                              {ad.status === 'active' ? (
                                <>
                                  <Pause className="w-3.5 h-3.5 text-amber-700" />
                                  <span>Pausar</span>
                                </>
                              ) : (
                                <>
                                  <Play className="w-3.5 h-3.5 text-emerald-600 fill-emerald-600" />
                                  <span>Reativar</span>
                                </>
                              )}
                            </motion.div>
                          </AnimatePresence>
                        </motion.button>

                        <button
                          onClick={() => handleDeleteAd(ad.id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition"
                          title="Apagar Anúncio"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
              <p className="text-sm font-semibold text-slate-600">Ainda não tem nenhum anúncio publicado.</p>
              <Link href="/anunciar" className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl font-bold text-xs">
                <PlusCircle className="w-4 h-4" />
                <span>Publicar Primeiro Anúncio Grátis</span>
              </Link>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: MENSAGENS / CHAT */}
      {activeTab === 'messages' && (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden grid grid-cols-1 md:grid-cols-3 min-h-[450px]">
          
          {/* Chat Partner List */}
          <div className="border-r border-slate-200 p-4 space-y-3 bg-slate-50">
            <h3 className="font-bold text-slate-900 text-sm">Conversas na Plataforma</h3>
            {chatPartners.length > 0 ? (
              <div className="space-y-1">
                {chatPartners.map(([partnerId, data]) => (
                  <button
                    key={partnerId}
                    onClick={() => setSelectedPartnerId(partnerId)}
                    className={`w-full text-left p-3 rounded-2xl transition flex items-center justify-between ${
                      selectedPartnerId === partnerId ? 'bg-emerald-600 text-white font-bold' : 'hover:bg-slate-200/60 text-slate-800'
                    }`}
                  >
                    <div className="truncate pr-2">
                      <p className="text-xs font-bold truncate">{data.partnerName}</p>
                      <p className={`text-[11px] truncate ${selectedPartnerId === partnerId ? 'text-emerald-100' : 'text-slate-500'}`}>
                        {data.lastMsg.content}
                      </p>
                    </div>
                    {data.unread && (
                      <span className="w-2.5 h-2.5 bg-red-500 rounded-full shrink-0"></span>
                    )}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 py-6 text-center">Nenhuma conversa direta aberta.</p>
            )}
          </div>

          {/* Active Chat Window */}
          <div className="md:col-span-2 p-4 flex flex-col justify-between bg-white space-y-4">
            {selectedPartnerId ? (
              <>
                {/* Messages Stream */}
                <div className="space-y-3 overflow-y-auto max-h-[350px] p-2">
                  {currentChatMsgs.map(m => (
                    <div
                      key={m.id}
                      className={`flex flex-col max-w-[80%] ${
                        m.senderId === user.id ? 'ml-auto items-end' : 'mr-auto items-start'
                      }`}
                    >
                      <div className={`p-3 rounded-2xl text-xs sm:text-sm font-medium ${
                        m.senderId === user.id
                          ? 'bg-emerald-600 text-white rounded-br-none'
                          : 'bg-slate-100 text-slate-800 rounded-bl-none'
                      }`}>
                        {m.content}
                      </div>
                      <span className="text-[10px] text-slate-400 mt-1 px-1">
                        {new Date(m.createdAt).toLocaleTimeString('pt-MZ', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Reply Form */}
                <form onSubmit={handleSendReply} className="flex gap-2 pt-2 border-t border-slate-100">
                  <input
                    type="text"
                    placeholder="Escreva a sua resposta..."
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                  <button
                    type="submit"
                    className="px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </>
            ) : (
              <div className="text-center py-16 text-xs text-slate-400">
                Selecione uma conversa da lista para visualizar as mensagens.
              </div>
            )}
          </div>

        </div>
      )}

      {/* TAB 3: FAVORITOS */}
      {activeTab === 'favorites' && (
        <div className="space-y-6">
          <h2 className="text-lg font-bold text-slate-900">Anúncios Guardados nos Favoritos ({favoriteAds.length})</h2>
          {favoriteAds.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {favoriteAds.map(ad => (
                <div key={ad.id} className="relative">
                  <Link href={`/anuncio/${ad.id}`}>
                    <div className="bg-white rounded-2xl border border-slate-200 p-4 hover:shadow-md transition">
                      <img src={ad.coverImage} alt={ad.title} className="w-full h-32 object-cover rounded-xl mb-2" />
                      <h4 className="font-bold text-xs text-slate-900 line-clamp-1">{ad.title}</h4>
                      <p className="text-[11px] text-emerald-700 font-bold mt-1">{ad.price ? `${ad.price} MT` : 'A combinar'}</p>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-10 text-center border border-slate-200 text-xs text-slate-500">
              Ainda não guardou nenhum anúncio nos seus favoritos.
            </div>
          )}
        </div>
      )}

      {/* TAB 4: MEU PLANO & DESTAQUES */}
      {activeTab === 'plan' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase text-amber-600 tracking-wider">Subscrição de Visibilidade</span>
              <h2 className="text-2xl font-black text-slate-900">Seu Plano Atual: {user.plan.toUpperCase()}</h2>
              <p className="text-xs text-slate-500">Aumente o alcance dos seus anúncios em Quelimane</p>
            </div>

            <button
              onClick={() => setShowPaymentModal(true)}
              className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-md transition"
            >
              Fazer Upgrade para Pro Quelimane (250 MT)
            </button>
          </div>

          <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-950 space-y-2">
            <h4 className="font-bold">Vantagens do Plano Pro Quelimane:</h4>
            <ul className="list-disc list-inside space-y-1 text-amber-900">
              <li>Anúncios ilimitados sem restrições</li>
              <li>Destaque automático no topo das buscas</li>
              <li>Selo Oficial de Anunciante Verificado</li>
              <li>Pagamento fácil por M-Pesa / e-Mola</li>
            </ul>
          </div>
        </div>
      )}

      {/* TAB 5: VERIFICAÇÃO BI / NUIT */}
      {activeTab === 'verification' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 max-w-3xl mx-auto shadow-xs">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-slate-900">Solicitar Selo Anunciante Verificado</h2>
            <p className="text-xs text-slate-500">
              Envie fotos nítidas do seu documento (Frente e Verso para BI) para transmissão de confiança aos clientes em Quelimane.
            </p>
          </div>

          {user.verificationStatus === 'verified' ? (
            <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-200 text-center space-y-2 text-emerald-900">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
              <h3 className="font-bold text-base">Identidade Verificada!</h3>
              <p className="text-xs text-emerald-800">
                O seu perfil exibe o selo oficial de verificação da nossa equipa de moderação do Mussika Online.
              </p>
            </div>
          ) : user.verificationStatus === 'pending' ? (
            <div className="p-6 bg-amber-50 rounded-2xl border border-amber-200 space-y-4 text-amber-950">
              <div className="flex items-center gap-3">
                <Clock className="w-8 h-8 text-amber-600 shrink-0" />
                <div>
                  <h3 className="font-bold text-base">Solicitação de Verificação em Análise</h3>
                  <p className="text-xs text-amber-800 mt-0.5">
                    A equipa de moderação está a analisar as fotografias do seu documento. O selo será atribuído em breve.
                  </p>
                </div>
              </div>

              {(docFrontPreviewUrl || docBackPreviewUrl) && (
                <div className="pt-3 border-t border-amber-200 space-y-2">
                  <span className="text-xs font-bold text-amber-900 block">Fotografias Enviadas para Validação:</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {docFrontPreviewUrl && (
                      <div className="bg-white p-2.5 rounded-xl border border-amber-200 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <img src={docFrontPreviewUrl} alt="Frente" className="w-14 h-11 object-cover rounded-lg border border-slate-200" />
                          <div>
                            <span className="text-xs font-bold text-slate-800 block">Frente do Documento</span>
                            <span className="text-[10px] text-emerald-700 font-semibold">✓ Anexado</span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setDocPreviewModal({ title: 'Frente Enviada', url: docFrontPreviewUrl })}
                          className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-bold rounded-lg transition flex items-center gap-1"
                        >
                          <Eye className="w-3 h-3" /> Ver
                        </button>
                      </div>
                    )}
                    {docBackPreviewUrl && (
                      <div className="bg-white p-2.5 rounded-xl border border-amber-200 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <img src={docBackPreviewUrl} alt="Verso" className="w-14 h-11 object-cover rounded-lg border border-slate-200" />
                          <div>
                            <span className="text-xs font-bold text-slate-800 block">Verso do Documento</span>
                            <span className="text-[10px] text-emerald-700 font-semibold">✓ Anexado</span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setDocPreviewModal({ title: 'Verso Enviado', url: docBackPreviewUrl })}
                          className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-bold rounded-lg transition flex items-center gap-1"
                        >
                          <Eye className="w-3 h-3" /> Ver
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmitVerification} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tipo de Documento:</label>
                  <select
                    value={docType}
                    onChange={(e: any) => setDocType(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold"
                  >
                    <option value="bi">BI (Bilhete de Identidade - Frente e Verso)</option>
                    <option value="nuit">NUIT (Documento de Identificação Fiscal)</option>
                    <option value="licenca">Licença Comercial / Alvará</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Número do Documento:</label>
                  <input
                    type="text"
                    placeholder="Ex: 040123456789A"
                    value={docNumber}
                    onChange={(e) => setDocNumber(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium"
                    required
                  />
                </div>
              </div>

              {/* Document Image Upload Inputs & Live Previews */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-emerald-600" />
                    <span>
                      {docType === 'bi' 
                        ? 'Fotografias do BI (Obrigatório: Anexar a FRENTE e o VERSO do BI)' 
                        : 'Fotografias ou Cópias do Documento'}
                    </span>
                  </label>
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    {docType === 'bi' ? '2 Imagens Requeridas' : 'Pré-visualização Ativa'}
                  </span>
                </div>

                {/* Hidden File Inputs */}
                <input
                  ref={docFrontInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleDocFrontFileSelect}
                />
                <input
                  ref={docBackInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleDocBackFileSelect}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* SLOT 1: FRENTE DO DOCUMENTO */}
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-slate-700 block">
                      1. {docType === 'bi' ? 'Frente do BI' : 'Documento Principal'} (Obrigatório)
                    </span>

                    {docFrontPreviewUrl ? (
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 space-y-3 shadow-xs">
                        <div className="relative aspect-4/3 w-full bg-slate-900 rounded-xl overflow-hidden border border-slate-200 group">
                          <img
                            src={docFrontPreviewUrl}
                            alt="Frente do Documento"
                            className="w-full h-full object-contain"
                          />
                          <button
                            type="button"
                            onClick={() => setDocPreviewModal({ title: docType === 'bi' ? 'Frente do BI' : 'Documento Principal', url: docFrontPreviewUrl })}
                            className="absolute inset-0 bg-slate-950/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white font-bold text-xs gap-1.5 backdrop-blur-xs"
                          >
                            <Eye className="w-4 h-4" /> Ampliar / Ver Pré-visualização
                          </button>
                        </div>

                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Foto Anexada com Sucesso
                          </span>
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => setDocPreviewModal({ title: docType === 'bi' ? 'Frente do BI' : 'Documento Principal', url: docFrontPreviewUrl })}
                              className="px-2 py-1 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-lg transition flex items-center gap-1"
                              title="Ver foto inteira"
                            >
                              <Eye className="w-3 h-3" /> Ver
                            </button>
                            <button
                              type="button"
                              onClick={() => docFrontInputRef.current?.click()}
                              className="px-2 py-1 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-lg transition"
                            >
                              Substituir
                            </button>
                            <button
                              type="button"
                              onClick={() => { setDocFrontPath(''); setDocFrontPreviewUrl(''); }}
                              className="p-1 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg transition"
                              title="Remover foto"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div
                        onClick={() => docFrontInputRef.current?.click()}
                        className="border-2 border-dashed border-slate-300 hover:border-emerald-500 bg-slate-50 hover:bg-emerald-50/50 rounded-2xl p-5 text-center cursor-pointer transition space-y-2 group"
                      >
                        {uploadingFront ? (
                          <div className="flex flex-col items-center space-y-2 py-4">
                            <Loader2 className="w-7 h-7 text-emerald-600 animate-spin" />
                            <p className="text-xs font-semibold text-slate-600">A carregar foto da frente...</p>
                          </div>
                        ) : (
                          <>
                            <div className="w-10 h-10 bg-emerald-100 group-hover:bg-emerald-200 text-emerald-700 rounded-full flex items-center justify-center mx-auto transition">
                              <Upload className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="text-xs font-bold text-slate-800">
                                Carregar Foto da Frente {docType === 'bi' ? 'do BI' : ''}
                              </p>
                              <p className="text-[11px] text-slate-500 mt-0.5">
                                Clique para selecionar a imagem da frente do documento
                              </p>
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  {/* SLOT 2: VERSO DO DOCUMENTO */}
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-slate-700 block">
                      2. {docType === 'bi' ? 'Verso do BI (Obrigatório)' : 'Verso ou Segunda Página (Opcional)'}
                    </span>

                    {docBackPreviewUrl ? (
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 space-y-3 shadow-xs">
                        <div className="relative aspect-4/3 w-full bg-slate-900 rounded-xl overflow-hidden border border-slate-200 group">
                          <img
                            src={docBackPreviewUrl}
                            alt="Verso do Documento"
                            className="w-full h-full object-contain"
                          />
                          <button
                            type="button"
                            onClick={() => setDocPreviewModal({ title: docType === 'bi' ? 'Verso do BI' : 'Verso do Documento', url: docBackPreviewUrl })}
                            className="absolute inset-0 bg-slate-950/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white font-bold text-xs gap-1.5 backdrop-blur-xs"
                          >
                            <Eye className="w-4 h-4" /> Ampliar / Ver Pré-visualização
                          </button>
                        </div>

                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Verso Anexado com Sucesso
                          </span>
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => setDocPreviewModal({ title: docType === 'bi' ? 'Verso do BI' : 'Verso do Documento', url: docBackPreviewUrl })}
                              className="px-2 py-1 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-lg transition flex items-center gap-1"
                              title="Ver foto inteira"
                            >
                              <Eye className="w-3 h-3" /> Ver
                            </button>
                            <button
                              type="button"
                              onClick={() => docBackInputRef.current?.click()}
                              className="px-2 py-1 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-lg transition"
                            >
                              Substituir
                            </button>
                            <button
                              type="button"
                              onClick={() => { setDocBackPath(''); setDocBackPreviewUrl(''); }}
                              className="p-1 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg transition"
                              title="Remover verso"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div
                        onClick={() => docBackInputRef.current?.click()}
                        className="border-2 border-dashed border-slate-300 hover:border-emerald-500 bg-slate-50 hover:bg-emerald-50/50 rounded-2xl p-5 text-center cursor-pointer transition space-y-2 group"
                      >
                        {uploadingBack ? (
                          <div className="flex flex-col items-center space-y-2 py-4">
                            <Loader2 className="w-7 h-7 text-emerald-600 animate-spin" />
                            <p className="text-xs font-semibold text-slate-600">A carregar foto do verso...</p>
                          </div>
                        ) : (
                          <>
                            <div className="w-10 h-10 bg-emerald-100 group-hover:bg-emerald-200 text-emerald-700 rounded-full flex items-center justify-center mx-auto transition">
                              <Upload className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="text-xs font-bold text-slate-800">
                                Carregar Foto do Verso {docType === 'bi' ? 'do BI' : ''}
                              </p>
                              <p className="text-[11px] text-slate-500 mt-0.5">
                                {docType === 'bi' 
                                  ? 'Obrigatório para a verificação do BI' 
                                  : 'Opcional se o documento tiver verso'}
                              </p>
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-md transition flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-5 h-5" />
                <span>Enviar Documentos para Verificação</span>
              </button>
            </form>
          )}
        </div>
      )}

      {/* TAB 6: DEFINIÇÕES DA CONTA */}
      {activeTab === 'settings' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 max-w-2xl mx-auto">
          <h2 className="text-xl font-bold text-slate-900">Atualizar Dados do Perfil</h2>

          <form onSubmit={handleSaveSettings} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Nome Completo:</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nº de Telemóvel:</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nº do WhatsApp:</label>
                <input
                  type="tel"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Bairro em Quelimane:</label>
              <select
                value={bairro}
                onChange={(e) => setBairro(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold"
              >
                {QUELIMANE_BAIRROS.map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Biografia Curta / Especialidade:</label>
              <input
                type="text"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>Guardar Alterações</span>
            </button>
          </form>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && (
        <PaymentModal
          type={boostTargetAd ? 'boost_ad' : 'upgrade_plan'}
          adId={boostTargetAd?.id}
          adTitle={boostTargetAd?.title}
          onClose={() => {
            setShowPaymentModal(false);
            setBoostTargetAd(null);
          }}
          onSuccess={loadDashboard}
        />
      )}

      {/* User Document Preview Modal */}
      {docPreviewModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 space-y-4 shadow-2xl relative animate-fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-slate-900 text-sm">{docPreviewModal.title} - Pré-visualização</h3>
              </div>
              <button
                type="button"
                onClick={() => setDocPreviewModal(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100 font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <div className="aspect-4/3 w-full bg-slate-900 rounded-2xl overflow-hidden flex items-center justify-center border border-slate-200">
              <img src={docPreviewModal.url} alt={docPreviewModal.title} className="w-full h-full object-contain" />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setDocPreviewModal(null)}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-sm font-semibold text-slate-500">
        A carregar o seu Dashboard...
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}
