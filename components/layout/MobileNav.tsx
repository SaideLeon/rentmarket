'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, PlusCircle, MessageSquare, User } from 'lucide-react';
import { getCurrentUser, getMessages } from '../../lib/store';

export default function MobileNav() {
  const pathname = usePathname();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      const user = getCurrentUser();
      if (user) {
        const msgs = getMessages(user.id);
        const count = msgs.filter(m => m.receiverId === user.id && !m.read).length;
        setUnreadCount(count);
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [pathname]);

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-2 shadow-lg">
      <div className="grid grid-cols-5 text-center text-[10px] font-medium text-slate-600">
        <Link
          href="/"
          className={`flex flex-col items-center gap-1 py-1 rounded-lg transition ${
            pathname === '/' ? 'text-emerald-700 font-bold' : 'hover:text-slate-900'
          }`}
        >
          <Home className="w-5 h-5" />
          <span>Início</span>
        </Link>

        <Link
          href="/anuncios"
          className={`flex flex-col items-center gap-1 py-1 rounded-lg transition ${
            pathname === '/anuncios' ? 'text-emerald-700 font-bold' : 'hover:text-slate-900'
          }`}
        >
          <Search className="w-5 h-5" />
          <span>Buscar</span>
        </Link>

        <Link
          href="/anunciar"
          className="flex flex-col items-center gap-0.5 -mt-3"
        >
          <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-lg transform active:scale-90 transition">
            <PlusCircle className="w-7 h-7" />
          </div>
          <span className="text-[10px] font-bold text-emerald-800">Anunciar</span>
        </Link>

        <Link
          href="/dashboard?tab=messages"
          className={`relative flex flex-col items-center gap-1 py-1 rounded-lg transition ${
            pathname?.includes('messages') ? 'text-emerald-700 font-bold' : 'hover:text-slate-900'
          }`}
        >
          <div className="relative">
            <MessageSquare className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-2 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </div>
          <span>Chat</span>
        </Link>

        <Link
          href="/dashboard"
          className={`flex flex-col items-center gap-1 py-1 rounded-lg transition ${
            pathname?.includes('dashboard') ? 'text-emerald-700 font-bold' : 'hover:text-slate-900'
          }`}
        >
          <User className="w-5 h-5" />
          <span>Perfil</span>
        </Link>
      </div>
    </div>
  );
}
