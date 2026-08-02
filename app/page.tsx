'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Search, 
  MapPin, 
  Sparkles, 
  PlusCircle, 
  CheckCircle2, 
  ArrowRight, 
  Hammer, 
  Scissors, 
  GraduationCap, 
  Truck, 
  Laptop, 
  Utensils, 
  Wrench, 
  Apple, 
  Shirt, 
  Smartphone, 
  Palette, 
  Car,
  ShieldCheck,
  PhoneCall,
  Users,
  Mic,
  MicOff
} from 'lucide-react';
import { initializeStore, getAds, getAdsAsync, getCategories } from '../lib/store';
import { Ad, Category } from '../lib/types';
import AdCard from '../components/ads/AdCard';
import ContactModal from '../components/ads/ContactModal';
import { QUELIMANE_BAIRROS, MAPUTO_BAIRROS } from '../lib/data/initialData';
import { useToast } from '../components/ui/Toast';
import Lightfall from '../components/Lightfall';

const ICON_MAP: Record<string, React.ReactNode> = {
  Hammer: <Hammer className="w-6 h-6 text-emerald-600" />,
  Scissors: <Scissors className="w-6 h-6 text-emerald-600" />,
  GraduationCap: <GraduationCap className="w-6 h-6 text-emerald-600" />,
  Truck: <Truck className="w-6 h-6 text-emerald-600" />,
  Laptop: <Laptop className="w-6 h-6 text-emerald-600" />,
  Utensils: <Utensils className="w-6 h-6 text-emerald-600" />,
  Wrench: <Wrench className="w-6 h-6 text-emerald-600" />,
  Apple: <Apple className="w-6 h-6 text-emerald-600" />,
  Shirt: <Shirt className="w-6 h-6 text-emerald-600" />,
  Smartphone: <Smartphone className="w-6 h-6 text-emerald-600" />,
  Palette: <Palette className="w-6 h-6 text-emerald-600" />,
  Car: <Car className="w-6 h-6 text-emerald-600" />
};

export default function HomePage() {
  const router = useRouter();
  const { showToast } = useToast();

  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredAds, setFeaturedAds] = useState<Ad[]>([]);
  const [recentAds, setRecentAds] = useState<Ad[]>([]);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBairro, setSelectedBairro] = useState('');
  const [selectedCityBairroTab, setSelectedCityBairroTab] = useState<'Quelimane' | 'Maputo Cidade'>('Quelimane');
  const [activeTab, setActiveTab] = useState<'todos' | 'servico' | 'produto'>('todos');

  const [selectedAdForContact, setSelectedAdForContact] = useState<Ad | null>(null);

  // Voice Search State
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  const toggleVoiceSearch = () => {
    if (typeof window === 'undefined') return;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      showToast('O seu navegador não suporta pesquisa por voz. Tente usar o Google Chrome ou Edge.', 'error');
      return;
    }

    if (isListening) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (err) {
          console.error('Erro ao parar gravação:', err);
        }
      }
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'pt-PT'; // Transcrição configurada estritamente em Português
      recognition.continuous = false;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsListening(true);
        showToast('A ouvir... Fale o serviço ou produto que procura.', 'info');
      };

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        if (transcript) {
          setSearchQuery(transcript);
        }
      };

      recognition.onerror = (event: any) => {
        console.error('Erro no reconhecimento de voz:', event.error);
        setIsListening(false);
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          showToast('Permissão de microfone negada. Permita o acesso ao microfone no navegador ou abra o site num novo separador.', 'error');
        } else if (event.error === 'no-speech') {
          showToast('Nenhum som detetado. Tente falar novamente.', 'info');
        } else if (event.error === 'audio-capture') {
          showToast('Nenhum microfone encontrado no dispositivo.', 'error');
        } else {
          showToast('Não foi possível reconhecer a voz. Tente novamente.', 'error');
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error('Erro ao iniciar reconhecimento de voz:', err);
      setIsListening(false);
      showToast('Erro ao aceder ao microfone do dispositivo.', 'error');
    }
  };

  const loadHomeData = useCallback(async () => {
    initializeStore();
    setCategories(getCategories());
    
    const feat = await getAdsAsync({ featuredOnly: true, status: 'active' });
    setFeaturedAds(feat);

    const rec = await getAdsAsync({
      listingType: activeTab === 'todos' ? undefined : activeTab,
      status: 'active',
      sortBy: 'recent'
    });
    setRecentAds(rec.slice(0, 8));
  }, [activeTab]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadHomeData();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadHomeData]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set('q', searchQuery.trim());
    if (selectedBairro) params.set('bairro', selectedBairro);
    router.push(`/anuncios?${params.toString()}`);
  };

  return (
    <div className="space-y-12 pb-16">
      
      {/* HERO SECTION */}
      <section className="relative bg-gradient-to-b from-slate-900 via-emerald-950 to-slate-900 text-white overflow-hidden pt-12 pb-16 px-4 sm:px-6 lg:px-8 border-b border-emerald-900/50">
        
        {/* WebGL Lightfall Background Animation */}
        <div className="absolute inset-0 pointer-events-none opacity-50 z-0">
          <Lightfall
            colors={['#A6C8FF', '#5227FF', '#FF9FFC']}
            backgroundColor="#0b221a"
            speed={0.5}
            streakCount={2}
            streakWidth={1}
            streakLength={1}
            glow={1}
            density={0.6}
            twinkle={1}
            zoom={3}
            backgroundGlow={0.5}
            opacity={1}
            mouseInteraction={true}
            mouseStrength={0.5}
            mouseRadius={1}
            color1="#a6ffc1"
            color2="#30ff27"
            color3="#101141"
          />
        </div>

        {/* Subtle Background Decoration */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(16,185,129,0.15),transparent_50%)] pointer-events-none z-0"></div>

        <div className="max-w-5xl mx-auto relative z-10 text-center space-y-6">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-900/80 border border-emerald-700/60 text-emerald-300 text-xs font-semibold shadow-lg">
            <MapPin className="w-4 h-4 text-emerald-400" />
            <span>O Ponto de Encontro em Quelimane e Maputo</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight max-w-3xl mx-auto">
            Encontre Serviços e Produtos Locais em <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-amber-300">Quelimane e Maputo</span>
          </h1>

          <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed font-normal">
            Ligue-se diretamente a eletricistas, cabeleireiros, explicadores, costureiras, transporte e comerciantes de todos os bairros de Quelimane e Maputo Cidade. Sem intermediários, fácil e no seu telemóvel.
          </p>

          {/* Listening Indicator Banner */}
          {isListening && (
            <div className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-emerald-950/90 border border-emerald-500/50 text-emerald-300 text-xs font-bold shadow-xl animate-pulse mx-auto">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></span>
              <Mic className="w-4 h-4 text-red-400" />
              <span>A ouvir em Quelimane... Fale agora o serviço ou produto (ex: canalizador, bolo)</span>
            </div>
          )}

          {/* Search Box Card */}
          <form onSubmit={handleSearch} className="bg-white/95 backdrop-blur-md p-2.5 sm:p-3 rounded-3xl shadow-2xl border border-white/20 max-w-3xl mx-auto flex flex-col sm:flex-row items-center gap-2 text-slate-900 text-left">
            
            {/* Search Query Input */}
            <div className="relative flex-1 w-full flex items-center">
              <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder={isListening ? "A ouvir a sua voz... Fale agora" : "O que precisa hoje? (ex: canalizador, bolo, telemóvel)"}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-11 pr-12 py-3 bg-transparent text-sm font-medium focus:outline-none placeholder:text-slate-400 transition ${
                  isListening ? 'text-emerald-700 font-bold placeholder:text-emerald-600' : ''
                }`}
              />
              <button
                type="button"
                onClick={toggleVoiceSearch}
                title={isListening ? "A ouvir... Clique para parar" : "Pesquisar por voz"}
                className={`absolute right-2.5 top-1/2 -translate-y-1/2 p-2 rounded-xl transition duration-200 flex items-center justify-center shrink-0 ${
                  isListening
                    ? 'bg-red-500 text-white animate-bounce shadow-lg shadow-red-500/50'
                    : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'
                }`}
              >
                {isListening ? (
                  <MicOff className="w-4 h-4" />
                ) : (
                  <Mic className="w-4 h-4" />
                )}
              </button>
            </div>

            <div className="hidden sm:block w-px h-8 bg-slate-200"></div>

            {/* Bairro Select */}
            <div className="relative w-full sm:w-52">
              <MapPin className="w-4 h-4 text-emerald-600 absolute left-3 top-1/2 -translate-y-1/2" />
              <select
                value={selectedBairro}
                onChange={(e) => setSelectedBairro(e.target.value)}
                className="w-full pl-9 pr-4 py-3 bg-slate-50 sm:bg-transparent text-xs sm:text-sm font-bold text-slate-800 focus:outline-none rounded-xl"
              >
                <option value="">Todos os Bairros</option>
                {QUELIMANE_BAIRROS.map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-2xl shadow-md transition transform active:scale-95 flex items-center justify-center gap-2 shrink-0"
            >
              <span>Pesquisar</span>
              <ArrowRight className="w-4 h-4" />
            </button>

          </form>

          {/* Popular Search Tags */}
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-slate-300 pt-2">
            <span className="text-slate-400 font-semibold">Procurados:</span>
            {[
              { label: 'Eletricista', query: 'eletricista' },
              { label: 'Capulana', query: 'capulana' },
              { label: 'Peixe Fresco Zalala', query: 'peixe' },
              { label: 'Costura', query: 'costura' },
              { label: 'Explicações Matemática', query: 'matematica' },
              { label: 'Reparação Telemóveis', query: 'telemovel' }
            ].map(tag => (
              <button
                key={tag.label}
                onClick={() => router.push(`/anuncios?q=${tag.query}`)}
                className="px-3 py-1 rounded-full bg-slate-800/80 hover:bg-emerald-800 text-slate-200 hover:text-emerald-200 border border-slate-700 text-[11px] font-medium transition"
              >
                {tag.label}
              </button>
            ))}
          </div>

        </div>
      </section>

      {/* FEATURED ADS CAROUSEL / GRID */}
      {featuredAds.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-amber-100 text-amber-700 rounded-xl">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Anúncios em Destaque</h2>
                <p className="text-xs text-slate-500 font-medium">Anunciantes verificados e impulsionados na cidade de Quelimane</p>
              </div>
            </div>

            <Link href="/anuncios?featured=true" className="text-xs sm:text-sm font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1">
              <span>Ver Todos</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredAds.map(ad => (
              <AdCard key={ad.id} ad={ad} onContactClick={setSelectedAdForContact} />
            ))}
          </div>
        </section>
      )}

      {/* CATEGORIES GRID */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-1">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Explore por Categoria</h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">Serviços e produtos organizados para encontrar rapidamente o que precisa</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {categories.map(cat => (
            <Link
              key={cat.id}
              href={`/anuncios?cat=${cat.id}`}
              className="p-4 bg-white hover:bg-emerald-50/60 rounded-2xl border border-slate-200 hover:border-emerald-300 shadow-xs hover:shadow-md transition-all flex flex-col items-center text-center space-y-3 group"
            >
              <div className="w-12 h-12 rounded-2xl bg-emerald-100/70 group-hover:bg-emerald-600 text-emerald-700 group-hover:text-white flex items-center justify-center transition-colors shadow-xs">
                {ICON_MAP[cat.icon] || <Wrench className="w-6 h-6 text-emerald-600 group-hover:text-white" />}
              </div>
              <div>
                <h3 className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-emerald-800 leading-snug">
                  {cat.name}
                </h3>
                <span className="text-[10px] text-slate-400 font-medium capitalize mt-0.5 block">
                  {cat.type === 'servico' ? 'Serviços' : cat.type === 'produto' ? 'Produtos' : 'Serviços & Produtos'}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* RECENT LISTINGS SECTION WITH TABS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Recém-Publicados na Cidade</h2>
            <p className="text-xs text-slate-500 font-medium">Os últimos anúncios publicados por moradores e comerciantes de Quelimane</p>
          </div>

          {/* Filter Tabs */}
          <div className="flex bg-slate-200/80 p-1 rounded-xl text-xs font-bold text-slate-700 self-stretch sm:self-auto">
            <button
              onClick={() => setActiveTab('todos')}
              className={`flex-1 sm:flex-initial px-4 py-1.5 rounded-lg transition ${
                activeTab === 'todos' ? 'bg-white text-emerald-800 shadow-xs' : 'hover:text-slate-900'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setActiveTab('servico')}
              className={`flex-1 sm:flex-initial px-4 py-1.5 rounded-lg transition ${
                activeTab === 'servico' ? 'bg-white text-emerald-800 shadow-xs' : 'hover:text-slate-900'
              }`}
            >
              Serviços
            </button>
            <button
              onClick={() => setActiveTab('produto')}
              className={`flex-1 sm:flex-initial px-4 py-1.5 rounded-lg transition ${
                activeTab === 'produto' ? 'bg-white text-emerald-800 shadow-xs' : 'hover:text-slate-900'
              }`}
            >
              Produtos
            </button>
          </div>
        </div>

        {recentAds.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {recentAds.map(ad => (
              <AdCard key={ad.id} ad={ad} onContactClick={setSelectedAdForContact} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
            <p className="text-sm font-semibold text-slate-600">Nenhum anúncio encontrado neste filtro.</p>
            <Link href="/anunciar" className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold text-xs">
              <PlusCircle className="w-4 h-4" />
              <span>Seja o primeiro a publicar</span>
            </Link>
          </div>
        )}

        <div className="text-center pt-4">
          <Link
            href="/anuncios"
            className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-2xl shadow-md transition"
          >
            <span>Explorar Todos os Anúncios em Quelimane</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </section>

      {/* POPULAR BAIRROS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-emerald-900 via-slate-900 to-emerald-950 text-white rounded-3xl p-8 sm:p-12 shadow-xl space-y-6 border border-emerald-800/40">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="max-w-xl space-y-2">
              <span className="text-xs text-emerald-400 font-bold uppercase tracking-wider">Mapeamento Local</span>
              <h2 className="text-2xl sm:text-3xl font-black">Anúncios por Bairro e Distrito</h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Explore e encontre anúncios de serviços e produtos organizados por bairro e distrito em <strong className="text-white">Quelimane</strong> e na <strong className="text-white">Cidade de Maputo</strong>.
              </p>
            </div>

            {/* City Selector Buttons */}
            <div className="flex bg-slate-800/80 p-1 rounded-2xl border border-white/10 shrink-0">
              <button
                type="button"
                onClick={() => setSelectedCityBairroTab('Quelimane')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  selectedCityBairroTab === 'Quelimane'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <MapPin className="w-3.5 h-3.5 text-emerald-300" />
                <span>Quelimane</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedCityBairroTab('Maputo Cidade')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  selectedCityBairroTab === 'Maputo Cidade'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <MapPin className="w-3.5 h-3.5 text-emerald-300" />
                <span>Maputo Cidade</span>
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2.5 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
            {(selectedCityBairroTab === 'Quelimane' ? QUELIMANE_BAIRROS : MAPUTO_BAIRROS).map(b => (
              <Link
                key={b}
                href={`/anuncios?bairro=${encodeURIComponent(b)}&cidade=${encodeURIComponent(selectedCityBairroTab)}`}
                className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-emerald-600/80 text-white border border-white/10 text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
              >
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                <span>{b}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS IN 3 STEPS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-1">
          <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Simplicidade Digital</span>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Como Funciona o Mussika Online?</h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">Pensado para ser fácil de usar, rápido e direto</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-3 relative overflow-hidden">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 font-black text-xl flex items-center justify-center">
              1
            </div>
            <h3 className="font-bold text-slate-900 text-lg">Crie a sua Conta Grátis</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Registe-se em 1 minuto usando o seu e-mail ou número de telemóvel. Não precisa de cartão de crédito para começar.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-3 relative overflow-hidden">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 font-black text-xl flex items-center justify-center">
              2
            </div>
            <h3 className="font-bold text-slate-900 text-lg">Publique o seu Anúncio</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Adicione fotos do seu serviço ou produto, defina o preço, selecione o seu bairro em Quelimane e insira o seu contacto de WhatsApp.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-3 relative overflow-hidden">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 font-black text-xl flex items-center justify-center">
              3
            </div>
            <h3 className="font-bold text-slate-900 text-lg">Receba Contactos Diretos</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Os clientes locais encontram o seu anúncio e entram em contacto direto via WhatsApp ou chamada para fechar negócio.
            </p>
          </div>

        </div>
      </section>

      {/* TRUST & VERIFICATION BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-amber-50 rounded-3xl p-8 border border-amber-200 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-amber-200 text-amber-900 rounded-2xl shrink-0 hidden sm:block">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <span className="text-xs font-bold text-amber-900 uppercase tracking-wider">Selo de Confiança</span>
              <h3 className="text-xl font-bold text-amber-950">Quer tornar-se um Anunciante Verificado em Quelimane?</h3>
              <p className="text-xs sm:text-sm text-amber-900 leading-relaxed">
                Envie a cópia do seu BI ou documento de identidade para revisão da equipa de moderação e ganhe o selo de verificação no seu perfil para transmitir mais segurança aos clientes.
              </p>
            </div>
          </div>

          <Link
            href="/dashboard?tab=verification"
            className="px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition shrink-0 whitespace-nowrap"
          >
            Solicitar Selo Verificado
          </Link>
        </div>
      </section>

      {/* CONTACT MODAL POPUP IF CLICKED */}
      {selectedAdForContact && (
        <ContactModal
          ad={selectedAdForContact}
          onClose={() => setSelectedAdForContact(null)}
        />
      )}

    </div>
  );
}
