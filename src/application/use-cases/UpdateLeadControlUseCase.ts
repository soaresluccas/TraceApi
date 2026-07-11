import { z } from 'zod';
import type { LeadControlDTO } from '../../domain/interfaces/index';
import type { ILeadRepository } from '../../domain/interfaces/index';
import { parseBRCurrency } from '../../domain/utils/index';

const UpdateLeadControlInputSchema = z.object({
  faturamento: z.union([z.string(), z.number(), z.null()]).optional(),
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

    const parsed: Record<string, unknown> = {};
    if (validated.faturamento !== undefined) {
      parsed.faturamento = parseBRCurrency(validated.faturamento);
    }
    if (validated.curva_abc !== undefined) parsed.curva_abc = validated.curva_abc;
    if (validated.respondeu !== undefined) parsed.respondeu = validated.respondeu;
    if (validated.reuniao_agendada !== undefined) parsed.reuniao_agendada = validated.reuniao_agendada;
    if (validated.reuniao_concluida !== undefined) parsed.reuniao_concluida = validated.reuniao_concluida;
    if (validated.proposta_enviada !== undefined) parsed.proposta_enviada = validated.proposta_enviada;
    if (validated.conversao !== undefined) parsed.conversao = validated.conversao;
    if (validated.objecao !== undefined) parsed.objecao = validated.objecao;

    return this.leadRepository.updateControl(id, parsed);
  }
}
