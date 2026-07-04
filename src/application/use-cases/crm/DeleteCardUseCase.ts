import type { ICrmRepository } from '../../../domain/interfaces/index';

export class DeleteCardUseCase {
  constructor(private readonly crmRepository: ICrmRepository) {}

  async execute(cardId: string): Promise<boolean> {
    if (!cardId) throw new Error('card_id é obrigatório');

    return this.crmRepository.deleteCard(cardId);
  }
}
