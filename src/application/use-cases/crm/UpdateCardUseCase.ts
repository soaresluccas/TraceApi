import type { ICrmRepository, UpdateCardInput } from '../../../domain/interfaces/index';
import type { CrmCard } from '../../../domain/entities/index';

export interface UpdateCardUseCaseInput extends UpdateCardInput {
  card_id: string;
}

export class UpdateCardUseCase {
  constructor(private readonly crmRepository: ICrmRepository) {}

  async execute(input: UpdateCardUseCaseInput): Promise<CrmCard | null> {
    if (!input.card_id) throw new Error('card_id é obrigatório');

    if (input.priority && !['Baixa', 'Normal', 'Alta', 'Urgente'].includes(input.priority)) {
      throw new Error('priority deve ser: Baixa, Normal, Alta ou Urgente');
    }

    return this.crmRepository.updateCard(input.card_id, {
      priority: input.priority,
      assigned_to: input.assigned_to,
      observacao: input.observacao,
    });
  }
}
