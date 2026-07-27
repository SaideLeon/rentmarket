import type { Metadata } from 'next';
import './globals.css';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import MobileNav from '../components/layout/MobileNav';
import { ToastProvider } from '../components/ui/Toast';

export const metadata: Metadata = {
  title: 'Rent Market - Anúncios, Alugueres, Serviços e Produtos em Quelimane, Moçambique',
  description: 'Conecte-se diretamente com eletricistas, cabeleireiros, explicadores, costureiras, vendedores de peixe fresco, capulanas e muito mais na cidade de Quelimane, Zambézia.',
  icons: {
    icon: '/icon.svg',
    apple: '/icon.svg'
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt">
      <body className="bg-slate-50 text-slate-900 font-sans antialiased min-h-screen flex flex-col" suppressHydrationWarning>
        <ToastProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
          <MobileNav />
        </ToastProvider>
      </body>
    </html>
  );
}
