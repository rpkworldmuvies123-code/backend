import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import marketRoutes from './routes/market.js';
import authRoutes from './routes/auth.js';
import accountRoutes from './routes/account.js';
import orderRoutes from './routes/orders.js';
import adminRoutes from './routes/admin.js';
import { errorHandler, notFound } from './middleware/errors.js';

export function createApp() {
  const app = express();
  app.disable('x-powered-by');
  app.use(helmet());
  const allowed = (process.env.FRONTEND_URL || 'http://localhost:5173').split(',').map(s => s.trim()).filter(Boolean);
  app.use(cors({ origin(origin, callback) {
    if (!origin || allowed.includes(origin)) return callback(null, true);
    return callback(new Error('Origin not allowed by CORS'));
  }, credentials: false }));
  app.use(express.json({ limit: '20kb' }));
  app.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 300, standardHeaders: 'draft-7', legacyHeaders: false }));
  app.get('/api/health', (_req, res) => res.json({ ok: true, service: 'bharattrade-backend', mode: process.env.NODE_ENV || 'development', brokerConfigured: Boolean(process.env.BROKER_PROVIDER && process.env.BROKER_PROVIDER !== 'none') }));
  app.use('/api/market', marketRoutes);
  app.use('/api/auth', authRoutes);
  app.use('/api/account', accountRoutes);
  app.use('/api/orders', orderRoutes);
  app.use('/api/admin', adminRoutes);
  app.use(notFound);
  app.use(errorHandler);
  return app;
}
