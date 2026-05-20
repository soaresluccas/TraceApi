import type { ILead } from '../../domain/entities/index';
import type { ILeadNotificationService } from '../../domain/interfaces/index';

interface BrevoEmailResponse {
  messageId?: string;
  code?: string;
  message?: string;
}

export class BrevoLeadNotificationService implements ILeadNotificationService {
  private readonly apiKey = process.env.BREVO_API_KEY;
  private readonly senderEmail = process.env.BREVO_SENDER_EMAIL;
  private readonly senderName = process.env.BREVO_SENDER_NAME || 'Trace Company';
  private readonly notificationEmail = process.env.LEAD_NOTIFICATION_EMAIL;
  private readonly isConfigured: boolean;
  private readonly maxRetries = 3;
  private readonly timeoutMs = 30000;

  constructor() {
    this.isConfigured = !!(this.apiKey && this.senderEmail && this.notificationEmail);
    
    if (!this.isConfigured) {
      console.error('[BrevoLeadNotificationService] CONFIGURAÇÃO INCOMPLETA:');
      console.error(`  - BREVO_API_KEY: ${this.apiKey ? '✓ configurada' : '✗ faltando'}`);
      console.error(`  - BREVO_SENDER_EMAIL: ${this.senderEmail ? '✓ configurada' : '✗ faltando'}`);
      console.error(`  - LEAD_NOTIFICATION_EMAIL: ${this.notificationEmail ? '✓ configurada' : '✗ faltando'}`);
      console.error('  Emails de notificação de leads NÃO serão enviados!');
    } else {
      console.log('[BrevoLeadNotificationService] Serviço configurado com sucesso');
      console.log(`  - Remetente: ${this.senderName} <${this.senderEmail}>`);
      console.log(`  - Destinatário: ${this.notificationEmail}`);
    }
  }

  async notifyNewLead(lead: ILead): Promise<void> {
    if (!this.isConfigured) {
      console.warn(`[BrevoLeadNotificationService] Email NÃO enviado para lead "${lead.name}" - configuração incompleta`);
      return;
    }

    console.log(`[BrevoLeadNotificationService] Iniciando envio de email para lead: "${lead.name}" (${lead.whatsapp})`);

    let lastError: Error | null = null;
    const startTime = Date.now();
    
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        if (attempt > 1) {
          const backoffMs = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
          console.log(`[BrevoLeadNotificationService] Tentativa ${attempt}/${this.maxRetries} após ${backoffMs}ms...`);
          await this.sleep(backoffMs);
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => {
          console.warn(`[BrevoLeadNotificationService] Timeout de ${this.timeoutMs}ms atingido (tentativa ${attempt})`);
          controller.abort();
        }, this.timeoutMs);

        try {
          const attemptStart = Date.now();
          const response = await fetch('https://api.brevo.com/v3/smtp/email', {
            method: 'POST',
            headers: {
              accept: 'application/json',
              'api-key': this.apiKey!,
              'content-type': 'application/json',
            },
            body: JSON.stringify({
              sender: {
                name: this.senderName,
                email: this.senderEmail,
              },
              to: [{ email: this.notificationEmail }],
              subject: `Novo lead recebido: ${lead.name}`,
              htmlContent: this.buildHtmlContent(lead),
              textContent: this.buildTextContent(lead),
            }),
            signal: controller.signal,
          });

          clearTimeout(timeoutId);

          if (!response.ok) {
            const errorData = (await response.json().catch(() => null)) as BrevoEmailResponse | null;
            const errorMessage = errorData?.message || `Brevo API retornou status ${response.status}`;
            
            if (response.status >= 500 && attempt < this.maxRetries) {
              console.warn(`[BrevoLeadNotificationService] Erro ${response.status} (tentativa ${attempt}/${this.maxRetries})`);
              lastError = new Error(errorMessage);
              continue;
            }
            
            console.error(`[BrevoLeadNotificationService] ERRO ao enviar email:`);
            console.error(`  - Lead: "${lead.name}"`);
            console.error(`  - Status HTTP: ${response.status}`);
            console.error(`  - Mensagem: ${errorMessage}`);
            if (errorData?.code) {
              console.error(`  - Código Brevo: ${errorData.code}`);
            }
            throw new Error(errorMessage);
          }

          const responseData = (await response.json().catch(() => null)) as BrevoEmailResponse | null;
          const elapsed = Date.now() - attemptStart;
          const totalElapsed = Date.now() - startTime;
          console.log(`[BrevoLeadNotificationService] ✓ Email enviado com sucesso para lead "${lead.name}"`);
          if (responseData?.messageId) {
            console.log(`  - Message ID: ${responseData.messageId}`);
          }
          console.log(`  - Tempo de resposta: ${elapsed}ms`);
          if (attempt > 1) {
            console.log(`  - Sucesso na tentativa ${attempt}/${this.maxRetries}`);
            console.log(`  - Tempo total (com retries): ${totalElapsed}ms`);
          }
          return;
        } finally {
          clearTimeout(timeoutId);
        }
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        
        const isNetworkError = lastError.name === 'AbortError' || 
                               lastError.message.includes('fetch failed') ||
                               lastError.message.includes('ECONNRESET') ||
                               lastError.message.includes('UND_ERR_SOCKET');
        
        if (isNetworkError && attempt < this.maxRetries) {
          console.warn(`[BrevoLeadNotificationService] Erro de rede (tentativa ${attempt}/${this.maxRetries}): ${lastError.message}`);
          continue;
        }
        
        console.error(`[BrevoLeadNotificationService] ERRO ao enviar email:`);
        console.error(`  - Lead: "${lead.name}"`);
        console.error(`  - Erro: ${lastError.message}`);
        console.error(`  - Tipo: ${lastError.name}`);
        throw lastError;
      }
    }
    
    if (lastError) {
      console.error(`[BrevoLeadNotificationService] Falha após ${this.maxRetries} tentativas`);
      throw lastError;
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private buildHtmlContent(lead: ILead): string {
    const rows = [
      ['Nome', lead.name],
      ['WhatsApp', lead.whatsapp],
      ['Instagram', lead.instagram],
      ['UTM Source', lead.utm_source],
      ['UTM Medium', lead.utm_medium],
      ['UTM Campaign', lead.utm_campaign],
      ['UTM Content', lead.utm_content],
      ['UTM Term', lead.utm_term],
      ['Recebido em', lead.created_at.toISOString()],
    ];

    const tableRows = rows
      .map(([label, value]) => {
        return `
          <tr>
            <td style="padding:8px 12px;border:1px solid #e5e7eb;font-weight:600;">${this.escapeHtml(label)}</td>
            <td style="padding:8px 12px;border:1px solid #e5e7eb;">${this.escapeHtml(value || '-')}</td>
          </tr>
        `;
      })
      .join('');

    return `
      <h2 style="font-family:Arial,sans-serif;margin:0 0 16px;">Novo lead recebido</h2>
      <table style="border-collapse:collapse;font-family:Arial,sans-serif;font-size:14px;">
        <tbody>${tableRows}</tbody>
      </table>
    `;
  }

  private buildTextContent(lead: ILead): string {
    return [
      'Novo lead recebido',
      `Nome: ${lead.name}`,
      `WhatsApp: ${lead.whatsapp}`,
      `Instagram: ${lead.instagram || '-'}`,
      `UTM Source: ${lead.utm_source || '-'}`,
      `UTM Medium: ${lead.utm_medium || '-'}`,
      `UTM Campaign: ${lead.utm_campaign || '-'}`,
      `UTM Content: ${lead.utm_content || '-'}`,
      `UTM Term: ${lead.utm_term || '-'}`,
      `Recebido em: ${lead.created_at.toISOString()}`,
    ].join('\n');
  }

  private escapeHtml(value: string | null | undefined): string {
    return (value || '-')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}
