import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import User from '../models/User.js';
import { isDatabaseReady } from '../config/db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
const credentials = z.object({
  email: z.string().trim().email().max(254).transform(v => v.toLowerCase()),
  password: z.string().min(10).max(128)
});
function jwtReady() { return Boolean(process.env.JWT_SECRET && process.env.JWT_SECRET.length >= 32); }
function issueToken(user) {
  return jwt.sign({ role: user.role }, process.env.JWT_SECRET, { subject: user.id, expiresIn: process.env.JWT_EXPIRES_IN || '15m', algorithm: 'HS256' });
}
router.post('/register', async (req, res, next) => {
  try {
    if (!isDatabaseReady()) return res.status(503).json({ error: 'Database is not connected' });
    if (!jwtReady()) return res.status(503).json({ error: 'JWT_SECRET must be at least 32 characters' });
    const parsed = credentials.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: 'Valid email and password (10–128 characters) required' });
    const existing = await User.findOne({ email: parsed.data.email });
    if (existing) return res.status(409).json({ error: 'Account already exists' });
    const passwordHash = await bcrypt.hash(parsed.data.password, 12);
    // Public registration must never be allowed to self-assign privileged roles.
    const user = await User.create({ email: parsed.data.email, passwordHash, role: 'user', status: 'active' });
    res.status(201).json({ token: issueToken(user), user: { id: user.id, email: user.email, role: user.role } });
  } catch (error) { next(error); }
});
router.post('/login', async (req, res, next) => {
  try {
    if (!isDatabaseReady()) return res.status(503).json({ error: 'Database is not connected' });
    if (!jwtReady()) return res.status(503).json({ error: 'JWT_SECRET must be at least 32 characters' });
    const parsed = credentials.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: 'Valid email and password required' });
    const user = await User.findOne({ email: parsed.data.email }).select('+passwordHash');
    if (!user || !(await bcrypt.compare(parsed.data.password, user.passwordHash))) return res.status(401).json({ error: 'Invalid email or password' });
    if (user.status === 'suspended') return res.status(403).json({ error: 'This account is suspended. Contact support.' });
    res.json({ token: issueToken(user), user: { id: user.id, email: user.email, role: user.role } });
  } catch (error) { next(error); }
});
router.get('/me', requireAuth, async (req, res, next) => {
  try {
    if (!isDatabaseReady()) return res.status(503).json({ error: 'Database is not connected' });
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user: { id: user.id, email: user.email, role: user.role, status: user.status || 'active' } });
  } catch (error) { next(error); }
});
export default router;
