import type { ICrmRepository, StageHistoryEntry } from '../../../domain/interfaces/index';

export class GetCardHistoryUseCase {
  constructor(private readonly crmRepository: ICrmRepository) {}

  async execute(cardId: string): Promise<StageHistoryEntry[]> {
    if (!cardId) throw new Error('card_id é obrigatório');

    return this.crmRepository.getCardHistory(cardId);
  }
}
