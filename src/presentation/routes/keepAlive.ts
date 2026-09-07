import { Router, type Request, type Response } from 'express';
import { getSupabase } from '../../infrastructure/config';

export function createKeepAliveRoutes(): Router {
  const router = Router();

  router.get('/keep-alive', async (req: Request, res: Response) => {
    const expected = process.env.CRON_SECRET;
    const header = req.header('authorization') ?? '';
    const token = header.toLowerCase().startsWith('bearer ') ? header.slice(7).trim() : '';
    if (!expected || token !== expected) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    try {
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from('leads')
        .select('id')
        .limit(1);

      if (error) {
        console.error('[keep-alive] Supabase error:', error.message);
        res.status(500).json({
          success: false,
          status: 'error',
          message: error.message,
          timestamp: new Date().toISOString(),
        });
        return;
      }

      console.log('[keep-alive] OK, rows:', data?.length ?? 0);
      res.json({
        success: true,
        status: 'ok',
        timestamp: new Date().toISOString(),
        rows: data?.length ?? 0,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      console.error('[keep-alive] Failure:', message);
      res.status(500).json({
        success: false,
        status: 'error',
        message,
        timestamp: new Date().toISOString(),
      });
    }
  });

  return router;
}
