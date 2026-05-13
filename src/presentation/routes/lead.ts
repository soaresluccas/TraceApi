import { Router } from 'express';
import type { LeadController } from '../controllers/index';

export function createLeadRoutes(controller: LeadController): Router {
  const router = Router();

  router.post('/', (req, res) => controller.create(req, res));
  router.get('/', (req, res) => controller.list(req, res));
  router.get('/get-leads', (req, res) => controller.getLeads(req, res));
  router.get('/:id', (req, res) => controller.getById(req, res));
  router.put('/:id', (req, res) => controller.update(req, res));
  router.delete('/:id', (req, res) => controller.delete(req, res));

  return router;
}

