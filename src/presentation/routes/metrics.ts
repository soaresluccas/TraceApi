import { Router } from 'express';
import type { MetricsController } from '../controllers/index';

export function createMetricsRoutes(controller: MetricsController): Router {
  const router = Router();

  router.get('/monthly', (req, res) => controller.getMonthlyMetrics(req, res));
  router.get('/lead-control', (req, res) => controller.listLeadControlMensal(req, res));
  router.patch('/lead-control/:leadId', (req, res) => controller.updateLeadControlMensal(req, res));

  return router;
}
