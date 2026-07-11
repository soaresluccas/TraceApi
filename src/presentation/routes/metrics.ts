import { Router } from 'express';
import type { MetricsController } from '../controllers/index';

export function createMetricsRoutes(controller: MetricsController): Router {
  const router = Router();

  router.get('/monthly', (req, res) => controller.getMonthlyMetrics(req, res));
  router.get('/control/:month', (req, res) => controller.getMonthlyControl(req, res));
  router.post('/recalculate/:month', (req, res) => controller.recalculateMonthlyMetrics(req, res));
  router.get('/investimento/:month', (req, res) => controller.getInvestimentoMensal(req, res));
  router.post('/investimento', (req, res) => controller.upsertInvestimentoMensal(req, res));

  return router;
}
