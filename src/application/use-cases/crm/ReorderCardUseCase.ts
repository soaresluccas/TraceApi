import type { ICrmRepository } from '../../../domain/interfaces/index';
import type { CrmCard } from '../../../domain/entities/index';

export interface ReorderCardInput {
  stage_id: string;
  card_id: string;
  new_position: number;
}

export class ReorderCardUseCase {
  constructor(private readonly crmRepository: ICrmRepository) {}

  async execute(input: ReorderCardInput): Promise<CrmCard[]> {
    if (!input.stage_id) throw new Error('stage_id é obrigatório');
    if (!input.card_id) throw new Error('card_id é obrigatório');
    if (input.new_position === undefined || input.new_position === null) {
      throw new Error('new_position é obrigatório');
    }

    return this.crmRepository.reorderCards(input.stage_id, input.card_id, input.new_position);
  }
}
