'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  PlusCircle, 
  Image as ImageIcon, 
  MapPin, 
  Phone, 
  CheckCircle2, 
  Sparkles, 
  ArrowRight,
  Upload,
  X,
  AlertCircle
} from 'lucide-react';
import { initializeStore, getCategories, createAd, createAdAsync, getCurrentUser } from '../../lib/store';
import { Category, ListingType, UserProfile } from '../../lib/types';
import { QUELIMANE_BAIRROS } from '../../lib/data/initialData';
import { useToast } from '../../components/ui/Toast';
import { ProductImageUploader } from '../../components/ads/ProductImageUploader';

export default function AnunciarPage() {
  const router = useRouter();
  const { showToast } = useToast();

  const [user, setUser] = useState<UserProfile | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);

  // Form State
  const [listingType, setListingType] = useState<ListingType>('servico');
  const [categoryId, setCategoryId] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  
  const [priceType, setPriceType] = useState<'fixed' | 'negotiable' | 'starting_at'>('fixed');
  const [priceInput, setPriceInput] = useState('');
  
  const [bairro, setBairro] = useState(QUELIMANE_BAIRROS[0]);
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');

  // Photos State
  const [imageUrls, setImageUrls] = useState<string[]>([
    'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=800'
  ]);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [coverIndex, setCoverIndex] = useState(0);

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      initializeStore();
      const currentUser = getCurrentUser();
      if (!currentUser) {
        showToast('Por favor, inicie sessão para criar um anúncio.', 'info');
        router.push('/login');
        return;
      }
      setUser(currentUser);
      setPhone(currentUser.phone || '');
      setWhatsapp(currentUser.whatsapp || currentUser.phone || '');
      setBairro(currentUser.bairro || QUELIMANE_BAIRROS[0]);

      const cats = getCategories();
      setCategories(cats);
      if (cats.length > 0) {
        const firstCat = cats.find(c => c.type === 'servico' || c.type === 'ambos') || cats[0];
        setCategoryId(firstCat.id);
        if (firstCat.subcategories.length > 0) {
          setSubcategory(firstCat.subcategories[0]);
        }
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [router, showToast]);

  const handleTypeChange = (type: ListingType) => {
    setListingType(type);
    const availableCats = categories.filter(c => c.type === 'ambos' || c.type === type);
    if (availableCats.length > 0) {
      setCategoryId(availableCats[0].id);
      if (availableCats[0].subcategories.length > 0) {
        setSubcategory(availableCats[0].subcategories[0]);
      }
    }
  };

  const handleCategoryChange = (catId: string) => {
    setCategoryId(catId);
    const cat = categories.find(c => c.id === catId);
    if (cat && cat.subcategories.length > 0) {
      setSubcategory(cat.subcategories[0]);
    } else {
      setSubcategory('');
    }
  };

  const handleAddImageUrl = () => {
    if (newImageUrl.trim() && imageUrls.length < 5) {
      setImageUrls([...imageUrls, newImageUrl.trim()]);
      setNewImageUrl('');
    }
  };

  const handleRemoveImage = (index: number) => {
    const updated = imageUrls.filter((_, i) => i !== index);
    setImageUrls(updated);
    if (coverIndex >= updated.length) {
      setCoverIndex(Math.max(0, updated.length - 1));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!title.trim() || title.length < 5) {
      showToast('Insira um título claro de pelo menos 5 caracteres.', 'error');
      return;
    }

    if (!description.trim() || description.length < 15) {
      showToast('Descreva o seu serviço ou produto com mais detalhes (mínimo 15 caracteres).', 'error');
      return;
    }

    if (!phone.trim()) {
      showToast('Insira o seu número de telemóvel para contacto.', 'error');
      return;
    }

    setSubmitting(true);

    const numericPrice = priceType === 'negotiable' ? null : (parseFloat(priceInput) || 0);
    const selectedCatObj = categories.find(c => c.id === categoryId);

    setTimeout(async () => {
      const newAd = await createAdAsync({
        userId: user.id,
        title: title.trim(),
        description: description.trim(),
        listingType,
        categoryId,
        categoryName: selectedCatObj?.name || 'Geral',
        subcategory,
        price: numericPrice,
        priceType,
        bairro,
        images: imageUrls.length > 0 ? imageUrls : ['https://images.unsplash.com/photo-1584824486509-112e4181ff6b?auto=format&fit=crop&q=80&w=800'],
        coverImage: imageUrls[coverIndex] || imageUrls[0] || 'https://images.unsplash.com/photo-1584824486509-112e4181ff6b?auto=format&fit=crop&q=80&w=800',
        phone: phone.trim(),
        whatsapp: whatsapp.trim() || phone.trim(),
        isFeatured: false
      });

      setSubmitting(false);
      showToast('Anúncio criado com sucesso!');
      router.push(`/anuncio/${newAd.id}`);
    }, 600);
  };

  const currentCategoryObj = categories.find(c => c.id === categoryId);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      
      {/* Title */}
      <div className="text-center space-y-2">
        <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Publicação Rápida</span>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Anunciar no Rent Market</h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
          Preencha as informações do seu produto ou serviço para divulgar a todos os moradores da cidade.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-8">
        
        {/* STEP 1: Listing Type & Category */}
        <div className="space-y-4">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
            1. Tipo &amp; Categoria
          </h2>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleTypeChange('servico')}
              className={`p-4 rounded-2xl border text-center transition ${
                listingType === 'servico'
                  ? 'border-blue-600 bg-blue-50 text-blue-900 font-bold ring-2 ring-blue-600'
                  : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <span className="block text-sm font-black">Prestar Serviço</span>
              <span className="text-[11px] font-normal text-slate-500">Ex: eletricista, costura, aulas, fretes</span>
            </button>

            <button
              type="button"
              onClick={() => handleTypeChange('produto')}
              className={`p-4 rounded-2xl border text-center transition ${
                listingType === 'produto'
                  ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold ring-2 ring-emerald-600'
                  : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <span className="block text-sm font-black">Vender Produto</span>
              <span className="text-[11px] font-normal text-slate-500">Ex: peixe fresco, capulana, telemóvel</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Categoria Principal:
              </label>
              <select
                value={categoryId}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
              >
                {categories
                  .filter(c => c.type === 'ambos' || c.type === listingType)
                  .map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))
                }
              </select>
            </div>

            {currentCategoryObj && currentCategoryObj.subcategories.length > 0 && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Subcategoria:
                </label>
                <select
                  value={subcategory}
                  onChange={(e) => setSubcategory(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                >
                  {currentCategoryObj.subcategories.map(sub => (
                    <option key={sub} value={sub}>{sub}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* STEP 2: Title & Details */}
        <div className="space-y-4">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
            2. Detalhes do Anúncio
          </h2>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Título do Anúncio:
            </label>
            <input
              type="text"
              placeholder="Ex: Eletricista com Instalação de Quadros e Inversores"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-600"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Descrição Completa:
            </label>
            <textarea
              rows={4}
              placeholder="Descreva o serviço/produto, horário de atendimento, materiais inclusos, garantia..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-600"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Modalidade de Preço:
              </label>
              <select
                value={priceType}
                onChange={(e: any) => setPriceType(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
              >
                <option value="fixed">Preço Fixo (MT)</option>
                <option value="starting_at">A partir de (MT)</option>
                <option value="negotiable">A Combinar / Negociável</option>
              </select>
            </div>

            {priceType !== 'negotiable' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Valor em Meticais (MT):
                </label>
                <input
                  type="number"
                  placeholder="Ex: 800"
                  value={priceInput}
                  onChange={(e) => setPriceInput(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  required
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Bairro de Localização em Quelimane:
            </label>
            <select
              value={bairro}
              onChange={(e) => setBairro(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
            >
              {QUELIMANE_BAIRROS.map(b => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>
        </div>

        {/* STEP 3: Photos Upload / Images */}
        <div className="space-y-4">
          <ProductImageUploader
            imageUrls={imageUrls}
            onChange={setImageUrls}
            coverIndex={coverIndex}
            onCoverIndexChange={setCoverIndex}
            maxImages={5}
          />
        </div>

        {/* STEP 4: Contacts */}
        <div className="space-y-4">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
            4. Contactos para Negociação
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Número de Telemóvel para Chamadas:
              </label>
              <input
                type="tel"
                placeholder="+258 84 XXX XXXX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Número do WhatsApp:
              </label>
              <input
                type="tel"
                placeholder="25884XXXXXXX"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                required
              />
            </div>
          </div>
        </div>

        {/* Submit Action Button */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-sm shadow-lg transition transform active:scale-98 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {submitting ? (
              <span>A criar anúncio...</span>
            ) : (
              <>
                <PlusCircle className="w-5 h-5" />
                <span>Publicar Anúncio Agora</span>
              </>
            )}
          </button>
        </div>

      </form>

    </div>
  );
}
