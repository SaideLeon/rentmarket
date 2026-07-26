'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  X, 
  Mail, 
  Send, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  Inbox, 
  LogOut, 
  Sparkles,
  ShieldCheck,
  UserCheck
} from 'lucide-react';
import { initAuth, googleSignIn, logoutGoogle, getAccessToken } from '../../lib/firebase';
import { sendGmailEmail, listGmailMessages, getGmailProfile, GmailMessageSummary } from '../../lib/gmail';
import { useToast } from '../ui/Toast';
import { User } from 'firebase/auth';

interface GmailModalProps {
  onClose: () => void;
  initialTo?: string;
  initialSubject?: string;
  initialBody?: string;
}

export default function GmailModal({ onClose, initialTo = '', initialSubject = '', initialBody = '' }: GmailModalProps) {
  const { showToast } = useToast();

  const [googleUser, setGoogleUser] = useState<User | null>(null);
  const [accessToken, setAccessTokenState] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [activeTab, setActiveTab] = useState<'compose' | 'inbox'>('compose');

  // Compose form state
  const [to, setTo] = useState(initialTo);
  const [subject, setSubject] = useState(initialSubject || 'Consulta - Rent Market');
  const [body, setBody] = useState(initialBody || 'Olá, estou a contactar através do Rent Market.');
  const [sending, setSending] = useState(false);
  
  // Confirmation Modal state
  const [showConfirmSend, setShowConfirmSend] = useState(false);

  // Inbox state
  const [messages, setMessages] = useState<GmailMessageSummary[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [gmailAddress, setGmailAddress] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = initAuth(
      (user, token) => {
        setGoogleUser(user);
        setAccessTokenState(token);
      },
      () => {
        setGoogleUser(null);
        setAccessTokenState(null);
      }
    );
    return () => unsubscribe();
  }, []);

  const fetchInbox = useCallback(async (token: string) => {
    setLoadingMessages(true);
    try {
      const profile = await getGmailProfile(token);
      setGmailAddress(profile.emailAddress);

      const msgs = await listGmailMessages(token, 8);
      setMessages(msgs);
    } catch (err: any) {
      console.error('Erro ao carregar mensagens do Gmail:', err);
      showToast('Aviso ao carregar mensagens do Gmail: ' + (err.message || 'Erro desconhecido'), 'info');
    } finally {
      setLoadingMessages(false);
    }
  }, [showToast]);

  useEffect(() => {
    let isMounted = true;
    if (accessToken && activeTab === 'inbox') {
      const loadData = async () => {
        setLoadingMessages(true);
        try {
          const profile = await getGmailProfile(accessToken);
          if (isMounted) setGmailAddress(profile.emailAddress);

          const msgs = await listGmailMessages(accessToken, 8);
          if (isMounted) setMessages(msgs);
        } catch (err: any) {
          console.error('Erro ao carregar mensagens do Gmail:', err);
          if (isMounted) {
            showToast('Aviso ao carregar mensagens do Gmail: ' + (err.message || 'Erro desconhecido'), 'info');
          }
        } finally {
          if (isMounted) setLoadingMessages(false);
        }
      };
      loadData();
    }
    return () => {
      isMounted = false;
    };
  }, [accessToken, activeTab, showToast]);

  const handleGoogleLogin = async () => {
    setIsAuthenticating(true);
    try {
      const result = await googleSignIn();
      if (result) {
        setGoogleUser(result.user);
        setAccessTokenState(result.accessToken);
        showToast('Conta Gmail conectada com sucesso!', 'success');
        if (activeTab === 'inbox') {
          fetchInbox(result.accessToken);
        }
      }
    } catch (err: any) {
      showToast('Falha ao autenticar com o Google: ' + (err.message || 'Tente novamente'), 'error');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleLogout = async () => {
    await logoutGoogle();
    setGoogleUser(null);
    setAccessTokenState(null);
    setGmailAddress(null);
    setMessages([]);
    showToast('Sessão do Gmail encerrada.', 'info');
  };

  // User confirmation dialog before actual email sending
  const handleOpenConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!to.trim()) {
      showToast('Por favor, introduza o e-mail do destinatário.', 'error');
      return;
    }
    if (!subject.trim()) {
      showToast('Por favor, introduza o assunto do e-mail.', 'error');
      return;
    }
    if (!body.trim()) {
      showToast('Por favor, escreva a mensagem.', 'error');
      return;
    }

    setShowConfirmSend(true);
  };

  const handleConfirmAndSend = async () => {
    const token = accessToken || getAccessToken();
    if (!token) {
      showToast('Sessão do Gmail expirada. Ligue a sua conta Google.', 'error');
      setShowConfirmSend(false);
      return;
    }

    setSending(true);
    try {
      await sendGmailEmail({
        to: to.trim(),
        subject: subject.trim(),
        body: body.trim(),
        accessToken: token
      });

      showToast('E-mail enviado com sucesso via Gmail!', 'success');
      setShowConfirmSend(false);
      onClose();
    } catch (err: any) {
      showToast('Erro ao enviar e-mail: ' + (err.message || 'Ocorreu um erro'), 'error');
      setShowConfirmSend(false);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[80] bg-slate-950/70 backdrop-blur-sm overflow-y-auto p-3 sm:p-6 flex min-h-full items-center justify-center">
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-xl w-full max-h-[90vh] my-auto flex flex-col border border-slate-100 animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
        
        {/* Header */}
        <div className="shrink-0 bg-slate-900 text-white p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 sm:p-2.5 rounded-xl bg-red-600/20 border border-red-500/30 text-red-400">
              <Mail className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base sm:text-lg text-white leading-tight">Integração Gmail</h3>
                <span className="text-[10px] font-bold bg-red-500/20 text-red-300 border border-red-500/30 px-2 py-0.5 rounded-full">
                  Oficial Google
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">Envie e consulte e-mails diretamente da sua Conta Google</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Auth Banner */}
        <div className="shrink-0 bg-slate-50 border-b border-slate-200 px-4 sm:px-5 py-2.5 flex items-center justify-between gap-2">
          {googleUser ? (
            <div className="flex items-center gap-3">
              {googleUser.photoURL ? (
                <img src={googleUser.photoURL} alt={googleUser.displayName || 'Google User'} className="w-8 h-8 rounded-full border border-emerald-500" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-red-600 text-white font-bold text-xs flex items-center justify-center">
                  {googleUser.email ? googleUser.email[0].toUpperCase() : 'G'}
                </div>
              )}
              <div className="text-xs">
                <p className="font-bold text-slate-900 flex items-center gap-1">
                  {googleUser.displayName || 'Conta Google'}
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                </p>
                <p className="text-slate-500 text-[11px]">{googleUser.email}</p>
              </div>
            </div>
          ) : (
            <div className="text-xs text-slate-600 flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-slate-400 shrink-0" />
              <span>Conecte a sua conta Gmail para enviar e receber e-mails no aplicativo.</span>
            </div>
          )}

          {googleUser ? (
            <button
              onClick={handleLogout}
              className="text-xs font-semibold text-slate-500 hover:text-red-600 flex items-center gap-1 transition px-2 py-1 rounded-lg hover:bg-slate-200/60"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sair</span>
            </button>
          ) : (
            <button
              onClick={handleGoogleLogin}
              disabled={isAuthenticating}
              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs shadow-xs transition flex items-center gap-1.5 disabled:opacity-50"
            >
              <Mail className="w-3.5 h-3.5 text-red-400" />
              <span>{isAuthenticating ? 'A conectar...' : 'Entrar com Google'}</span>
            </button>
          )}
        </div>

        {/* Tab Selection */}
        <div className="shrink-0 flex border-b border-slate-200 bg-white">
          <button
            onClick={() => setActiveTab('compose')}
            className={`flex-1 py-3 text-xs sm:text-sm font-bold text-center border-b-2 transition flex items-center justify-center gap-2 ${
              activeTab === 'compose'
                ? 'border-red-600 text-red-600 bg-red-50/30'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Send className="w-4 h-4" />
            <span>Escrever E-mail</span>
          </button>
          <button
            onClick={() => setActiveTab('inbox')}
            className={`flex-1 py-3 text-xs sm:text-sm font-bold text-center border-b-2 transition flex items-center justify-center gap-2 ${
              activeTab === 'inbox'
                ? 'border-red-600 text-red-600 bg-red-50/30'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Inbox className="w-4 h-4" />
            <span>Caixa de Entrada</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4 min-h-0">
          {!googleUser && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-amber-900">Autenticação Google Necessária</p>
                <p className="mt-0.5 leading-relaxed">
                  Para poder enviar mensagens diretamente do seu e-mail do Gmail ou visualizar a sua caixa de entrada, utilize o botão <strong>Entrar com Google</strong>.
                </p>
                <button
                  onClick={handleGoogleLogin}
                  disabled={isAuthenticating}
                  className="mt-2.5 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-xs shadow-sm transition inline-flex items-center gap-2"
                >
                  <Sparkles className="w-3.5 h-3.5 fill-red-200" />
                  <span>Conectar Conta Gmail</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'compose' ? (
            <form onSubmit={handleOpenConfirm} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Para (E-mail do Destinatário)</label>
                <input
                  type="email"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  placeholder="exemplo@gmail.com"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Assunto</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Assunto da mensagem"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Corpo do E-mail</label>
                <textarea
                  rows={5}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Escreva o conteúdo da mensagem..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={!googleUser || sending}
                  className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-sm shadow-md transition disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>{sending ? 'A enviar...' : 'Enviar e-mail via Gmail'}</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>{gmailAddress ? `Mensagens de: ${gmailAddress}` : 'Mensagens recentes do Gmail'}</span>
                {googleUser && (
                  <button
                    onClick={() => fetchInbox(accessToken!)}
                    disabled={loadingMessages}
                    className="p-1 hover:text-slate-900 transition flex items-center gap-1 font-semibold"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loadingMessages ? 'animate-spin' : ''}`} />
                    <span>Atualizar</span>
                  </button>
                )}
              </div>

              {loadingMessages ? (
                <div className="py-12 text-center text-slate-400 space-y-2">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto text-red-500" />
                  <p className="text-xs">A carregar e-mails do Gmail...</p>
                </div>
              ) : messages.length === 0 ? (
                <div className="py-12 text-center text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <Inbox className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                  <p className="text-xs font-semibold text-slate-600">Nenhuma mensagem recente encontrada</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">As suas mensagens de e-mail aparecerão aqui quando conectadas.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {messages.map((msg) => (
                    <div key={msg.id} className="p-3 bg-slate-50 hover:bg-slate-100 rounded-2xl border border-slate-200/80 transition">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-900">
                        <span className="truncate max-w-[240px]">{msg.from}</span>
                        <span className="text-[10px] text-slate-400 font-normal">{msg.date ? new Date(msg.date).toLocaleDateString('pt-PT') : ''}</span>
                      </div>
                      <p className="text-xs font-semibold text-slate-800 mt-1 truncate">{msg.subject}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">{msg.snippet}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Confirmation Modal overlay (mandatory explicit user consent for Workspace mutation/sending) */}
        {showConfirmSend && (
          <div className="fixed inset-0 z-[90] bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full my-auto shadow-2xl border border-slate-100 space-y-4 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-100 text-amber-800 rounded-xl">
                  <AlertCircle className="w-5 h-5 text-amber-600" />
                </div>
                <h4 className="font-bold text-slate-900 text-base">Confirmar Envio de E-mail</h4>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                Está prestes a enviar uma mensagem oficial a partir do seu endereço do Gmail para <strong>{to}</strong>.
              </p>

              <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1.5 border border-slate-200">
                <p className="text-slate-500"><strong>Assunto:</strong> {subject}</p>
                <p className="text-slate-700 line-clamp-3"><strong>Conteúdo:</strong> {body}</p>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setShowConfirmSend(false)}
                  disabled={sending}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirmAndSend}
                  disabled={sending}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-xs shadow-sm transition flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{sending ? 'A enviar...' : 'Sim, Enviar Agora'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
