import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';

const app = express();
app.disable('x-powered-by');
app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(',').map(s => s.trim()) : false }));
app.use(express.json({ limit: '32kb' }));
app.use('/api/', rateLimit({ windowMs: 60_000, limit: 100, standardHeaders: true, legacyHeaders: false }));

app.get('/api/health', (_req, res) => res.json({ ok: true, service: 'cricket-platform-api', database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' }));

app.get('/api/cricket/live', async (_req, res) => {
  const key = process.env.CRICKET_API_KEY;
  const base = process.env.CRICKET_API_BASE_URL;
  if (!key || !base) return res.status(503).json({ error: 'Live cricket feed is not configured. Add an authorized provider API key in server environment.' });
  try {
    const response = await fetch(new URL('/v1/live?state=live', base), { headers: { Authorization: `Bearer ${key}`, 'X-API-Key': key }, signal: AbortSignal.timeout(8000) });
    if (!response.ok) return res.status(502).json({ error: 'Cricket provider request failed', providerStatus: response.status });
    const data = await response.json();
    res.set('Cache-Control', 'public, max-age=20');
    res.json({ source: 'configured-provider', fetchedAt: new Date().toISOString(), data });
  } catch {
    res.status(502).json({ error: 'Could not retrieve live cricket data right now.' });
  }
});

app.get('/api/wallet', (_req, res) => res.status(401).json({ error: 'Authentication is not configured. Enable Firebase phone authentication and verify ID tokens before exposing wallet data.' }));
app.post('/api/wallet/deposit-intent', (_req, res) => res.status(501).json({ error: 'Payments are disabled until an approved payment provider and server-side verified settlement flow are configured.' }));
app.post('/api/wallet/withdrawal-requests', (_req, res) => res.status(501).json({ error: 'Withdrawals are disabled until verified identity, payment rails, fraud controls, and compliance review are complete.' }));
app.use((err, _req, res, _next) => { console.error(err); res.status(500).json({ error: 'Internal server error' }); });

const port = Number(process.env.PORT || 5000);
if (process.env.MONGODB_URI) {
  mongoose.connect(process.env.MONGODB_URI).then(() => app.listen(port, () => console.log(`API listening on ${port}`))).catch(err => { console.error('MongoDB connection failed:', err.message); process.exit(1); });
} else {
  app.listen(port, () => console.log(`API listening on ${port}; MongoDB is not configured`));
}
