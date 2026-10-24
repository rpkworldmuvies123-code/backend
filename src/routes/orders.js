import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth.js';
import { getBroker } from '../services/broker/index.js';

const router = Router();
router.use(requireAuth);
const orderSchema = z.object({
  symbol: z.string().trim().min(1).max(30),
  side: z.enum(['BUY', 'SELL']),
  quantity: z.number().int().positive().max(100000),
  orderType: z.enum(['MARKET', 'LIMIT']),
  price: z.number().positive().optional(),
  product: z.enum(['CNC', 'MIS', 'NRML']).optional()
}).superRefine((order, ctx) => {
  if (order.orderType === 'LIMIT' && !order.price) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Limit orders require a price', path: ['price'] });
});
router.get('/', async (req, res) => {
  const broker = getBroker();
  if (!broker.isConfigured()) return res.json({ provider: 'none', liveTradingEnabled: false, orders: [] });
  try { res.json({ orders: await broker.getOrders(req.user) }); } catch { res.status(502).json({ error: 'Unable to retrieve broker orders' }); }
});
router.post('/', async (req, res) => {
  const parsed = orderSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid order payload', details: parsed.error.issues.map(i => ({ field: i.path.join('.'), message: i.message })) });
  const broker = getBroker();
  // Fail closed until a real broker adapter and risk controls are implemented and independently tested.
  if (!broker.isConfigured()) return res.status(503).json({
    error: 'Live order placement is disabled',
    reason: 'No broker adapter is configured. No order was sent.',
    required: ['Choose a supported broker', 'Implement official OAuth/token handling', 'Add instrument validation, risk limits and idempotency', 'Test in broker sandbox/paper environment', 'Complete compliance and production review']
  });
  return res.status(501).json({ error: 'Order submission adapter is not implemented; no order was sent.' });
});
export default router;
