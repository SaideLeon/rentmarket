'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { LayoutGrid, List, SlidersHorizontal, PlusCircle, SearchX } from 'lucide-react';
import { initializeStore, getAds, getCategories } from '../../lib/store';
import { Ad, Category } from '../../lib/types';
import AdCard from '../../components/ads/AdCard';
import AdFilterBar from '../../components/ads/AdFilterBar';
import ContactModal from '../../components/ads/ContactModal';
import Link from 'next/link';

function ListingsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [categories, setCategories] = useState<Category[]>([]);
  const [allAds, setAllAds] = useState<Ad[]>([]);
  const [filteredAds, setFilteredAds] = useState<Ad[]>([]);

  const isFeatured = searchParams?.get('featured') === 'true';

  // Filter state
  const [searchQuery, setSearchQuery] = useState(searchParams?.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams?.get('cat') || '');
  const [selectedSubcategory, setSelectedSubcategory] = useState(searchParams?.get('sub') || '');
  const [selectedBairro, setSelectedBairro] = useState(searchParams?.get('bairro') || '');
  const [selectedType, setSelectedType] = useState(searchParams?.get('type') || 'ambos');
  const [minPrice, setMinPrice] = useState(searchParams?.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams?.get('maxPrice') || '');
  const [sortBy, setSortBy] = useState<'recent' | 'price_asc' | 'price_desc' | 'popular' | undefined>(
    (searchParams?.get('sort') as any) || (isFeatured ? undefined : 'recent')
  );

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedAdForContact, setSelectedAdForContact] = useState<Ad | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      initializeStore();
      setCategories(getCategories());
      setAllAds(getAds({ status: 'active' }));
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      const ads = getAds({
        searchQuery,
        categoryId: selectedCategory || undefined,
        subcategory: selectedSubcategory || undefined,
        bairro: selectedBairro || undefined,
        listingType: selectedType === 'ambos' ? undefined : selectedType,
        minPrice: minPrice ? Number(minPrice) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
        sortBy,
        featuredOnly: isFeatured,
        status: 'active'
      });
      setFilteredAds(ads);
    }, 0);
    return () => clearTimeout(timer);
  }, [searchQuery, selectedCategory, selectedSubcategory, selectedBairro, selectedType, minPrice, maxPrice, sortBy, isFeatured]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setSelectedSubcategory('');
    setSelectedBairro('');
    setSelectedType('ambos');
    setMinPrice('');
    setMaxPrice('');
    setSortBy('recent');
    router.push('/anuncios');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Anúncios em Quelimane
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Mostrando <span className="font-bold text-emerald-700">{filteredAds.length}</span> anúncio(s) ativo(s) na cidade
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View Mode Toggle */}
          <div className="flex bg-slate-200/80 p-1 rounded-xl text-slate-700">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition ${
                viewMode === 'grid' ? 'bg-white text-emerald-800 shadow-xs' : 'hover:text-slate-900'
              }`}
              title="Vista em Grelha"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition ${
                viewMode === 'list' ? 'bg-white text-emerald-800 shadow-xs' : 'hover:text-slate-900'
              }`}
              title="Vista em Lista"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <Link
            href="/anunciar"
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Criar Anúncio</span>
          </Link>
        </div>
      </div>

      {/* Filter Component */}
      <AdFilterBar
        categories={categories}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        selectedSubcategory={selectedSubcategory}
        setSelectedSubcategory={setSelectedSubcategory}
        selectedBairro={selectedBairro}
        setSelectedBairro={setSelectedBairro}
        selectedType={selectedType}
        setSelectedType={setSelectedType}
        minPrice={minPrice}
        setMinPrice={setMinPrice}
        maxPrice={maxPrice}
        setMaxPrice={setMaxPrice}
        sortBy={sortBy || 'recent'}
        setSortBy={(val) => setSortBy(val)}
        onReset={handleResetFilters}
      />

      {/* Results Grid / List */}
      {filteredAds.length > 0 ? (
        <div className={
          viewMode === 'grid'
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6'
            : 'space-y-4'
        }>
          {filteredAds.map(ad => (
            <AdCard key={ad.id} ad={ad} onContactClick={setSelectedAdForContact} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-4">
          <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
            <SearchX className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-slate-900 text-lg">Nenhum resultado encontrado</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Não encontramos nenhum anúncio que corresponda aos filtros selecionados. Tente pesquisar com termos mais genéricos ou remover filtros de bairro.
            </p>
          </div>
          <button
            onClick={handleResetFilters}
            className="px-5 py-2.5 bg-slate-900 text-white rounded-xl font-bold text-xs shadow-md"
          >
            Limpar Filtros e Ver Todos
          </button>
        </div>
      )}

      {/* Contact Modal */}
      {selectedAdForContact && (
        <ContactModal
          ad={selectedAdForContact}
          onClose={() => setSelectedAdForContact(null)}
        />
      )}

    </div>
  );
}

export default function AnunciosPage() {
  return (
    <Suspense fallback={
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-sm font-semibold text-slate-500">
        A carregar anúncios em Quelimane...
      </div>
    }>
      <ListingsContent />
    </Suspense>
  );
}
