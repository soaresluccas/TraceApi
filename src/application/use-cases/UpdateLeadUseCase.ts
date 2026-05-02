import { z } from 'zod';
import type { Lead } from '../../domain/entities/index';
import type { ILeadRepository } from '../../domain/interfaces/index';

const UpdateLeadInputSchema = z.object({
  name: z.string().min(2).optional(),
  whatsapp: z.string().regex(/^\d{10,15}$/).optional(),
  instagram: z.string().optional(),
  utm_source: z.string().optional(),
  utm_medium: z.string().optional(),
  utm_campaign: z.string().optional(),
  utm_content: z.string().optional(),
  utm_term: z.string().optional(),
});

export type UpdateLeadInput = z.infer<typeof UpdateLeadInputSchema>;

export class UpdateLeadUseCase {
  constructor(private readonly leadRepository: ILeadRepository) {}

  async execute(id: string, input: UpdateLeadInput): Promise<Lead | null> {
    const validated = UpdateLeadInputSchema.parse(input);
    return this.leadRepository.update(id, validated);
  }
}

