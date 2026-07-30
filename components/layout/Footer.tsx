'use client';

import React from 'react';
import Link from 'next/link';
import { MapPin, Phone, Mail, ShieldCheck, Sparkles, Smartphone, Download } from 'lucide-react';
import { triggerPwaInstall } from '../common/PWAInstaller';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 pt-12 pb-24 md:pb-12 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 pb-10 border-b border-slate-800">
          
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-emerald-400 text-white flex items-center justify-center font-bold text-xl shadow-md">
                RM
              </div>
              <span className="font-bold text-xl text-white tracking-tight">
                Rent<span className="text-emerald-400">Market</span>
              </span>
            </div>

            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed max-w-sm">
              O ponto de encontro digital para profissionais independentes, pequenos negócios, comerciantes e clientes na cidade de Quelimane, Zambézia. Conecte-se diretamente com quem oferece serviços e produtos perto de si.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 text-slate-200 rounded-lg text-xs font-semibold">
                <MapPin className="w-4 h-4 text-emerald-400" />
                <span>Quelimane, Moçambique</span>
              </div>
              <button
                onClick={() => triggerPwaInstall()}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-semibold shadow-sm transition"
              >
                <Smartphone className="w-4 h-4" />
                <span>Instalar App Android</span>
              </button>
            </div>
          </div>

          {/* Categories Col */}
          <div>
            <h3 className="text-white font-bold text-sm tracking-wider uppercase mb-4">Categorias Populares</h3>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <Link href="/anuncios?cat=cat_serv_obras" className="hover:text-emerald-400 transition">
                  Construção &amp; Eletricistas
                </Link>
              </li>
              <li>
                <Link href="/anuncios?cat=cat_serv_beleza" className="hover:text-emerald-400 transition">
                  Cabeleireiros &amp; Estética
                </Link>
              </li>
              <li>
                <Link href="/anuncios?cat=cat_serv_aulas" className="hover:text-emerald-400 transition">
                  Aulas Particular &amp; Explicações
                </Link>
              </li>
              <li>
                <Link href="/anuncios?cat=cat_prod_alimentacao" className="hover:text-emerald-400 transition">
                  Peixe Fresco &amp; Frescos de Zalala
                </Link>
              </li>
              <li>
                <Link href="/anuncios?cat=cat_prod_moda" className="hover:text-emerald-400 transition">
                  Capulanas &amp; Costura por Medida
                </Link>
              </li>
              <li>
                <Link href="/anuncios?cat=cat_serv_tecnologia" className="hover:text-emerald-400 transition">
                  Reparação de Telemóveis &amp; Laptops
                </Link>
              </li>
            </ul>
          </div>

          {/* Links Col */}
          <div>
            <h3 className="text-white font-bold text-sm tracking-wider uppercase mb-4">Informação &amp; Suporte</h3>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <Link href="/como-funciona" className="hover:text-emerald-400 transition">
                  Como Funciona o Mercado
                </Link>
              </li>
              <li>
                <Link href="/planos" className="hover:text-emerald-400 transition">
                  Planos Pago &amp; Destaques
                </Link>
              </li>
              <li>
                <Link href="/sobre" className="hover:text-emerald-400 transition">
                  Sobre Nós &amp; Missão Local
                </Link>
              </li>
              <li>
                <Link href="/termos" className="hover:text-emerald-400 transition">
                  Dicas de Segurança em Quelimane
                </Link>
              </li>
              <li>
                <Link href="/contacto" className="hover:text-emerald-400 transition">
                  Falar com o Suporte
                </Link>
              </li>
            </ul>
          </div>

          {/* Bairros & Payments */}
          <div>
            <h3 className="text-white font-bold text-sm tracking-wider uppercase mb-4">Pagamentos Aceites</h3>
            <p className="text-xs text-slate-400 mb-3 leading-relaxed">
              Destaque os seus anúncios facilmente através dos meios de pagamento móveis locais:
            </p>
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="px-2.5 py-1 bg-red-950 text-red-300 font-bold text-xs rounded border border-red-800">
                M-Pesa
              </span>
              <span className="px-2.5 py-1 bg-orange-950 text-orange-300 font-bold text-xs rounded border border-orange-800">
                e-Mola
              </span>
            </div>
            <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/50 text-[11px] text-slate-400 space-y-1">
              <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Negociações Diretas e Seguras</span>
              </div>
              <p>Recomenda-se realizar encontros e pagamentos em locais públicos e movimentados de Quelimane.</p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>
            &copy; {new Date().getFullYear()} Rent Market &middot; Todos os direitos reservados.
          </p>
          <div className="flex items-center gap-1">
            <span>Desenvolvido para a comunidade de Quelimane</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
