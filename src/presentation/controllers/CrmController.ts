import type { Request, Response } from 'express';
import type { ICrmRepository } from '../../domain/interfaces/index';
import {
  CreateCardUseCase,
  MoveCardUseCase,
  ReorderCardUseCase,
  UpdateCardUseCase,
  DeleteCardUseCase,
  ListStagesUseCase,
  GetBoardUseCase,
  GetCardUseCase,
  GetCardHistoryUseCase,
  GetFunnelMetricsUseCase,
  GetTempoMedioUseCase,
} from '../../application/index';

interface SupabaseError {
  code?: string;
  message?: string;
}

function mapPostgresError(error: unknown): { status: number; message: string } {
  const supabaseError = error as SupabaseError;
  const code = supabaseError?.code;

  switch (code) {
    case '23505':
      return { status: 409, message: 'Lead já possui um card no CRM' };
    case '23503':
      return { status: 400, message: 'Referência inválida (stage_id ou lead_id não existe)' };
    case '23514':
      return { status: 400, message: 'Valor inválido para priority' };
    case 'PGRST116':
      return { status: 404, message: 'Card não encontrado' };
    default:
      return {
        status: 500,
        message: error instanceof Error ? error.message : 'Erro inesperado',
      };
  }
}

export class CrmController {
  private createCardUseCase: CreateCardUseCase;
  private moveCardUseCase: MoveCardUseCase;
  private reorderCardUseCase: ReorderCardUseCase;
  private updateCardUseCase: UpdateCardUseCase;
  private deleteCardUseCase: DeleteCardUseCase;
  private listStagesUseCase: ListStagesUseCase;
  private getBoardUseCase: GetBoardUseCase;
  private getCardUseCase: GetCardUseCase;
  private getCardHistoryUseCase: GetCardHistoryUseCase;
  private getFunnelMetricsUseCase: GetFunnelMetricsUseCase;
  private getTempoMedioUseCase: GetTempoMedioUseCase;

  constructor(crmRepository: ICrmRepository) {
    this.createCardUseCase = new CreateCardUseCase(crmRepository);
    this.moveCardUseCase = new MoveCardUseCase(crmRepository);
    this.reorderCardUseCase = new ReorderCardUseCase(crmRepository);
    this.updateCardUseCase = new UpdateCardUseCase(crmRepository);
    this.deleteCardUseCase = new DeleteCardUseCase(crmRepository);
    this.listStagesUseCase = new ListStagesUseCase(crmRepository);
    this.getBoardUseCase = new GetBoardUseCase(crmRepository);
    this.getCardUseCase = new GetCardUseCase(crmRepository);
    this.getCardHistoryUseCase = new GetCardHistoryUseCase(crmRepository);
    this.getFunnelMetricsUseCase = new GetFunnelMetricsUseCase(crmRepository);
    this.getTempoMedioUseCase = new GetTempoMedioUseCase(crmRepository);
  }

  async listStages(_req: Request, res: Response): Promise<void> {
    try {
      const stages = await this.listStagesUseCase.execute();
      res.json({ success: true, data: stages.map((s) => s.toPrimitive()) });
    } catch (error) {
      const { status, message } = mapPostgresError(error);
      res.status(status).json({ success: false, message });
    }
  }

  async getBoard(_req: Request, res: Response): Promise<void> {
    try {
      const board = await this.getBoardUseCase.execute();
      res.json({ success: true, data: board });
    } catch (error) {
      const { status, message } = mapPostgresError(error);
      res.status(status).json({ success: false, message });
    }
  }

  async createCard(req: Request, res: Response): Promise<void> {
    try {
      const { lead_id, stage_id, priority } = req.body;
      const card = await this.createCardUseCase.execute({ lead_id, stage_id, priority });
      res.status(201).json({ success: true, data: card.toPrimitive() });
    } catch (error) {
      const { status, message } = mapPostgresError(error);
      res.status(status).json({ success: false, message });
    }
  }

  async moveCard(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { stage_id, position } = req.body;
      const card = await this.moveCardUseCase.execute({ card_id: id, stage_id, position });
      res.json({ success: true, data: card.toPrimitive() });
    } catch (error) {
      const { status, message } = mapPostgresError(error);
      res.status(status).json({ success: false, message });
    }
  }

  async reorderCards(req: Request, res: Response): Promise<void> {
    try {
      const { stage_id, card_id, new_position } = req.body;
      const cards = await this.reorderCardUseCase.execute({ stage_id, card_id, new_position });
      res.json({ success: true, data: cards.map((c) => c.toPrimitive()) });
    } catch (error) {
      const { status, message } = mapPostgresError(error);
      res.status(status).json({ success: false, message });
    }
  }

  async updateCard(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { priority, assigned_to } = req.body;
      const card = await this.updateCardUseCase.execute({ card_id: id, priority, assigned_to });

      if (!card) {
        res.status(404).json({ success: false, message: 'Card não encontrado' });
        return;
      }

      res.json({ success: true, data: card.toPrimitive() });
    } catch (error) {
      const { status, message } = mapPostgresError(error);
      res.status(status).json({ success: false, message });
    }
  }

  async getCard(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const card = await this.getCardUseCase.execute(id);

      if (!card) {
        res.status(404).json({ success: false, message: 'Card não encontrado' });
        return;
      }

      res.json({ success: true, data: card });
    } catch (error) {
      const { status, message } = mapPostgresError(error);
      res.status(status).json({ success: false, message });
    }
  }

  async getCardHistory(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const history = await this.getCardHistoryUseCase.execute(id);
      res.json({ success: true, data: history });
    } catch (error) {
      const { status, message } = mapPostgresError(error);
      res.status(status).json({ success: false, message });
    }
  }

  async deleteCard(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const success = await this.deleteCardUseCase.execute(id);

      if (!success) {
        res.status(404).json({ success: false, message: 'Card não encontrado' });
        return;
      }

      res.json({ success: true, message: 'Card removido com sucesso' });
    } catch (error) {
      const { status, message } = mapPostgresError(error);
      res.status(status).json({ success: false, message });
    }
  }

  async getFunnelMetrics(_req: Request, res: Response): Promise<void> {
    try {
      const metrics = await this.getFunnelMetricsUseCase.execute();
      res.json({ success: true, data: metrics });
    } catch (error) {
      const { status, message } = mapPostgresError(error);
      res.status(status).json({ success: false, message });
    }
  }

  async getTempoMedio(_req: Request, res: Response): Promise<void> {
    try {
      const metrics = await this.getTempoMedioUseCase.execute();
      res.json({ success: true, data: metrics });
    } catch (error) {
      const { status, message } = mapPostgresError(error);
      res.status(status).json({ success: false, message });
    }
  }
}
