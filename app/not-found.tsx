'use client';

import React from 'react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 text-center">
      <div className="space-y-4 max-w-md">
        <h1 className="text-4xl font-black text-slate-900">404</h1>
        <p className="text-slate-600 font-medium text-sm">
          A página ou anúncio que procura não foi encontrado no Mussika Online.
        </p>
        <Link
          href="/"
          className="inline-block px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition"
        >
          Voltar ao Início
        </Link>
      </div>
    </div>
  );
}
