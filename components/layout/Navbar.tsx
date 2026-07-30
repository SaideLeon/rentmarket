'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { 
  Search, 
  MapPin, 
  PlusCircle, 
  User, 
  Bell, 
  MessageSquare, 
  ShieldAlert, 
  LogOut, 
  LogIn,
  ChevronDown,
  Sparkles,
  Menu,
  X,
  CheckCircle2,
  SlidersHorizontal,
  Home,
  Store,
  Mail
} from 'lucide-react';
import { getCurrentUser, getAllUsers, setCurrentUser, logoutUser, getNotificationsAsync, getMessagesAsync } from '../../lib/store';
import { UserProfile } from '../../lib/types';
import GmailModal from '../gmail/GmailModal';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();

  const [user, setUser] = useState<UserProfile | null>(null);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [unreadNotifsCount, setUnreadNotifsCount] = useState(0);
  const [unreadMsgsCount, setUnreadMsgsCount] = useState(0);

  const [searchQuery, setSearchQuery] = useState('');
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showGmailModal, setShowGmailModal] = useState(false);

  const loadUserData = useCallback(async () => {
    const currentUser = getCurrentUser();
    setUser(currentUser);
    setAllUsers(getAllUsers());

    if (currentUser) {
      const notifs = await getNotificationsAsync(currentUser.id);
      setUnreadNotifsCount(notifs.filter(n => !n.read).length);

      const msgs = await getMessagesAsync(currentUser.id);
      setUnreadMsgsCount(msgs.filter(m => m.receiverId === currentUser.id && !m.read).length);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadUserData();
    }, 0);
    const interval = setInterval(loadUserData, 3000); // Live poll updates for messages/notifications
    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [loadUserData]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/anuncios?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push('/anuncios');
    }
  };

  const handleSwitchUser = (userId: string) => {
    const updated = setCurrentUser(userId);
    setUser(updated);
    setShowRoleSwitcher(false);
    setShowUserDropdown(false);
    loadUserData();
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      {/* Top Banner for Local City Context (Hidden on Mobile) */}
      <div className="hidden sm:block bg-emerald-900 text-emerald-100 text-xs py-1.5 px-4 font-medium">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Marketplace Oficial de Quelimane &middot; Zambézia, Moçambique</span>
          </div>

          <div className="flex items-center gap-4 text-emerald-200">
            <Link href="/como-funciona" className="hover:text-white transition">
              Como Funciona
            </Link>
            <span>&bull;</span>
            <Link href="/planos" className="hover:text-white transition flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Destaques &amp; Planos</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-12 md:h-16 gap-2 md:gap-4">
          
          {/* Logo & City Badge */}
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-1.5 sm:gap-2 group">
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl overflow-hidden flex items-center justify-center bg-emerald-600 shadow-xs group-hover:scale-105 transition">
                <img
                  src="/icon.svg"
                  alt="QueliMercado Logo SVG"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-base md:text-xl font-bold tracking-tight text-slate-800 leading-none group-hover:text-emerald-600 transition">
                  Rent <span className="text-emerald-600">Market</span>
                </span>
                <span className="hidden sm:block text-[10px] text-emerald-600 font-medium uppercase tracking-wider -mt-0.5">
                  Anúncios &amp; Serviços
                </span>
              </div>
            </Link>

            <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 rounded-full text-xs font-bold border border-emerald-100">
              <MapPin className="w-3.5 h-3.5 text-emerald-600" />
              <span>Quelimane</span>
            </div>
          </div>

          {/* Search Bar - Desktop */}
          <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-md mx-4">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="O que você procura em Quelimane?"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-100 border-transparent focus:bg-white focus:border-emerald-500 rounded-full py-2 pl-10 pr-24 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <button
                type="submit"
                className="absolute right-1 top-1/2 -translate-y-1/2 px-4 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full text-xs font-bold transition-colors"
              >
                Buscar
              </button>
            </div>
          </form>

          {/* Right Action Items */}
          <div className="flex items-center gap-1.5 sm:gap-3">
            
            {/* Quick Navigation Links */}
            <nav className="hidden xl:flex items-center gap-4 text-sm font-semibold text-slate-600 mr-1">
              <Link 
                href="/anuncios" 
                className={`hover:text-emerald-600 transition ${pathname === '/anuncios' ? 'text-emerald-600 font-bold' : ''}`}
              >
                Anúncios
              </Link>
              <Link 
                href="/anuncios?type=servico" 
                className="hover:text-emerald-600 transition"
              >
                Serviços
              </Link>
              <Link 
                href="/anuncios?type=produto" 
                className="hover:text-emerald-600 transition"
              >
                Produtos
              </Link>
            </nav>



            {/* Post Ad CTA (Hidden on Mobile because MobileNav has central (+) button) */}
            <Link
              href="/anunciar"
              className="hidden sm:flex items-center gap-1.5 px-4 md:px-5 py-1.5 md:py-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-xs transition transform active:scale-95 shrink-0"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Anunciar<span className="hidden sm:inline"> Grátis</span></span>
            </Link>

            {/* Gmail Quick Access */}
            <button
              onClick={() => setShowGmailModal(true)}
              className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition flex items-center gap-1.5 font-bold text-xs"
              title="Gmail Oficial"
            >
              <div className="relative">
                <Mail className="w-5 h-5 text-red-500" />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
              </div>
              <span className="hidden lg:inline text-slate-700">Gmail</span>
            </button>

            {/* Notification & Messages Icons */}
            {user && (
              <div className="hidden sm:flex items-center gap-1">
                <Link
                  href="/dashboard?tab=messages"
                  className="relative p-2 text-slate-600 hover:text-emerald-600 hover:bg-slate-100 rounded-xl transition"
                  title="Mensagens"
                >
                  <MessageSquare className="w-5 h-5" />
                  {unreadMsgsCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center animate-bounce">
                      {unreadMsgsCount}
                    </span>
                  )}
                </Link>

                <Link
                  href="/dashboard?tab=notifications"
                  className="relative p-2 text-slate-600 hover:text-emerald-600 hover:bg-slate-100 rounded-xl transition"
                  title="Notificações"
                >
                  <Bell className="w-5 h-5" />
                  {unreadNotifsCount > 0 && (
                    <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white"></span>
                  )}
                </Link>
              </div>
            )}

            {/* User Profile Menu */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className="flex items-center gap-2 p-0.5 md:p-1 rounded-full hover:bg-slate-100 transition border border-slate-200"
                >
                  <img
                    src={user.avatarUrl}
                    alt={user.name}
                    className="w-7 h-7 md:w-8 md:h-8 rounded-full object-cover border border-emerald-500"
                  />
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500 mr-1 hidden sm:block" />
                </button>

                {showUserDropdown && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50">
                    <div className="px-4 py-3 border-b border-slate-100">
                      <p className="font-bold text-slate-900 text-sm">{user.name}</p>
                      <p className="text-xs text-slate-500 font-mono truncate">{user.email}</p>
                      <div className="mt-2 flex items-center gap-1.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          user.plan === 'pro' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'
                        }`}>
                          Plano {user.plan}
                        </span>
                        {user.verificationStatus === 'verified' && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-0.5">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Verificado
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="py-1 text-sm text-slate-700">
                      <Link
                        href="/dashboard"
                        onClick={() => setShowUserDropdown(false)}
                        className="flex items-center gap-2.5 px-4 py-2 hover:bg-slate-50 transition"
                      >
                        <User className="w-4 h-4 text-emerald-600" />
                        <span>Meu Dashboard</span>
                      </Link>

                      <Link
                        href="/dashboard?tab=ads"
                        onClick={() => setShowUserDropdown(false)}
                        className="flex items-center gap-2.5 px-4 py-2 hover:bg-slate-50 transition"
                      >
                        <Store className="w-4 h-4 text-emerald-600" />
                        <span>Meus Anúncios</span>
                      </Link>

                      <Link
                        href={`/perfil/${user.id}`}
                        onClick={() => setShowUserDropdown(false)}
                        className="flex items-center gap-2.5 px-4 py-2 hover:bg-slate-50 transition"
                      >
                        <User className="w-4 h-4 text-emerald-600" />
                        <span>Ver Perfil Público</span>
                      </Link>

                      {user.role === 'admin' && (
                        <Link
                          href="/admin"
                          onClick={() => setShowUserDropdown(false)}
                          className="flex items-center gap-2.5 px-4 py-2 bg-amber-50 text-amber-900 font-semibold hover:bg-amber-100 transition border-y border-amber-100"
                        >
                          <ShieldAlert className="w-4 h-4 text-amber-600" />
                          <span>Painel do Admin</span>
                        </Link>
                      )}
                    </div>

                    <div className="border-t border-slate-100 pt-1 text-sm">
                      <button
                        onClick={() => {
                          setShowUserDropdown(false);
                          logoutUser();
                          setUser(null);
                          router.push('/login');
                        }}
                        className="w-full text-left flex items-center gap-2.5 px-4 py-2 text-red-600 hover:bg-red-50 transition"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sair da Conta</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-xs transition transform active:scale-95 shrink-0"
              >
                <LogIn className="w-4 h-4" />
                <span>Entrar</span>
              </Link>
            )}

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-700 hover:bg-slate-100 rounded-xl xl:hidden"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar Compact */}
        <div className="md:hidden pb-2 pt-1">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              placeholder="O que procura em Quelimane?..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-16 py-1.5 bg-slate-100 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <button
              type="submit"
              className="absolute right-1 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-emerald-600 text-white rounded-md text-[11px] font-semibold"
            >
              Buscar
            </button>
          </form>
        </div>
      </div>

      {/* Quick Categories Ribbon - Compact on Mobile */}
      <div className="bg-white border-t border-slate-100 px-3 sm:px-6 py-1.5 md:py-2.5 flex items-center gap-1.5 md:gap-2.5 overflow-x-auto text-[11px] md:text-xs no-scrollbar">
        <Link href="/anuncios" className="px-2.5 md:px-4 py-1 md:py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full font-bold shrink-0">
          Todos
        </Link>
        <Link href="/anuncios?cat=cat_serv_obras" className="px-2.5 md:px-4 py-1 md:py-1.5 hover:bg-slate-50 border border-slate-200 rounded-full font-medium text-slate-600 shrink-0 transition">
          Construção &amp; Obras
        </Link>
        <Link href="/anuncios?cat=cat_serv_beleza" className="px-2.5 md:px-4 py-1 md:py-1.5 hover:bg-slate-50 border border-slate-200 rounded-full font-medium text-slate-600 shrink-0 transition">
          Saúde &amp; Beleza
        </Link>
        <Link href="/anuncios?cat=cat_serv_aulas" className="px-2.5 md:px-4 py-1 md:py-1.5 hover:bg-slate-50 border border-slate-200 rounded-full font-medium text-slate-600 shrink-0 transition">
          Educação
        </Link>
        <Link href="/anuncios?cat=cat_serv_transporte" className="px-2.5 md:px-4 py-1 md:py-1.5 hover:bg-slate-50 border border-slate-200 rounded-full font-medium text-slate-600 shrink-0 transition">
          Transporte
        </Link>
        <Link href="/anuncios?cat=cat_prod_alimentacao" className="px-2.5 md:px-4 py-1 md:py-1.5 hover:bg-slate-50 border border-slate-200 rounded-full font-medium text-slate-600 shrink-0 transition">
          Alimentação
        </Link>
        <Link href="/anuncios?cat=cat_prod_moda" className="px-2.5 md:px-4 py-1 md:py-1.5 hover:bg-slate-50 border border-slate-200 rounded-full font-medium text-slate-600 shrink-0 transition">
          Capulanas
        </Link>
        <Link href="/anuncios?cat=cat_serv_tecnologia" className="px-2.5 md:px-4 py-1 md:py-1.5 hover:bg-slate-50 border border-slate-200 rounded-full font-medium text-slate-600 shrink-0 transition">
          Informática
        </Link>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-white border-b border-slate-200 px-4 py-4 space-y-3 animate-in fade-in slide-in-from-top-2">
          <div className="flex flex-col gap-2 font-medium text-slate-700 text-sm">
            <Link 
              href="/" 
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 p-2 hover:bg-slate-50 rounded-lg"
            >
              <Home className="w-4 h-4 text-emerald-600" />
              <span>Página Inicial</span>
            </Link>
            <Link 
              href="/anuncios" 
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 p-2 hover:bg-slate-50 rounded-lg"
            >
              <SlidersHorizontal className="w-4 h-4 text-emerald-600" />
              <span>Todos os Anúncios</span>
            </Link>
            <Link 
              href="/anuncios?type=servico" 
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 p-2 hover:bg-slate-50 rounded-lg"
            >
              <span>Serviços na Cidade</span>
            </Link>
            <Link 
              href="/anuncios?type=produto" 
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 p-2 hover:bg-slate-50 rounded-lg"
            >
              <span>Produtos à Venda</span>
            </Link>
            <Link 
              href="/planos" 
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 p-2 hover:bg-slate-50 rounded-lg text-amber-700 font-semibold"
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Planos de Destaque</span>
            </Link>
            <Link 
              href="/como-funciona" 
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 p-2 hover:bg-slate-50 rounded-lg"
            >
              <span>Como Funciona</span>
            </Link>

            <div className="pt-2 border-t border-slate-100">
              {user ? (
                <div className="space-y-1">
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 p-2 hover:bg-slate-50 rounded-lg font-bold text-emerald-800"
                  >
                    <User className="w-4 h-4 text-emerald-600" />
                    <span>Meu Dashboard ({user.name.split(' ')[0]})</span>
                  </Link>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      logoutUser();
                      setUser(null);
                      router.push('/login');
                    }}
                    className="w-full text-left flex items-center gap-2 p-2 text-red-600 hover:bg-red-50 rounded-lg text-sm"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sair da Conta</span>
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 p-2.5 bg-emerald-600 text-white rounded-xl font-bold text-sm shadow-xs"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Entrar na Conta</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      {showGmailModal && (
        <GmailModal onClose={() => setShowGmailModal(false)} />
      )}
    </header>
  );
}
