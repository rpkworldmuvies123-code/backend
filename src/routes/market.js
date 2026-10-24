import { Router } from 'express';
import { getQuotes, getQuote } from '../services/marketData.js';

const router = Router();
router.get('/quotes', async (_req, res, next) => {
  try {
    const data = await getQuotes();
    res.json({ ...data, message: data.isLive ? 'Live quotes' : 'Illustrative demo quotes; not real-time market data' });
  } catch (error) { next(error); }
});
router.get('/quotes/:symbol', async (req, res, next) => {
  try {
    const quote = await getQuote(req.params.symbol);
    if (!quote) return res.status(404).json({ error: 'Symbol not found' });
    res.json({ provider: process.env.BROKER_PROVIDER || 'demo', isLive: false, quote });
  } catch (error) { next(error); }
});
router.get('/indices', (_req, res) => res.json({
  provider: 'demo', isLive: false,
  indices: [
    { symbol: 'NIFTY 50', value: 24854.05, changePercent: 0.72 },
    { symbol: 'SENSEX', value: 81745.62, changePercent: 0.58 },
    { symbol: 'NIFTY BANK', value: 56102.8, changePercent: 0.41 }
  ]
}));
export default router;
