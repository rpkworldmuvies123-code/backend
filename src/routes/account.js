import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { getBroker } from '../services/broker/index.js';

const router = Router();
router.use(requireAuth);
router.get('/profile', async (req, res) => {
  const broker = getBroker();
  if (!broker.isConfigured()) return res.status(503).json({ error: 'Broker integration is not configured', nextStep: 'Configure a supported broker adapter on the server.' });
  try { res.json(await broker.getProfile(req.user)); } catch { res.status(502).json({ error: 'Broker profile request failed' }); }
});
router.get('/holdings', async (req, res) => {
  const broker = getBroker();
  if (!broker.isConfigured()) return res.status(503).json({ error: 'Broker integration is not configured', holdings: [] });
  try { res.json({ holdings: await broker.getHoldings(req.user) }); } catch { res.status(502).json({ error: 'Broker holdings request failed' }); }
});
export default router;
