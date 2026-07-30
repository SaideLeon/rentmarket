import { getUserReviews, getAllUsers } from './store';
import { sendGmailEmail } from './gmail';
import { getAccessToken } from './firebase';

export interface NotifyParams {
  adId: string;
  adTitle: string;
  senderName: string;
  receiverId: string;
  receiverName: string;
  receiverEmail?: string;
  messageContent: string;
  accessToken?: string | null;
}

export interface NotifyResult {
  success: boolean;
  emailSent: boolean;
  recipientEmail: string;
  details: string;
}

export async function notifyAdvertiserNewMessage({
  adId,
  adTitle,
  senderName,
  receiverId,
  receiverName,
  receiverEmail,
  messageContent,
  accessToken
}: NotifyParams): Promise<NotifyResult> {
  // Find receiver email
  let targetEmail = receiverEmail;

  if (!targetEmail) {
    const users = getAllUsers();
    const receiver = users.find(u => u.id === receiverId);
    if (receiver && receiver.email) {
      targetEmail = receiver.email;
    }
  }

  // Fallback if no specific email is defined in mock data
  if (!targetEmail) {
    targetEmail = `${receiverName.toLowerCase().replace(/[^a-z0-9]/g, '.')}@rentmarket.co.mz`;
  }

  const token = accessToken || getAccessToken();

  if (!token) {
    return {
      success: true,
      emailSent: false,
      recipientEmail: targetEmail,
      details: 'Mensagem guardada localmente. Conecte a sua conta Gmail para disparar e-mails automáticos.'
    };
  }

  const emailSubject = `[Mussika Online] Nova Mensagem sobre: "${adTitle}"`;
  const emailBody = `Olá ${receiverName},

Você recebeu uma nova mensagem de contacto de um cliente no Mussika Online!

--------------------------------------------------
DADOS DA MENSAGEM:
--------------------------------------------------
• Anúncio: ${adTitle}
• Cliente: ${senderName}
• Mensagem: "${messageContent}"

--------------------------------------------------
COMO RESPONDER:
--------------------------------------------------
Pode responder diretamente a esta mensagem ou aceder ao painel de controlo do Mussika Online:
https://mussika.co.mz/dashboard?tab=messages

Atenciosamente,
Equipa Mussika Online
https://mussika.co.mz`;

  try {
    await sendGmailEmail({
      to: targetEmail,
      subject: emailSubject,
      body: emailBody,
      accessToken: token
    });

    return {
      success: true,
      emailSent: true,
      recipientEmail: targetEmail,
      details: `Notificação enviada com sucesso via Gmail para ${targetEmail}!`
    };
  } catch (error: any) {
    console.error('Erro ao enviar notificação por e-mail via Gmail:', error);
    return {
      success: false,
      emailSent: false,
      recipientEmail: targetEmail,
      details: error.message || 'Falha ao enviar e-mail de notificação pelo Gmail.'
    };
  }
}
