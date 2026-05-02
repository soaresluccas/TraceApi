import type { Request, Response } from 'express';
import type { ILeadRepository } from '../../domain/interfaces/index';
import {
  CreateLeadUseCase,
  GetLeadByIdUseCase,
  ListLeadsUseCase,
  UpdateLeadUseCase,
  DeleteLeadUseCase,
} from '../../application/index';

export class LeadController {
  private createLeadUseCase: CreateLeadUseCase;
  private getLeadByIdUseCase: GetLeadByIdUseCase;
  private listLeadsUseCase: ListLeadsUseCase;
  private updateLeadUseCase: UpdateLeadUseCase;
  private deleteLeadUseCase: DeleteLeadUseCase;

  constructor(leadRepository: ILeadRepository) {
    this.createLeadUseCase = new CreateLeadUseCase(leadRepository);
    this.getLeadByIdUseCase = new GetLeadByIdUseCase(leadRepository);
    this.listLeadsUseCase = new ListLeadsUseCase(leadRepository);
    this.updateLeadUseCase = new UpdateLeadUseCase(leadRepository);
    this.deleteLeadUseCase = new DeleteLeadUseCase(leadRepository);
  }

  async create(req: Request, res: Response): Promise<void> {
    try {
      const lead = await this.createLeadUseCase.execute(req.body);
      res.status(201).json({
        success: true,
        message: 'Lead criado com sucesso',
        data: lead.toPrimitive(),
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao criar lead';
      res.status(400).json({
        success: false,
        message,
      });
    }
  }

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const lead = await this.getLeadByIdUseCase.execute(id);

      if (!lead) {
        res.status(404).json({
          success: false,
          message: 'Lead não encontrado',
        });
        return;
      }

      res.json({
        success: true,
        data: lead.toPrimitive(),
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao buscar lead';
      res.status(500).json({
        success: false,
        message,
      });
    }
  }

  async list(req: Request, res: Response): Promise<void> {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;

      const result = await this.listLeadsUseCase.execute({ limit, offset });

      res.json({
        success: true,
        data: result.data.map((lead) => lead.toPrimitive()),
        pagination: {
          total: result.total,
          limit: result.limit,
          offset: result.offset,
          pages: Math.ceil(result.total / result.limit),
        },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao listar leads';
      res.status(500).json({
        success: false,
        message,
      });
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const lead = await this.updateLeadUseCase.execute(id, req.body);

      if (!lead) {
        res.status(404).json({
          success: false,
          message: 'Lead não encontrado',
        });
        return;
      }

      res.json({
        success: true,
        message: 'Lead atualizado com sucesso',
        data: lead.toPrimitive(),
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao atualizar lead';
      res.status(400).json({
        success: false,
        message,
      });
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const success = await this.deleteLeadUseCase.execute(id);

      if (!success) {
        res.status(404).json({
          success: false,
          message: 'Lead não encontrado',
        });
        return;
      }

      res.json({
        success: true,
        message: 'Lead deletado com sucesso',
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao deletar lead';
      res.status(500).json({
        success: false,
        message,
      });
    }
  }
}

