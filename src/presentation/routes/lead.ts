import { Router } from 'express';
import type { LeadController } from '../controllers/index';
import { createRateLimitMiddleware } from '../middleware/rateLimitMiddleware';

export function createPublicLeadRoutes(controller: LeadController): Router {
  const router = Router();
  const publicLeadRateLimit = createRateLimitMiddleware({
    windowMs: Number(process.env.LEAD_RATE_LIMIT_WINDOW_MS || 60_000),
    maxRequests: Number(process.env.LEAD_RATE_LIMIT_MAX_REQUESTS || 10),
  });

  router.post('/', publicLeadRateLimit, (req, res) => controller.create(req, res));

  return router;
}

export function createLeadRoutes(controller: LeadController): Router {
  const router = Router();

  router.get('/', (req, res) => controller.list(req, res));
  router.get('/get-leads', (req, res) => controller.getLeads(req, res));
  router.get('/:id', (req, res) => controller.getById(req, res));
  router.put('/:id', (req, res) => controller.update(req, res));
  router.delete('/:id', (req, res) => controller.delete(req, res));

  return router;
}

