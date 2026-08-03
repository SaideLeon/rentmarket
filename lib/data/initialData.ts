import { Ad, Category, UserProfile, Review, SystemSettings } from '../types';

export const MOZAMBIQUE_CIDADES = [
  'Quelimane',
  'Maputo Cidade'
] as const;

export type CidadeName = typeof MOZAMBIQUE_CIDADES[number];

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

export const MAPUTO_BAIRROS = [
  // KaMpfumu
  'Alto Maé A',
  'Alto Maé B',
  'Central A',
  'Central B',
  'Central C',
  'Coop',
  'Malhangalene A',
  'Malhangalene B',
  'Polana-Cimento A',
  'Polana-Cimento B',
  'Sommerschield',
  // Nlhamankulu
  'Aeroporto A',
  'Aeroporto B',
  'Chamanculo A',
  'Chamanculo B',
  'Chamanculo C',
  'Chamanculo D',
  'Malanga',
  'Minkadjuine',
  'Munhuana',
  'Unidade 7',
  'Xipamanine',
  // KaMaxaquene
  'Mafalala',
  'Maxaquene A',
  'Maxaquene B',
  'Maxaquene C',
  'Maxaquene D',
  'Polana Caniço A',
  'Polana Caniço B',
  'Urbanização',
  // KaMavota
  'Mavalane A',
  'Mavalane B',
  'FPLM',
  'Hulene A',
  'Hulene B',
  'Ferroviário',
  'Laulane',
  '3 de Fevereiro',
  'Mahotas',
  'Albazine',
  'Costa do Sol',
  // KaMubukwana
  '25 de Junho A',
  '25 de Junho B',
  'Bagamoyo',
  'George Dimitrov',
  'Inhagóia A',
  'Inhagóia B',
  'Jardim',
  'Luís Cabral',
  'Magoanine A',
  'Magoanine B',
  'Magoanine C',
  'Malhazine',
  'Nsalene',
  'Zimpeto',
  // KaTembe
  'Gwachene',
  'Chali',
  'Inguide',
  'Ncassene',
  'Xamissava',
  // KaNyaka
  'Ribzwene',
  'Inguane',
  'Nhanquene'
];

export const CIDADES_BAIRROS: Record<string, string[]> = {
  'Quelimane': QUELIMANE_BAIRROS,
  'Maputo Cidade': MAPUTO_BAIRROS
};

export function getBairrosPorCidade(cidade?: string): string[] {
  if (!cidade || cidade === 'Todas' || cidade === 'Todas as Cidades') {
    // Array com bairros únicos de todas as cidades
    return Array.from(new Set([...QUELIMANE_BAIRROS, ...MAPUTO_BAIRROS])).sort();
  }
  return CIDADES_BAIRROS[cidade] || QUELIMANE_BAIRROS;
}


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
  },
  {
    id: 'cat_prod_infoprodutos',
    name: 'Infoprodutos e Livros Digitais',
    slug: 'infoprodutos-e-livros-digitais',
    icon: 'BookOpen',
    type: 'produto',
    subcategories: ['E-books e Livros Digitais', 'Cursos e Formações Online', 'Templates e Documentos', 'Softwares e Scripts', 'Mentorias e Consultorias']
  }
];

export const INITIAL_USERS: UserProfile[] = [];

export const INITIAL_ADS: Ad[] = [];

export const INITIAL_REVIEWS: Review[] = [];


export const INITIAL_SETTINGS: SystemSettings = {
  freePlanMaxAds: 3,
  adValidityDays: 30,
  featuredPriceMZN: 150,
  proPlanPriceMonthlyMZN: 250,
  autoApproveAds: false,
  mpesaMerchantNumber: '84 900 1234',
  emolaMerchantNumber: '86 900 1234'
};
