import type { ICrmRepository, BoardStage } from '../../../domain/interfaces/index';

export class GetBoardUseCase {
  constructor(private readonly crmRepository: ICrmRepository) {}

  async execute(): Promise<BoardStage[]> {
    return this.crmRepository.getBoard();
  }
}
