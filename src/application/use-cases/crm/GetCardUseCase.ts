import type { ICrmRepository, CardDetail } from '../../../domain/interfaces/index';

export class GetCardUseCase {
  constructor(private readonly crmRepository: ICrmRepository) {}

  async execute(cardId: string): Promise<CardDetail | null> {
    if (!cardId) throw new Error('card_id é obrigatório');

    return this.crmRepository.getCardById(cardId);
  }
}
