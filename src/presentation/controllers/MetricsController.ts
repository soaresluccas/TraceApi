import type { Request, Response } from 'express';
import type { IMetricsRepository } from '../../domain/interfaces/index';
import { GetMonthlyMetricsUseCase, GetMonthlyControlUseCase, RecalculateMonthlyMetricsUseCase, UpsertInvestimentoMensalUseCase, GetInvestimentoMensalUseCase } from '../../application/index';

export class MetricsController {
  private getMonthlyMetricsUseCase: GetMonthlyMetricsUseCase;
  private getMonthlyControlUseCase: GetMonthlyControlUseCase;
  private recalculateMonthlyMetricsUseCase: RecalculateMonthlyMetricsUseCase;
  private upsertInvestimentoMensalUseCase: UpsertInvestimentoMensalUseCase;
  private getInvestimentoMensalUseCase: GetInvestimentoMensalUseCase;

  constructor(metricsRepository: IMetricsRepository) {
    this.getMonthlyMetricsUseCase = new GetMonthlyMetricsUseCase(metricsRepository);
    this.getMonthlyControlUseCase = new GetMonthlyControlUseCase(metricsRepository);
    this.recalculateMonthlyMetricsUseCase = new RecalculateMonthlyMetricsUseCase(metricsRepository);
    this.upsertInvestimentoMensalUseCase = new UpsertInvestimentoMensalUseCase(metricsRepository);
    this.getInvestimentoMensalUseCase = new GetInvestimentoMensalUseCase(metricsRepository);
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

  async getMonthlyControl(req: Request, res: Response): Promise<void> {
    try {
      const { month } = req.params;
      const data = await this.getMonthlyControlUseCase.execute(month);

      if (!data) {
        res.status(404).json({
          success: false,
          message: 'Nenhum controle mensal encontrado para o mês informado',
        });
        return;
      }

      res.json({
        success: true,
        data,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao buscar controle mensal';
      res.status(400).json({
        success: false,
        message,
      });
    }
  }

  async recalculateMonthlyMetrics(req: Request, res: Response): Promise<void> {
    try {
      const { month } = req.params;
      const result = await this.recalculateMonthlyMetricsUseCase.execute(month);

      if (!result) {
        res.status(404).json({
          success: false,
          message: 'Nenhum lead encontrado para o mês informado',
        });
        return;
      }

      res.json({
        success: true,
        message: 'Métricas recalculadas com sucesso',
        data: result,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao recalcular métricas mensais';
      res.status(400).json({
        success: false,
        message,
      });
    }
  }

  async upsertInvestimentoMensal(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.upsertInvestimentoMensalUseCase.execute(req.body);

      if (!result) {
        res.status(400).json({
          success: false,
          message: 'Falha ao salvar investimento mensal',
        });
        return;
      }

      res.json({
        success: true,
        message: 'Investimento mensal salvo com sucesso',
        data: result,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao salvar investimento mensal';
      res.status(400).json({
        success: false,
        message,
      });
    }
  }

  async getInvestimentoMensal(req: Request, res: Response): Promise<void> {
    try {
      const { month } = req.params;
      const result = await this.getInvestimentoMensalUseCase.execute(month);

      if (!result) {
        res.status(404).json({
          success: false,
          message: 'Nenhum investimento encontrado para o mês informado',
        });
        return;
      }

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao buscar investimento mensal';
      res.status(400).json({
        success: false,
        message,
      });
    }
  }
}
