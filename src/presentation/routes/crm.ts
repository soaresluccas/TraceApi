import { Router } from 'express';
import type { CrmController } from '../controllers/index';

export function createCrmRoutes(controller: CrmController): Router {
  const router = Router();

  router.get('/stages', (req, res) => controller.listStages(req, res));
  router.get('/board', (req, res) => controller.getBoard(req, res));
  router.post('/cards', (req, res) => controller.createCard(req, res));
  router.patch('/cards/reorder', (req, res) => controller.reorderCards(req, res));
  router.patch('/cards/:id/move', (req, res) => controller.moveCard(req, res));
  router.patch('/cards/:id', (req, res) => controller.updateCard(req, res));
  router.get('/cards/:id/history', (req, res) => controller.getCardHistory(req, res));
  router.get('/cards/:id', (req, res) => controller.getCard(req, res));
  router.delete('/cards/:id', (req, res) => controller.deleteCard(req, res));
  router.get('/metrics/funnel', (req, res) => controller.getFunnelMetrics(req, res));
  router.get('/metrics/tempo-medio', (req, res) => controller.getTempoMedio(req, res));

  return router;
}
