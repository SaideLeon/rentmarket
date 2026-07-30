import { Ad, Category, UserProfile, Review, SystemSettings } from '../types';

export const QUELIMANE_BAIRROS = [
  'Centro da Cidade',
  '1º de Maio',
  '3 de Fevereiro',
  '7 de Abril',
  '24 de Julho',
  'Acordos de Lusaka',
  'Aeroporto',
  'Bairro Novo',
  'Bazar',
  'Brandão',
  'Chirangano',
  'Chuabo Dembe',
  'Coalane',
  'Coalane 1',
  'Coalane 2A',
  'Coalane 2B',
  'Cololo',
  'Eduardo Mondlane',
  'Filipe Samuel Magaia',
  'Floresta',
  'Ícidua',
  'Ivagalane',
  'Janeiro',
  'Kansa',
  'Liberdade',
  'Magologodo',
  'Manhaua',
  'Mapiazua',
  'Maquival',
  'Marrabo',
  'Micajune',
  'Mugogoda',
  'Murropué',
  'Mutibura',
  'Nacouela',
  'Namuinho',
  'Nhanhibua',
  'Piloto',
  'Popular (Vila Pita)',
  'Saguar',
  'Sagrada Família',
  'Sampene',
  'Sangariveira',
  'Santagua',
  'Serresse',
  'Sinacura',
  'Torrone Novo',
  'Torrone Velho'
];

export const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'cat_serv_obras',
    name: 'Construção e Obras',
    slug: 'construcao-e-obras',
    icon: 'Hammer',
    type: 'servico',
    subcategories: ['Eletricistas', 'Canalizadores', 'Pedreiros', 'Pintores', 'Serralheiros', 'Gesso e Teto Falso']
  },
  {
    id: 'cat_serv_beleza',
    name: 'Beleza e Estética',
    slug: 'beleza-e-estetica',
    icon: 'Scissors',
    type: 'servico',
    subcategories: ['Cabeleireiros e Barbeiros', 'Tranças e Extensões', 'Manicure e Pedicure', 'Maquilhagem', 'Massagens']
  },
  {
    id: 'cat_serv_aulas',
    name: 'Aulas e Explicações',
    slug: 'aulas-e-explicacoes',
    icon: 'GraduationCap',
    type: 'servico',
    subcategories: ['Matemática e Física', 'Língua Portuguesa', 'Inglês', 'Informática Básica', 'Música e Instrumentos']
  },
  {
    id: 'cat_serv_transporte',
    name: 'Transporte e Fretes',
    slug: 'transporte-e-fretes',
    icon: 'Truck',
    type: 'servico',
    subcategories: ['Fretes de Carga', 'Transporte de Mudanças', 'Táxi Privado e Txopela', 'Motorista Particular']
  },
  {
    id: 'cat_serv_tecnologia',
    name: 'Tecnologia e Informática',
    slug: 'tecnologia-e-informatica',
    icon: 'Laptop',
    type: 'servico',
    subcategories: ['Reparação de Telemóveis', 'Reparação de Computadores', 'Instalação de Câmeras/CCTV', 'Redes e Wi-Fi', 'Design e Fotografia']
  },
  {
    id: 'cat_serv_gastronomia',
    name: 'Gastronomia e Festas',
    slug: 'gastronomia-e-festas',
    icon: 'Utensils',
    type: 'servico',
    subcategories: ['Bolos por Encomenda', 'Catering e Buffets', 'Decoração de Eventos', 'Animação e DJ', 'Doces e Salgados']
  },
  {
    id: 'cat_serv_reparacoes',
    name: 'Reparações Domésticas',
    slug: 'reparacoes-domesticas',
    icon: 'Wrench',
    type: 'servico',
    subcategories: ['Mecânica de Carros e Motas', 'Reparação de Geleiras/AC', 'Costura e Ajustes de Roupa', 'Jardinagem']
  },
  {
    id: 'cat_prod_alimentacao',
    name: 'Alimentação e Produtos Frescos',
    slug: 'alimentacao-e-frescos',
    icon: 'Apple',
    type: 'produto',
    subcategories: ['Peixe Fresco e Marisco', 'Frutas e Vegetais', 'Mandioca e Matapa', 'Comida Caseira Pronta', 'Produtos Naturais']
  },
  {
    id: 'cat_prod_moda',
    name: 'Moda e Capulanas',
    slug: 'moda-e-capulanas',
    icon: 'Shirt',
    type: 'produto',
    subcategories: ['Capulanas Originais', 'Roupas Masculinas', 'Roupas Femininas', 'Calçados', 'Acessórios e Bijuteria']
  },
  {
    id: 'cat_prod_eletronica',
    name: 'Eletrónica e Telemóveis',
    slug: 'eletronica-e-telemoveis',
    icon: 'Smartphone',
    type: 'produto',
    subcategories: ['Telemóveis e Tablets', 'Computadores e Laptops', 'Televisores e Som', 'Acessórios e Carregadores', 'Eletrodomésticos']
  },
  {
    id: 'cat_prod_artesanato',
    name: 'Artesanato e Decoração',
    slug: 'artesanato-e-decoracao',
    icon: 'Palette',
    type: 'produto',
    subcategories: ['Esculturas em Madeira', 'Quadros e Pinturas', 'Móveis de Bambu/Cana', 'Cestaria e Utensílios']
  },
  {
    id: 'cat_prod_veiculos',
    name: 'Veículos e Peças',
    slug: 'veiculos-e-pecas',
    icon: 'Car',
    type: 'produto',
    subcategories: ['Motocicletas e Txopelas', 'Carros Usados', 'Bicicletas', 'Peças e Acessórios']
  }
];

export const INITIAL_USERS: UserProfile[] = [
  {
    id: 'usr_saide',
    name: 'Saíde Omar Saíde',
    email: 'saide.omar.said@gmail.com',
    phone: '+258 86 330 4793',
    whatsapp: '258863304793',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300',
    bairro: 'Centro da Cidade',
    city: 'Quelimane',
    bio: 'Empreendedor e técnico credenciado em Quelimane. Vendas, eletricidade, transporte e comércio local na Zambézia. Contacto direto: 863304793 / 869041261.',
    role: 'user',
    plan: 'pro',
    verificationStatus: 'verified',
    createdAt: '2025-01-10T10:00:00Z',
    updatedAt: '2026-07-25T10:00:00Z'
  },
  {
    id: 'usr_amina',
    name: 'Amina Mussa',
    email: 'amina.mussa@gmail.com',
    phone: '+258 86 904 1261',
    whatsapp: '258869041261',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=300',
    bairro: 'Brandão',
    city: 'Quelimane',
    bio: 'Costureira e especialista em vestidos com capulana tradicional da Zambézia e culinária para festas. Contacto direto: 869041261.',
    role: 'user',
    plan: 'pro',
    verificationStatus: 'verified',
    createdAt: '2025-02-10T14:30:00Z',
    updatedAt: '2026-07-22T09:15:00Z'
  },
  {
    id: 'usr_filipe',
    name: 'Filipe Mabote',
    email: 'filipe.mabote@gmail.com',
    phone: '+258 86 330 4793',
    whatsapp: '258863304793',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=300',
    bairro: 'Chuabo Dembe',
    city: 'Quelimane',
    bio: 'Professor graduado em Matemática, Física e Técnico Informático em Quelimane. Contacto direto: 863304793.',
    role: 'user',
    plan: 'free',
    verificationStatus: 'verified',
    createdAt: '2025-03-01T08:00:00Z',
    updatedAt: '2026-07-18T16:00:00Z'
  },
  {
    id: 'usr_admin',
    name: 'Administração Mussika Online',
    email: 'admin@mussika.co.mz',
    phone: '+258 86 904 1261',
    whatsapp: '258869041261',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=300',
    bairro: 'Centro da Cidade',
    city: 'Quelimane',
    bio: 'Equipa de moderação e suporte oficial do Mussika Online. Contacto: 869041261.',
    role: 'admin',
    plan: 'pro',
    verificationStatus: 'verified',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2026-07-25T00:00:00Z'
  }
];

export const INITIAL_ADS: Ad[] = [
  {
    id: 'ad_1',
    userId: 'usr_saide',
    title: 'Eletricista Residencial e Comercial - Instalações, Quadro e Curto-Circuito',
    slug: 'eletricista-residencial-e-comercial-instalacoes-quadro-e-curto-circuito',
    description: 'Faço montagem de instalações elétricas do zero, reparação de curtos-circuitos, instalação de inversores e painéis solares, lâmpadas LED, tomadas e manutenção de quadros elétricos em toda a cidade de Quelimane. Trabalho rápido, limpo e com garantia.\n\nLigue ou chame no WhatsApp: 863304793 / 869041261.',
    listingType: 'servico',
    categoryId: 'cat_serv_obras',
    categoryName: 'Construção e Obras',
    subcategory: 'Eletricistas',
    price: 800,
    priceType: 'starting_at',
    bairro: 'Centro da Cidade',
    images: [
      'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&q=80&w=800'
    ],
    coverImage: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=800',
    phone: '+258 86 330 4793',
    whatsapp: '258863304793',
    status: 'active',
    isFeatured: true,
    featuredUntil: '2026-08-30T00:00:00Z',
    viewsCount: 245,
    contactsCount: 58,
    expiresAt: '2026-08-25T00:00:00Z',
    createdAt: '2026-07-10T09:30:00Z',
    updatedAt: '2026-07-10T09:30:00Z'
  },
  {
    id: 'ad_2',
    userId: 'usr_amina',
    title: 'Costura Fina e Roupas de Capulana por Medida - Vestidos de Festa e Casamentos',
    slug: 'costura-fina-e-roupas-de-capulana-por-medida',
    description: 'Confecciono vestidos modernos de capulana, conjuntos femininos, camisas masculinas e roupas para casamentos e eventos especiais. Trabalho com atenção aos detalhes, bom acabamento e entrega dentro do prazo combinado. Venha ao atelier no bairro Brandão ou chame no WhatsApp!\n\nContacto de atendimento: 869041261 / 863304793.',
    listingType: 'servico',
    categoryId: 'cat_serv_reparacoes',
    categoryName: 'Reparações Domésticas',
    subcategory: 'Costura e Ajustes de Roupa',
    price: 1200,
    priceType: 'starting_at',
    bairro: 'Brandão',
    images: [
      'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&q=80&w=800'
    ],
    coverImage: 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&q=80&w=800',
    phone: '+258 86 904 1261',
    whatsapp: '258869041261',
    status: 'active',
    isFeatured: true,
    featuredUntil: '2026-08-28T00:00:00Z',
    viewsCount: 312,
    contactsCount: 74,
    expiresAt: '2026-08-20T00:00:00Z',
    createdAt: '2026-07-05T14:15:00Z',
    updatedAt: '2026-07-05T14:15:00Z'
  },
  {
    id: 'ad_5',
    userId: 'usr_saide',
    title: 'Motorizada Haojue 150cc Usada em Ótimo Estado - Económica e Revisada',
    slug: 'motorizada-haojue-150cc-usada-em-otimo-estado',
    description: 'Vendo motorizada Haojue 150cc em ótimo estado de conservação, motor selado, documentos de propriedade em dia. Ideal para transporte diário em Quelimane, entregas ou viagens curtas. Teste no local no bairro Sinacura.\n\nLigue para agendar vista: 863304793 / 869041261.',
    listingType: 'produto',
    categoryId: 'cat_prod_veiculos',
    categoryName: 'Veículos e Peças',
    subcategory: 'Motocicletas e Txopelas',
    price: 65000,
    priceType: 'fixed',
    bairro: 'Sinacura',
    images: [
      'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&q=80&w=800'
    ],
    coverImage: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&q=80&w=800',
    phone: '+258 86 330 4793',
    whatsapp: '258863304793',
    status: 'active',
    isFeatured: false,
    viewsCount: 195,
    contactsCount: 34,
    expiresAt: '2026-08-26T00:00:00Z',
    createdAt: '2026-07-16T10:00:00Z',
    updatedAt: '2026-07-16T10:00:00Z'
  },
  {
    id: 'ad_6',
    userId: 'usr_filipe',
    title: 'Explicações de Matemática e Física para 10ª e 12ª Classe - Preparação Exames',
    slug: 'explicacoes-de-matematica-e-fisica-para-10a-e-12a-classe',
    description: 'Aulas particulares individuais ou em pequenos grupos. Método prático com resolução de exames anteriores de admissão ao Ensino Superior e exames nacionais. Aulas presenciais no Chuabo Dembe ou ao domicílio em Quelimane.\n\nContacto direto para inscrições: 863304793 / 869041261.',
    listingType: 'servico',
    categoryId: 'cat_serv_aulas',
    categoryName: 'Aulas e Explicações',
    subcategory: 'Matemática e Física',
    price: 1500,
    priceType: 'fixed',
    bairro: 'Chuabo Dembe',
    images: [
      'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=800'
    ],
    coverImage: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=800',
    phone: '+258 86 330 4793',
    whatsapp: '258863304793',
    status: 'active',
    isFeatured: false,
    viewsCount: 142,
    contactsCount: 26,
    expiresAt: '2026-08-15T00:00:00Z',
    createdAt: '2026-07-12T11:00:00Z',
    updatedAt: '2026-07-12T11:00:00Z'
  },
  {
    id: 'ad_7',
    userId: 'usr_saide',
    title: 'Serviço de Frete e Mudanças com Carrinha Aberta em Quelimane',
    slug: 'servico-de-frete-e-mudancas-com-carrinha-aberta-em-quelimane',
    description: 'Transporte seguro de móveis, materiais de construção, eletrodomésticos e mercadorias para todos os bairros de Quelimane e distritos vizinhos da Zambézia. Ajudantes para carga e descarga incluídos.\n\nOrçamentos no WhatsApp/Chamada: 863304793 / 869041261.',
    listingType: 'servico',
    categoryId: 'cat_serv_transporte',
    categoryName: 'Transporte e Fretes',
    subcategory: 'Fretes de Carga',
    price: 1000,
    priceType: 'starting_at',
    bairro: 'Aeroporto',
    images: [
      'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=800'
    ],
    coverImage: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=800',
    phone: '+258 86 330 4793',
    whatsapp: '258863304793',
    status: 'active',
    isFeatured: true,
    featuredUntil: '2026-08-30T00:00:00Z',
    viewsCount: 210,
    contactsCount: 48,
    expiresAt: '2026-08-28T00:00:00Z',
    createdAt: '2026-07-15T15:00:00Z',
    updatedAt: '2026-07-15T15:00:00Z'
  },
  {
    id: 'ad_8',
    userId: 'usr_filipe',
    title: 'Manutenção e Reparação de Portáteis HP, Dell, Lenovo - Limpeza e Formatação',
    slug: 'manutencao-e-reparacao-de-portateis-hp-dell-lenovo',
    description: 'Instalação de sistemas Windows/Office, substituição de ecrãs partidos, mudança de teclados, reparação de carregadores, eliminação de vírus e instalação de discos SSD rápidos. Diagnóstico no próprio dia.\n\nContacto do técnico: 869041261 / 863304793.',
    listingType: 'servico',
    categoryId: 'cat_serv_tecnologia',
    categoryName: 'Tecnologia e Informática',
    subcategory: 'Reparação de Computadores',
    price: 700,
    priceType: 'starting_at',
    bairro: 'Sangariveira',
    images: [
      'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?auto=format&fit=crop&q=80&w=800'
    ],
    coverImage: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?auto=format&fit=crop&q=80&w=800',
    phone: '+258 86 904 1261',
    whatsapp: '258869041261',
    status: 'active',
    isFeatured: false,
    viewsCount: 178,
    contactsCount: 31,
    expiresAt: '2026-08-19T00:00:00Z',
    createdAt: '2026-07-11T13:40:00Z',
    updatedAt: '2026-07-11T13:40:00Z'
  },
  {
    id: 'ad_11',
    userId: 'usr_saide',
    title: 'Telemóvel Samsung Galaxy A24 (128GB/6GB) - Seminovo com Garantia',
    slug: 'telemovel-samsung-galaxy-a24-128gb-6gb-seminovo',
    description: 'Vendo Samsung Galaxy A24 em excelente estado de conservação, bateria a 100%, ecrã Super AMOLED sem riscos, memória interna de 128GB e 6GB de RAM. Acompanha carregador original e capa de proteção.\n\nLigue ou envie WhatsApp: 863304793 / 869041261.',
    listingType: 'produto',
    categoryId: 'cat_prod_eletronica',
    categoryName: 'Eletrónica e Telemóveis',
    subcategory: 'Telemóveis e Tablets',
    price: 12500,
    priceType: 'fixed',
    bairro: '25 de Junho',
    images: [
      'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&q=80&w=800'
    ],
    coverImage: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&q=80&w=800',
    phone: '+258 86 330 4793',
    whatsapp: '258863304793',
    status: 'active',
    isFeatured: true,
    featuredUntil: '2026-08-30T00:00:00Z',
    viewsCount: 290,
    contactsCount: 63,
    expiresAt: '2026-08-28T00:00:00Z',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export const INITIAL_REVIEWS: Review[] = [
  {
    id: 'rev_1',
    targetUserId: 'usr_saide',
    authorId: 'usr_amina',
    authorName: 'Amina Mussa',
    authorAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=300',
    adId: 'ad_1',
    rating: 5,
    comment: 'O Saíde veio fazer a instalação elétrica da minha oficina no bairro Brandão. Muito pontual, honesto, profissional e rápido. Recomendo vivamente!',
    createdAt: '2026-07-15T14:20:00Z'
  },
  {
    id: 'rev_2',
    targetUserId: 'usr_amina',
    authorId: 'usr_saide',
    authorName: 'Saíde Omar Saíde',
    authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300',
    adId: 'ad_2',
    rating: 5,
    comment: 'Encomendei vestidos de capulana para a família. A D. Amina fez um trabalho espetacular, acabamento de alta qualidade e dentro do prazo!',
    createdAt: '2026-07-18T10:00:00Z'
  }
];


export const INITIAL_SETTINGS: SystemSettings = {
  freePlanMaxAds: 3,
  adValidityDays: 30,
  featuredPriceMZN: 150,
  proPlanPriceMonthlyMZN: 250,
  autoApproveAds: false,
  mpesaMerchantNumber: '84 900 1234',
  emolaMerchantNumber: '86 900 1234'
};
