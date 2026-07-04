import type { ICrmRepository, CreateCardInput } from '../../../domain/interfaces/index';
import type { CrmCard } from '../../../domain/entities/index';

export class CreateCardUseCase {
  constructor(private readonly crmRepository: ICrmRepository) {}

  async execute(input: CreateCardInput): Promise<CrmCard> {
    if (!input.lead_id) {
      throw new Error('lead_id é obrigatório');
    }

    if (input.priority && !['Baixa', 'Normal', 'Alta', 'Urgente'].includes(input.priority)) {
      throw new Error('priority deve ser: Baixa, Normal, Alta ou Urgente');
    }

    return this.crmRepository.createCard(input);
  }
}
