'use client';

import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Link as LinkIcon, Loader2, Star, CloudUpload, CheckCircle2 } from 'lucide-react';
import { uploadProductImage, isSupabaseConfigured } from '../../lib/supabase';
import { useToast } from '../ui/Toast';

interface ProductImageUploaderProps {
  imageUrls: string[];
  onChange: (urls: string[]) => void;
  coverIndex: number;
  onCoverIndexChange: (index: number) => void;
  maxImages?: number;
}

export function ProductImageUploader({
  imageUrls,
  onChange,
  coverIndex,
  onCoverIndexChange,
  maxImages = 5,
}: ProductImageUploaderProps) {
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlInput, setUrlInput] = useState('');

  const handleFiles = async (files: FileList | File[]) => {
    const fileList = Array.from(files);
    if (fileList.length === 0) return;

    if (imageUrls.length + fileList.length > maxImages) {
      showToast(`Pode carregar no máximo ${maxImages} fotos por anúncio.`, 'error');
    }

    const availableSlots = maxImages - imageUrls.length;
    const filesToUpload = fileList.slice(0, availableSlots);

    if (filesToUpload.length === 0) return;

    setUploading(true);
    const newUploadedUrls: string[] = [];

    try {
      for (const file of filesToUpload) {
        if (!file || (file.type && !file.type.startsWith('image/'))) {
          showToast(`O ficheiro ${file?.name || 'selecionado'} não é uma imagem válida.`, 'error');
          continue;
        }

        // Limit file size to 10MB
        if (file.size > 10 * 1024 * 1024) {
          showToast(`A imagem ${file.name} é demasiado grande (máximo 10MB).`, 'error');
          continue;
        }

        try {
          const uploadedUrl = await uploadProductImage(file);
          if (uploadedUrl) {
            newUploadedUrls.push(uploadedUrl);
          }
        } catch (fileErr: any) {
          console.error(`Erro ao carregar ficheiro ${file.name}:`, fileErr);
          showToast(`Não foi possível carregar ${file.name}.`, 'error');
        }
      }

      if (newUploadedUrls.length > 0) {
        const updated = [...imageUrls, ...newUploadedUrls];
        onChange(updated);
        showToast(
          `${newUploadedUrls.length} ${newUploadedUrls.length === 1 ? 'foto carregada' : 'fotos carregadas'} com sucesso!`,
          'info'
        );
      }
    } catch (error: any) {
      console.error('Erro no processamento de fotos:', error);
      showToast('Ocorreu um erro ao carregar as imagens.', 'error');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleAddUrl = () => {
    if (!urlInput.trim()) return;
    if (imageUrls.length >= maxImages) {
      showToast(`Limite máximo de ${maxImages} fotos atingido.`, 'error');
      return;
    }
    onChange([...imageUrls, urlInput.trim()]);
    setUrlInput('');
    showToast('Link de imagem adicionado com sucesso!');
  };

  const handleRemoveImage = (index: number) => {
    const updated = imageUrls.filter((_, i) => i !== index);
    onChange(updated);
    if (coverIndex >= updated.length) {
      onCoverIndexChange(Math.max(0, updated.length - 1));
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Header info */}
      <div className="flex items-center justify-between text-xs">
        <span className="font-bold text-slate-700 flex items-center gap-1.5">
          <ImageIcon className="w-4 h-4 text-emerald-600" />
          Fotos do Produto / Serviço ({imageUrls.length}/{maxImages})
        </span>
        <span className="text-[11px] font-medium text-slate-500">
          {isSupabaseConfigured ? 'Armazenamento: Supabase Storage' : 'Upload direto do Dispositivo'}
        </span>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={(e) => e.target.files && handleFiles(e.target.files)}
        className="hidden"
        id="device-photo-upload"
      />

      {/* Main Drag and Drop Upload Box */}
      {imageUrls.length < maxImages && (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => !uploading && fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
            dragActive
              ? 'border-emerald-600 bg-emerald-50/70 scale-[1.01]'
              : 'border-slate-300 hover:border-emerald-500 bg-slate-50 hover:bg-emerald-50/30'
          } ${uploading ? 'opacity-75 cursor-wait' : ''}`}
        >
          {uploading ? (
            <div className="flex flex-col items-center justify-center py-4 space-y-2">
              <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
              <p className="text-xs font-bold text-slate-800">A carregar fotos para o Supabase...</p>
              <p className="text-[11px] text-slate-500">A otimizar e guardar a imagem</p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center space-y-2 py-2">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform">
                <CloudUpload className="w-6 h-6" />
              </div>
              
              <div>
                <p className="text-xs sm:text-sm font-bold text-slate-900">
                  Clique ou arraste as fotos aqui do seu dispositivo
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Suporta PNG, JPG, WEBP até 10MB cada
                </p>
              </div>

              <div className="pt-1 flex items-center gap-2">
                <span className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs inline-flex items-center gap-1">
                  <Upload className="w-3.5 h-3.5" />
                  Escolher Fotos
                </span>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowUrlInput(!showUrlInput);
                  }}
                  className="px-2.5 py-1 text-slate-600 hover:text-slate-900 text-xs font-bold underline underline-offset-2 flex items-center gap-1"
                >
                  <LinkIcon className="w-3 h-3" />
                  Colar Link URL
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Alternative URL Input tab */}
      {showUrlInput && (
        <div className="p-3 bg-slate-100/80 rounded-2xl border border-slate-200 space-y-2 animate-in fade-in duration-200">
          <label className="block text-[11px] font-bold text-slate-700">
            Adicionar Imagem por Link Web (Ex: Unsplash / Imgur):
          </label>
          <div className="flex gap-2">
            <input
              type="url"
              placeholder="https://exemplo.com/minha-foto.jpg"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              className="flex-1 p-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
            <button
              type="button"
              onClick={handleAddUrl}
              className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shrink-0"
            >
              Adicionar
            </button>
          </div>
        </div>
      )}

      {/* Photos Grid Preview */}
      {imageUrls.length > 0 && (
        <div className="space-y-2">
          <span className="text-[11px] font-semibold text-slate-500 block">
            Clique na foto para defini-la como <strong className="text-emerald-700">Foto Principal de Capa</strong>:
          </span>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {imageUrls.map((url, idx) => {
              const isCover = coverIndex === idx;

              return (
                <div
                  key={idx}
                  onClick={() => onCoverIndexChange(idx)}
                  className={`relative aspect-4/3 rounded-2xl overflow-hidden border-2 cursor-pointer transition-all group ${
                    isCover
                      ? 'border-emerald-600 ring-2 ring-emerald-600/30 shadow-md scale-[1.02]'
                      : 'border-slate-200 hover:border-slate-400'
                  }`}
                >
                  {/* Image Element */}
                  <img
                    src={url}
                    alt={`Foto do produto ${idx + 1}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />

                  {/* Remove Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveImage(idx);
                    }}
                    className="absolute top-1.5 right-1.5 p-1 bg-slate-900/80 hover:bg-red-600 text-white rounded-full transition shadow-xs"
                    title="Remover foto"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>

                  {/* Cover Badge */}
                  {isCover ? (
                    <div className="absolute bottom-1.5 left-1.5 px-2 py-0.5 bg-emerald-600 text-white rounded-md text-[10px] font-extrabold flex items-center gap-1 shadow-xs">
                      <Star className="w-3 h-3 fill-white" />
                      Capa
                    </div>
                  ) : (
                    <div className="absolute bottom-1.5 left-1.5 px-2 py-0.5 bg-slate-900/70 text-slate-200 rounded-md text-[10px] font-semibold opacity-0 group-hover:opacity-100 transition">
                      Definir Capa
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
