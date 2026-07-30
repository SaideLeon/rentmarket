import type { Metadata, Viewport } from 'next';
import './globals.css';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import MobileNav from '../components/layout/MobileNav';
import { ToastProvider } from '../components/ui/Toast';
import PWAInstaller from '../components/common/PWAInstaller';

export const viewport: Viewport = {
  themeColor: '#0d9488',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover'
};

export const metadata: Metadata = {
  title: 'Rent Market - Anúncios, Alugueres, Serviços e Produtos em Quelimane, Moçambique',
  description: 'Conecte-se diretamente com eletricistas, cabeleireiros, explicadores, costureiras, vendedores de peixe fresco, capulanas e muito mais na cidade de Quelimane, Zambézia.',
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
      { url: '/icon.svg', type: 'image/svg+xml' }
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }
    ]
  },
  appleWebApp: {
    capable: true,
    title: 'Rent Market',
    statusBarStyle: 'default'
  },
  formatDetection: {
    telephone: false
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt">
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Rent Market" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body className="bg-slate-50 text-slate-900 font-sans antialiased min-h-screen flex flex-col" suppressHydrationWarning>
        <ToastProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
          <MobileNav />
          <PWAInstaller />
        </ToastProvider>
      </body>
    </html>
  );
}
