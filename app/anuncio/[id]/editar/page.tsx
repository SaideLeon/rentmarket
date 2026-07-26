'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Trash2, PauseCircle, PlayCircle } from 'lucide-react';
import { initializeStore, getAdById, updateAd, deleteAd, getCurrentUser } from '../../../../lib/store';
import { Ad } from '../../../../lib/types';
import { QUELIMANE_BAIRROS } from '../../../../lib/data/initialData';
import { useToast } from '../../../../components/ui/Toast';
import { ProductImageUploader } from '../../../../components/ads/ProductImageUploader';
import Link from 'next/link';

export default function EditAdPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { showToast } = useToast();
  const currentUser = getCurrentUser();
  const currentUserId = currentUser?.id;
  const currentUserRole = currentUser?.role;

  const [ad, setAd] = useState<Ad | null>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priceInput, setPriceInput] = useState('');
  const [priceType, setPriceType] = useState<'fixed' | 'negotiable' | 'starting_at'>('fixed');
  const [bairro, setBairro] = useState('');
  const [status, setStatus] = useState<any>('active');
  const [images, setImages] = useState<string[]>([]);
  const [coverIndex, setCoverIndex] = useState(0);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      initializeStore();
      const loadedAd = getAdById(resolvedParams.id);
      if (loadedAd) {
        if (currentUserId && currentUserId !== loadedAd.userId && currentUserRole !== 'admin') {
          showToast('Não tem permissão para editar este anúncio.', 'error');
          router.push('/dashboard');
          return;
        }
        setAd(loadedAd);
        setTitle(loadedAd.title);
        setDescription(loadedAd.description);
        setPriceInput(loadedAd.price ? loadedAd.price.toString() : '');
        setPriceType(loadedAd.priceType || 'fixed');
        setBairro(loadedAd.bairro);
        setStatus(loadedAd.status);
        const adImages = loadedAd.images && loadedAd.images.length > 0 ? loadedAd.images : [loadedAd.coverImage];
        setImages(adImages);
        const coverIdx = adImages.findIndex(img => img === loadedAd.coverImage);
        setCoverIndex(coverIdx >= 0 ? coverIdx : 0);
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [resolvedParams.id, currentUserId, currentUserRole, router, showToast]);

  if (!ad) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <p className="text-sm font-semibold text-slate-600">Anúncio não encontrado.</p>
        <Link href="/dashboard" className="inline-block px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl">
          Voltar ao Dashboard
        </Link>
      </div>
    );
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const numericPrice = priceType === 'negotiable' ? null : parseFloat(priceInput) || 0;
    const finalImages = images.length > 0 ? images : ['https://images.unsplash.com/photo-1584824486509-112e4181ff6b?auto=format&fit=crop&q=80&w=800'];
    const finalCover = finalImages[coverIndex] || finalImages[0];

    setTimeout(() => {
      updateAd(ad.id, {
        title: title.trim(),
        description: description.trim(),
        price: numericPrice,
        priceType,
        bairro,
        status,
        images: finalImages,
        coverImage: finalCover
      });

      setSaving(false);
      showToast('Anúncio atualizado com sucesso!');
      router.push(`/anuncio/${ad.id}`);
    }, 400);
  };

  const handleDelete = () => {
    if (window.confirm('Tem certeza que deseja apagar este anúncio permanentemente?')) {
      deleteAd(ad.id);
      showToast('Anúncio apagado com sucesso.');
      router.push('/dashboard');
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      
      <div className="flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-slate-900">
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar ao Dashboard</span>
        </Link>

        <button
          onClick={handleDelete}
          className="flex items-center gap-1 text-xs text-red-600 font-bold hover:underline"
        >
          <Trash2 className="w-4 h-4" />
          <span>Apagar Anúncio</span>
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <h1 className="text-xl font-bold text-slate-900">Editar Anúncio</h1>

        <form onSubmit={handleSave} className="space-y-4">
          
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Título:</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-600"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Descrição:</label>
            <textarea
              rows={5}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-600"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Modalidade Preço:</label>
              <select
                value={priceType}
                onChange={(e: any) => setPriceType(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-600"
              >
                <option value="fixed">Preço Fixo</option>
                <option value="starting_at">A partir de</option>
                <option value="negotiable">A Combinar</option>
              </select>
            </div>

            {priceType !== 'negotiable' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Preço (MT):</label>
                <input
                  type="number"
                  value={priceInput}
                  onChange={(e) => setPriceInput(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Bairro em Quelimane:</label>
              <select
                value={bairro}
                onChange={(e) => setBairro(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-600"
              >
                {QUELIMANE_BAIRROS.map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Estado do Anúncio:</label>
              <select
                value={status}
                onChange={(e: any) => setStatus(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-600"
              >
                <option value="active">Ativo (Público)</option>
                <option value="paused">Pausado (Oculto)</option>
              </select>
            </div>
          </div>

          {/* Product Photos Upload Section */}
          <div className="pt-2 border-t border-slate-100">
            <ProductImageUploader
              imageUrls={images}
              onChange={setImages}
              coverIndex={coverIndex}
              onCoverIndexChange={setCoverIndex}
              maxImages={5}
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm shadow-md transition flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'A guardar alterações...' : 'Guardar Alterações'}</span>
          </button>

        </form>
      </div>

    </div>
  );
}
