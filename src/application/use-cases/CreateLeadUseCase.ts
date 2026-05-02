import { z } from 'zod';
import { Lead } from '../../domain/entities/index';
import type { ILeadRepository } from '../../domain/interfaces/index';

const CreateLeadInputSchema = z.object({
  name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
  whatsapp: z.string().regex(/^\d{10,15}$/, 'WhatsApp inválido'),
  instagram: z.string().optional(),
  utm_source: z.string().optional(),
  utm_medium: z.string().optional(),
  utm_campaign: z.string().optional(),
  utm_content: z.string().optional(),
  utm_term: z.string().optional(),
});

export type CreateLeadInput = z.infer<typeof CreateLeadInputSchema>;

export class CreateLeadUseCase {
  constructor(private readonly leadRepository: ILeadRepository) {}

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

    return this.leadRepository.create(lead);
  }
}

