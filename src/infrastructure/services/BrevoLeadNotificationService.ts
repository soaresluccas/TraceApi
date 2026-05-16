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

  async notifyNewLead(lead: ILead): Promise<void> {
    if (!this.apiKey || !this.senderEmail || !this.notificationEmail) {
      console.warn('[BrevoLeadNotificationService] Brevo env vars are not configured. Skipping email.');
      return;
    }

    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'api-key': this.apiKey,
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
    });

    if (!response.ok) {
      const error = (await response.json().catch(() => null)) as BrevoEmailResponse | null;
      throw new Error(error?.message || `Brevo request failed with status ${response.status}`);
    }
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
