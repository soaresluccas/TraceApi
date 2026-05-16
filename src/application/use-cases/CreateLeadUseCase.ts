import { z } from 'zod';
import { Lead } from '../../domain/entities/index';
import type { ILeadNotificationService, ILeadRepository } from '../../domain/interfaces/index';

const optionalLeadText = z
  .string()
  .trim()
  .max(120, 'Campo deve ter no máximo 120 caracteres')
  .optional();

const CreateLeadInputSchema = z.object({
  name: z.string().trim().min(2, 'Nome deve ter no mínimo 2 caracteres').max(80, 'Nome deve ter no máximo 80 caracteres'),
  whatsapp: z.string().trim().regex(/^\d{10,15}$/, 'WhatsApp inválido'),
  instagram: z.string().trim().max(40, 'Instagram deve ter no máximo 40 caracteres').optional(),
  utm_source: optionalLeadText,
  utm_medium: optionalLeadText,
  utm_campaign: optionalLeadText,
  utm_content: optionalLeadText,
  utm_term: optionalLeadText,
}).strict('Campos extras não são permitidos');

export type CreateLeadInput = z.infer<typeof CreateLeadInputSchema>;

export class CreateLeadUseCase {
  constructor(
    private readonly leadRepository: ILeadRepository,
    private readonly leadNotificationService?: ILeadNotificationService
  ) {}

  async execute(input: CreateLeadInput): Promise<Lead> {
    const validated = CreateLeadInputSchema.parse(input);
    
    const lead = Lead.create({
      name: validated.name,
      whatsapp: validated.whatsapp,
      instagram: validated.instagram || null,
      utm_source: validated.utm_source || null,
      utm_medium: validated.utm_medium || null,
      utm_campaign: validated.utm_campaign || null,
      utm_content: validated.utm_content || null,
      utm_term: validated.utm_term || null,
    });

    const createdLead = await this.leadRepository.create(lead);

    if (this.leadNotificationService) {
      void this.leadNotificationService.notifyNewLead(createdLead.toPrimitive()).catch((error) => {
        console.error('[CreateLeadUseCase] Failed to send lead notification:', error);
      });
    }

    return createdLead;
  }
}

