import type { ICrmRepository } from '../../../domain/interfaces/index';
import type { CrmCard } from '../../../domain/entities/index';

export interface MoveCardInput {
  card_id: string;
  stage_id: string;
  position?: number;
}

export class MoveCardUseCase {
  constructor(private readonly crmRepository: ICrmRepository) {}

  async execute(input: MoveCardInput): Promise<CrmCard> {
    if (!input.card_id) throw new Error('card_id é obrigatório');
    if (!input.stage_id) throw new Error('stage_id é obrigatório');

    return this.crmRepository.moveCard(input.card_id, input.stage_id, input.position);
  }
}
