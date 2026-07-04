import { z } from 'zod';
import type { LeadControlDTO } from '../../domain/interfaces/index';
import type { ILeadRepository } from '../../domain/interfaces/index';

const UpdateLeadControlInputSchema = z.object({
  curva_abc: z.union([z.number(), z.null()]).optional(),
  respondeu: z.union([z.number(), z.null()]).optional(),
  reuniao_agendada: z.union([z.number(), z.null()]).optional(),
  reuniao_concluida: z.union([z.number(), z.null()]).optional(),
  proposta_enviada: z.union([z.number(), z.null()]).optional(),
  conversao: z.union([z.number(), z.null()]).optional(),
  objecao: z.union([z.string(), z.null()]).optional(),
});

export type UpdateLeadControlInput = z.infer<typeof UpdateLeadControlInputSchema>;

export class UpdateLeadControlUseCase {
  constructor(private readonly leadRepository: ILeadRepository) {}

  async execute(id: string, input: UpdateLeadControlInput): Promise<LeadControlDTO | null> {
    const validated = UpdateLeadControlInputSchema.parse(input);
    const hasFields = Object.keys(validated).length > 0;
    if (!hasFields) {
      throw new Error('Nenhum campo de controle fornecido');
    }
    return this.leadRepository.updateControl(id, validated);
  }
}
