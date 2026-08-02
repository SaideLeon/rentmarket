'use client';

import React from 'react';
import { Search, Filter, MapPin, SlidersHorizontal, RotateCcw, Sparkles } from 'lucide-react';
import { Category } from '../../lib/types';
import { MOZAMBIQUE_CIDADES, getBairrosPorCidade } from '../../lib/data/initialData';

interface AdFilterBarProps {
  categories: Category[];
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedCategory: string;
  setSelectedCategory: (catId: string) => void;
  selectedSubcategory: string;
  setSelectedSubcategory: (sub: string) => void;
  selectedCity?: string;
  setSelectedCity?: (city: string) => void;
  selectedBairro: string;
  setSelectedBairro: (bairro: string) => void;
  selectedType: string;
  setSelectedType: (type: string) => void;
  minPrice: string;
  setMinPrice: (price: string) => void;
  maxPrice: string;
  setMaxPrice: (price: string) => void;
  sortBy: 'recent' | 'price_asc' | 'price_desc' | 'popular';
  setSortBy: (sort: 'recent' | 'price_asc' | 'price_desc' | 'popular') => void;
  onReset: () => void;
}

export default function AdFilterBar({
  categories,
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  selectedSubcategory,
  setSelectedSubcategory,
  selectedCity,
  setSelectedCity,
  selectedBairro,
  setSelectedBairro,
  selectedType,
  setSelectedType,
  minPrice,
  setMinPrice,
  maxPrice,
  setMaxPrice,
  sortBy,
  setSortBy,
  onReset
}: AdFilterBarProps) {
  const currentCategoryObj = categories.find(c => c.id === selectedCategory);
  const bairrosDisponiveis = getBairrosPorCidade(selectedCity);

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-4 sm:p-6 shadow-sm space-y-4">
      
      {/* Top Search Input */}
      <div className="relative w-full">
        <input
          type="text"
          placeholder="Pesquisar por título, palavra-chave, serviço ou produto em Quelimane & Maputo..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white transition"
        />
        <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
      </div>

      {/* Select Filters Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        
        {/* Listing Type Filter */}
        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Tipo de Anúncio</label>
          <select
            value={selectedType}
            onChange={(e) => {
              setSelectedType(e.target.value);
              setSelectedCategory('');
              setSelectedSubcategory('');
            }}
            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600"
          >
            <option value="ambos">Todos (Serviços e Produtos)</option>
            <option value="servico">Apenas Serviços</option>
            <option value="produto">Apenas Produtos</option>
          </select>
        </div>

        {/* Category Filter */}
        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Categoria</label>
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setSelectedSubcategory('');
            }}
            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600"
          >
            <option value="">Todas as Categorias</option>
            {categories
              .filter(c => selectedType === 'ambos' || c.type === 'ambos' || c.type === selectedType)
              .map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))
            }
          </select>
        </div>

        {/* City Filter */}
        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Cidade</label>
          <select
            value={selectedCity || ''}
            onChange={(e) => {
              if (setSelectedCity) setSelectedCity(e.target.value);
              setSelectedBairro('');
            }}
            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600"
          >
            <option value="">Todas as Cidades</option>
            {MOZAMBIQUE_CIDADES.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Bairro Filter */}
        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Bairro</label>
          <select
            value={selectedBairro}
            onChange={(e) => setSelectedBairro(e.target.value)}
            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600"
          >
            <option value="">Todos os Bairros</option>
            {bairrosDisponiveis.map(b => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
        </div>

        {/* Intervalo de Preço (MT) */}
        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Preço (MT)</label>
          <div className="flex items-center gap-1.5">
            <input
              type="number"
              placeholder="Mín MT"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600"
              min="0"
            />
            <span className="text-slate-400 font-bold text-xs">-</span>
            <input
              type="number"
              placeholder="Máx MT"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600"
              min="0"
            />
          </div>
        </div>

        {/* Sort By Filter */}
        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Ordenar Por</label>
          <select
            value={sortBy}
            onChange={(e: any) => setSortBy(e.target.value)}
            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600"
          >
            <option value="recent">Mais Recentes</option>
            <option value="popular">Mais Vistos / Populares</option>
            <option value="price_asc">Menor Preço</option>
            <option value="price_desc">Maior Preço</option>
          </select>
        </div>

      </div>

      {/* Dynamic Subcategories Pills (if category selected) */}
      {currentCategoryObj && currentCategoryObj.subcategories.length > 0 && (
        <div className="pt-2 border-t border-slate-100">
          <span className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Subcategorias de {currentCategoryObj.name}:</span>
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setSelectedSubcategory('')}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
                !selectedSubcategory
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Todas
            </button>
            {currentCategoryObj.subcategories.map(sub => (
              <button
                key={sub}
                onClick={() => setSelectedSubcategory(sub)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
                  selectedSubcategory === sub
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {sub}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Reset Filter Button */}
      {(searchQuery || selectedCategory || selectedSubcategory || selectedCity || selectedBairro || selectedType !== 'ambos' || sortBy !== 'recent' || minPrice || maxPrice) && (
        <div className="pt-2 flex justify-end">
          <button
            onClick={onReset}
            className="flex items-center gap-1 text-xs text-red-600 font-bold hover:underline"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Limpar Todos os Filtros</span>
          </button>
        </div>
      )}

    </div>
  );
}
