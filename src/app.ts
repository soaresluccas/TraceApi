import express, { type Express, type Request, type Response } from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './docs/swagger';
import { initSupabase } from './infrastructure/config';
import { LeadRepository, UserRepository } from './infrastructure/repositories';
import { BrevoLeadNotificationService } from './infrastructure/services';
import { LeadController, AuthController } from './presentation/controllers';
import { createLeadRoutes, createPublicLeadRoutes, createAuthRoutes } from './presentation/routes';
import { authMiddleware } from './presentation/middleware/authMiddleware';

const app: Express = express();
app.set('trust proxy', 1);

const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())
  : ['*'];

const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    if (!origin || allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '16kb' }));

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
const userRepository = new UserRepository();
const leadNotificationService = new BrevoLeadNotificationService();
const leadController = new LeadController(leadRepository, leadNotificationService);
const authController = new AuthController(userRepository);
const publicLeadRoutes = createPublicLeadRoutes(leadController);
const leadRoutes = createLeadRoutes(leadController);
const authRoutes = createAuthRoutes(authController);

app.use('/api/auth', authRoutes);
app.use('/api/leads', publicLeadRoutes);
app.use('/api/leads', authMiddleware, leadRoutes);

app.use((_req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'Endpoint não existe',
  });
});

export default app;

