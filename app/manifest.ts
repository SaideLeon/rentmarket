import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Mussika Online',
    short_name: 'Mussika Online',
    description: 'Anúncios, Alugueres, Serviços e Produtos em Moçambique',
    start_url: '/',
    display: 'standalone',
    background_color: '#f8fafc',
    theme_color: '#0d9488',
    orientation: 'portrait',
    scope: '/',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any'
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any'
      },
      {
        src: '/maskable-icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable'
      },
      {
        src: '/apple-touch-icon.png',
        sizes: '180x180',
        type: 'image/png'
      }
    ],
    shortcuts: [
      {
        name: 'Publicar Anúncio',
        short_name: 'Publicar',
        description: 'Anuncie o seu produto ou serviço em Quelimane',
        url: '/publicar',
        icons: [{ src: '/icon-192.png', sizes: '192x192' }]
      },
      {
        name: 'Pesquisar Anúncios',
        short_name: 'Pesquisar',
        description: 'Encontre imóveis, veículos, serviços e produtos',
        url: '/pesquisa',
        icons: [{ src: '/icon-192.png', sizes: '192x192' }]
      },
      {
        name: 'O Meu Painel',
        short_name: 'Painel',
        description: 'Gerir anúncios e mensagens',
        url: '/dashboard',
        icons: [{ src: '/icon-192.png', sizes: '192x192' }]
      }
    ]
  };
}
