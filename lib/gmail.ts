export interface GmailMessageHeader {
  name: string;
  value: string;
}

export interface GmailMessageSummary {
  id: string;
  threadId: string;
  snippet?: string;
  subject?: string;
  from?: string;
  date?: string;
}

function base64UrlEncode(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

export async function sendGmailEmail({
  to,
  subject,
  body,
  accessToken
}: {
  to: string;
  subject: string;
  body: string;
  accessToken: string;
}): Promise<{ id: string; threadId: string }> {
  // Construct raw RFC 2822 email
  const utf8Subject = `=?utf-8?B?${btoa(unescape(encodeURIComponent(subject)))}?=`;
  const emailLines = [
    `To: ${to}`,
    `Subject: ${utf8Subject}`,
    'Content-Type: text/plain; charset="UTF-8"',
    'MIME-Version: 1.0',
    '',
    body
  ];

  const rawEmail = emailLines.join('\r\n');
  const encodedEmail = base64UrlEncode(rawEmail);

  const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ raw: encodedEmail })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Falha ao enviar e-mail via Gmail (${response.status})`);
  }

  return await response.json();
}

export async function getGmailProfile(accessToken: string): Promise<{ emailAddress: string; messagesTotal: number }> {
  const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/profile', {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  if (!res.ok) {
    throw new Error(`Falha ao obter perfil do Gmail (${res.status})`);
  }
  return await res.json();
}

export async function listGmailMessages(accessToken: string, maxResults = 10): Promise<GmailMessageSummary[]> {
  const listRes = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=${maxResults}`, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });

  if (!listRes.ok) {
    throw new Error(`Falha ao listar mensagens do Gmail (${listRes.status})`);
  }

  const listData = await listRes.json();
  if (!listData.messages || listData.messages.length === 0) {
    return [];
  }

  // Fetch header info for each message
  const messages: GmailMessageSummary[] = await Promise.all(
    listData.messages.map(async (msg: { id: string; threadId: string }) => {
      try {
        const detailRes = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=metadata&metadataHeaders=Subject&metadataHeaders=From&metadataHeaders=Date`, {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        if (!detailRes.ok) return { id: msg.id, threadId: msg.threadId };
        const detail = await detailRes.json();
        const headers: GmailMessageHeader[] = detail.payload?.headers || [];
        
        const subjectHeader = headers.find(h => h.name.toLowerCase() === 'subject')?.value;
        const fromHeader = headers.find(h => h.name.toLowerCase() === 'from')?.value;
        const dateHeader = headers.find(h => h.name.toLowerCase() === 'date')?.value;

        return {
          id: msg.id,
          threadId: msg.threadId,
          snippet: detail.snippet,
          subject: subjectHeader || '(Sem Assunto)',
          from: fromHeader || 'Desconhecido',
          date: dateHeader
        };
      } catch {
        return { id: msg.id, threadId: msg.threadId };
      }
    })
  );

  return messages;
}
