import type { Request, Response } from 'express';
import type { IMetricsRepository } from '../../domain/interfaces/index';
import { GetMonthlyMetricsUseCase, ListLeadControlMensalUseCase, UpdateLeadControlMensalUseCase } from '../../application/index';

export class MetricsController {
  private getMonthlyMetricsUseCase: GetMonthlyMetricsUseCase;
  private listLeadControlMensalUseCase: ListLeadControlMensalUseCase;
  private updateLeadControlMensalUseCase: UpdateLeadControlMensalUseCase;

  constructor(metricsRepository: IMetricsRepository) {
    this.getMonthlyMetricsUseCase = new GetMonthlyMetricsUseCase(metricsRepository);
    this.listLeadControlMensalUseCase = new ListLeadControlMensalUseCase(metricsRepository);
    this.updateLeadControlMensalUseCase = new UpdateLeadControlMensalUseCase(metricsRepository);
  }

  async getMonthlyMetrics(req: Request, res: Response): Promise<void> {
    try {
      const month = req.query.month as string;
      const metrics = await this.getMonthlyMetricsUseCase.execute(month);

      if (!metrics) {
        res.status(404).json({
          success: false,
          message: 'Nenhuma métrica encontrada para o mês informado',
        });
        return;
      }

      res.json({
        success: true,
        data: metrics,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao buscar métricas mensais';
      res.status(400).json({
        success: false,
        message,
      });
    }
  }

  async listLeadControlMensal(req: Request, res: Response): Promise<void> {
    try {
      const month = req.query.month as string;
      const data = await this.listLeadControlMensalUseCase.execute(month);

      res.json({
        success: true,
        data,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao listar controle mensal de leads';
      res.status(400).json({
        success: false,
        message,
      });
    }
  }

  async updateLeadControlMensal(req: Request, res: Response): Promise<void> {
    try {
      const { leadId } = req.params;
      const result = await this.updateLeadControlMensalUseCase.execute(leadId, req.body);

      if (!result) {
        res.status(404).json({
          success: false,
          message: 'Lead não encontrado',
        });
        return;
      }

      res.json({
        success: true,
        message: 'Controle mensal atualizado com sucesso',
        data: result,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao atualizar controle mensal';
      res.status(400).json({
        success: false,
        message,
      });
    }
  }
}
