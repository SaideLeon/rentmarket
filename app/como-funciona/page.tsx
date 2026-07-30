'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  PlusCircle, 
  Search, 
  ShieldCheck, 
  MessageSquare, 
  PhoneCall, 
  Smartphone, 
  CheckCircle2, 
  HelpCircle, 
  Lock, 
  Sparkles, 
  ArrowRight, 
  ChevronDown, 
  Zap, 
  Store, 
  BadgeCheck,
  UserCheck,
  MapPin,
  Clock,
  ThumbsUp
} from 'lucide-react';
import { triggerPwaInstall } from '../../components/common/PWAInstaller';

export default function ComoFuncionaPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqs = [
    {
      question: 'O Rent Market Quelimane cobra alguma comissão pelos alugueres ou vendas?',
      answer: 'Não! O Rent Market é uma plataforma local totalmente gratuita para a publicação de anúncios padrão e para o contacto direto entre clientes e prestadores de serviço/proprietários. Não cobramos qualquer comissão sobre os seus negócios.'
    },
    {
      question: 'Como funciona o processo de Verificação de Perfil?',
      answer: 'Para aumentar a confiança entre os utilizadores de Quelimane, pode submeter uma foto do seu documento de identificação (BI ou Passaporte). A nossa equipa valida o documento em até 24h e atribui-lhe o selo de "Utilizador Verificado", o que gera muito mais contactos dos clientes.'
    },
    {
      question: 'Como é que os clientes entram em contacto comigo?',
      answer: 'Na página do seu anúncio, os visitantes podem clicar diretamente para enviar uma mensagem por WhatsApp, fazer uma chamada telefónica normal ou utilizar o chat de mensagens internas integrado da plataforma.'
    },
    {
      question: 'Como posso colocar o meu anúncio em Destaque na página principal?',
      answer: 'Disponibilizamos Planos de Destaque acessíveis com pagamento via M-Pesa ou e-Mola. Os anúncios destacados ficam posicionados no topo da página inicial e nos resultados de pesquisa com um distintivo especial de destaque.'
    },
    {
      question: 'Como posso instalar a aplicação no meu telemóvel Android?',
      answer: 'O Rent Market é uma PWA (Progressive Web App). Pode clicar no botão "Instalar App Android" no menu superior ou no rodapé, ou aceder ao menu do seu navegador (três pontos) e selecionar "Instalar Aplicação" / "Adicionar ao Ecrã Principal".'
    },
    {
      question: 'Quais são os bairros de Quelimane cobertos pela plataforma?',
      answer: 'Cobrimos todos os bairros e zonas de Quelimane, incluindo Central, Alto Molócue, Coalane, Sagrada Família, Sangariveira, Aeroporto, Brandão, Torrone, Icundu, Madal, Mucelo e arredores.'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-12">
        
        {/* Header Hero */}
        <div className="bg-gradient-to-br from-emerald-800 via-teal-800 to-slate-900 rounded-3xl p-8 sm:p-12 text-white shadow-xl relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-teal-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-0 right-1/4 w-40 h-40 bg-emerald-400/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-500/20 border border-teal-400/30 text-teal-200 text-xs font-semibold uppercase tracking-wider mb-6">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Guia Completo do Utilizador</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-4 leading-tight">
              Como Funciona o <span className="text-teal-300">Rent Market</span> Quelimane
            </h1>
            
            <p className="text-base sm:text-lg text-slate-200 leading-relaxed mb-8">
              Conectamos proprietários, prestadores de serviços, artesãos e comerciantes diretamente a quem procura alugar casas, contratar serviços ou comprar produtos na cidade de Quelimane. Sem intermediários nem complicações.
            </p>

            <div className="flex flex-wrap gap-3">
              <Link 
                href="/publicar" 
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-5 py-3 rounded-xl shadow-lg transition flex items-center gap-2 text-sm"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Publicar Anúncio Grátis</span>
              </Link>
              <Link 
                href="/pesquisa" 
                className="bg-slate-800/80 hover:bg-slate-700 text-white font-medium px-5 py-3 rounded-xl border border-slate-700 transition flex items-center gap-2 text-sm"
              >
                <Search className="w-4 h-4 text-teal-400" />
                <span>Explorar Anúncios</span>
              </Link>
              <button 
                onClick={() => triggerPwaInstall()}
                className="bg-teal-700/60 hover:bg-teal-600/80 text-teal-100 font-medium px-5 py-3 rounded-xl border border-teal-500/40 transition flex items-center gap-2 text-sm"
              >
                <Smartphone className="w-4 h-4 text-teal-300" />
                <span>Instalar App Android</span>
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic Toggle Section Header */}
        <div className="text-center max-w-2xl mx-auto pt-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Passo a Passo Simples & Direto
          </h2>
          <p className="text-slate-600 text-sm sm:text-base mt-2">
            Veja como é fácil começar a utilizar o Rent Market Quelimane, quer seja um anunciante ou um cliente.
          </p>
        </div>

        {/* Grid 2 Columns: For Advertisers / For Buyers */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Card: Para Quem Quer Anunciar ou Prestar Serviços */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-lg shrink-0">
                  <Store className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Para Anunciantes & Prestadores</h3>
                  <p className="text-xs text-slate-500">Alugue imóveis, equipamentos ou ofereça os seus serviços</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    1
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 text-sm">Crie a sua Conta</h4>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      Registe-se em poucos segundos com o seu e-mail e contacto telefónico local.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    2
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 text-sm">Publique o Anúncio</h4>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      Adicione fotografias nítidas, escolha o bairro de Quelimane, fixe o preço (diário ou mensal) e especifique os detalhes.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    3
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 text-sm">Verifique o seu Perfil (Opcional)</h4>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      Submeta o seu documento para obter o distintivo <strong>&quot;Verificado&quot;</strong> e ter 3x mais probabilidade de fechar negócio.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    4
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 text-sm">Receba Contactos no WhatsApp</h4>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      Os clientes interessados entram em contacto direto através do seu WhatsApp ou telemóvel sem intermediários.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100">
              <Link 
                href="/publicar" 
                className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 px-4 rounded-xl text-center text-sm flex items-center justify-center gap-2 transition"
              >
                <span>Começar a Anunciar Agora</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Card: Para Quem Procura Alugar ou Contratar */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-lg shrink-0">
                  <Search className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Para Clientes & Arrendatários</h3>
                  <p className="text-xs text-slate-500">Encontre casas, veículos, serviços e negócios locais</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-full bg-teal-600 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    1
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 text-sm">Pesquise por Bairro ou Categoria</h4>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      Filtre ofertas no bairro Central, Coalane, Alto Molócue ou procure pelo tipo de serviço necessário.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-full bg-teal-600 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    2
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 text-sm">Verifique Perfil & Selo de Segurança</h4>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      Dê preferência a anúncios com o selo verde de <strong>Vendedor/Prestador Verificado</strong> para maior tranquilidade.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-full bg-teal-600 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    3
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 text-sm">Fale Diretamente</h4>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      Clique no botão de WhatsApp ou Chamada Telefónica para tirar dúvidas e negociar os valores sem taxas de comissão.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-full bg-teal-600 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    4
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 text-sm">Conclua o Negócio Presencialmente</h4>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      Visite o imóvel ou produto, faça o teste e efetue o pagamento presencialmente ou via M-Pesa / e-Mola.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100">
              <Link 
                href="/pesquisa" 
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-3 px-4 rounded-xl text-center text-sm flex items-center justify-center gap-2 transition"
              >
                <span>Pesquisar Ofertas Disponíveis</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

        </div>

        {/* Feature Highlights Grid */}
        <div className="bg-slate-900 rounded-3xl p-8 sm:p-10 text-white">
          <div className="text-center max-w-xl mx-auto mb-10">
            <span className="text-teal-400 text-xs font-bold uppercase tracking-wider">Vantagens Exclusivas</span>
            <h3 className="text-2xl font-bold mt-1 text-white">Porquê Escolher o Rent Market Quelimane?</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700/60">
              <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center mb-4">
                <UserCheck className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm text-white mb-1">Perfis Verificados</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Sistema de verificação de identidade com BI/Passaporte para garantir anúncios legítimos em Quelimane.
              </p>
            </div>

            <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700/60">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4">
                <MapPin className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm text-white mb-1">Foco Local Quelimane</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Filtros específicos por bairros conhecidos da cidade para encontrar negócios perto de si.
              </p>
            </div>

            <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700/60">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-4">
                <Smartphone className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm text-white mb-1">Aplicação PWA Instalável</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Instale no telemóvel Android sem passar pela loja de apps, gastando mínimos dados móveis.
              </p>
            </div>

            <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700/60">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center mb-4">
                <ThumbsUp className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm text-white mb-1">Sem Comissões</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Negociação livre e direta entre as partes via WhatsApp, M-Pesa ou pagamento presencial.
              </p>
            </div>
          </div>
        </div>

        {/* Safety Tips Banner */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 sm:p-8">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-md">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-amber-950 mb-1">Dicas Importantes de Segurança em Quelimane</h3>
              <p className="text-xs sm:text-sm text-amber-900 leading-relaxed mb-4">
                Queremos que todos os negócios realizados no Rent Market decorram com máxima segurança e confiança. Siga sempre estas boas práticas:
              </p>
              
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-amber-900 font-medium">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Marque os encontros em locais públicos e movimentados de Quelimane.</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Nunca faça adiantamentos de dinheiro sem antes ver o imóvel ou produto.</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Confirme a identidade e o número M-Pesa/e-Mola do anunciante antes de pagar.</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Em caso de dúvida, consulte perfis com selo de <strong>Verificado</strong>.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* FAQ Accordion */}
        <div className="bg-white rounded-2xl p-6 sm:p-10 border border-slate-200 shadow-sm">
          <div className="text-center max-w-xl mx-auto mb-8">
            <div className="w-10 h-10 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center mx-auto mb-2">
              <HelpCircle className="w-5 h-5" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900">Perguntas Frequentes (FAQ)</h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Esclareça as dúvidas mais comuns sobre o funcionamento da plataforma
            </p>
          </div>

          <div className="space-y-3 max-w-3xl mx-auto">
            {faqs.map((faq, idx) => (
              <div 
                key={idx}
                className="border border-slate-200 rounded-xl overflow-hidden transition"
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full text-left p-4 sm:p-5 font-semibold text-slate-900 text-sm sm:text-base flex items-center justify-between gap-4 bg-slate-50/50 hover:bg-slate-100/60 transition"
                >
                  <span>{faq.question}</span>
                  <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-200 shrink-0 ${openFaq === idx ? 'rotate-180 text-teal-600' : ''}`} />
                </button>
                {openFaq === idx && (
                  <div className="p-4 sm:p-5 pt-0 text-xs sm:text-sm text-slate-600 leading-relaxed bg-white border-t border-slate-100">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Final CTA Footer Banner */}
        <div className="bg-teal-700 rounded-3xl p-8 sm:p-12 text-center text-white relative overflow-hidden shadow-xl">
          <div className="relative z-10 max-w-2xl mx-auto">
            <h3 className="text-2xl sm:text-4xl font-extrabold mb-3">
              Pronto para dinamizar o seu negócio em Quelimane?
            </h3>
            <p className="text-teal-100 text-sm sm:text-base mb-8">
              Junte-se à maior comunidade local de alugueres, produtos e prestadores de serviços da Zambézia.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link 
                href="/publicar" 
                className="bg-white text-teal-900 hover:bg-teal-50 font-bold px-6 py-3.5 rounded-xl shadow-lg transition text-sm flex items-center gap-2"
              >
                <PlusCircle className="w-4 h-4 text-teal-600" />
                <span>Publicar o Primeiro Anúncio</span>
              </Link>
              <Link 
                href="/cadastro" 
                className="bg-teal-900/60 hover:bg-teal-900 text-white font-medium px-6 py-3.5 rounded-xl border border-teal-500/50 transition text-sm"
              >
                <span>Criar Conta Gratuita</span>
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
