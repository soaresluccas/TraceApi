import express, { type Express, type Request, type Response } from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './docs/swagger';
import { initSupabase } from './infrastructure/config';
import { LeadRepository } from './infrastructure/repositories';
import { LeadController } from './presentation/controllers';
import { createLeadRoutes } from './presentation/routes';

const app: Express = express();

const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.use(express.json());

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.get('/', (_req: Request, res: Response) => {
  res.json({
    message: 'Trace Company API - Lead Capture',
    version: '1.0.0',
    docs: '/api-docs',
  });
});

const supabase = initSupabase();
const leadRepository = new LeadRepository(supabase);
const leadController = new LeadController(leadRepository);
const leadRoutes = createLeadRoutes(leadController);

app.use('/api/leads', leadRoutes);

app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: 'Rota não encontrada',
  });
});

export default app;

