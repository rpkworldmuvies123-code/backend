import { Router } from 'express';
import mongoose from 'mongoose';
import User from '../models/User.js';
import AdminAudit from '../models/AdminAudit.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { isDatabaseReady } from '../config/db.js';

const router = Router();
router.use(requireAuth, requireAdmin);

function requireDB(req, res, next) {
  if (!isDatabaseReady()) return res.status(503).json({ error: 'Database is not connected' });
  next();
}
router.use(requireDB);

router.get('/overview', async (_req, res, next) => {
  try {
    const [totalUsers, activeUsers, suspendedUsers, adminUsers, audits] = await Promise.all([
      User.countDocuments({}),
      User.countDocuments({ status: { $ne: 'suspended' } }),
      User.countDocuments({ status: 'suspended' }),
      User.countDocuments({ role: 'admin' }),
      AdminAudit.countDocuments({})
    ]);
    res.json({
      users: { total: totalUsers, active: activeUsers, suspended: suspendedUsers, admins: adminUsers },
      auditEvents: audits,
      trading: { provider: process.env.BROKER_PROVIDER || 'none', liveTradingEnabled: false },
      payments: { provider: 'none', liveDepositsEnabled: false, liveWithdrawalsEnabled: false }
    });
  } catch (error) { next(error); }
});

router.get('/users', async (req, res, next) => {
  try {
    const page = Math.max(1, Math.min(100000, Number.parseInt(req.query.page || '1', 10) || 1));
    const limit = Math.max(1, Math.min(100, Number.parseInt(req.query.limit || '25', 10) || 25));
    const filter = {};
    if (req.query.status === 'active') filter.status = { $ne: 'suspended' };
    else if (req.query.status === 'suspended') filter.status = 'suspended';
    if (typeof req.query.search === 'string' && req.query.search.trim()) {
      const escaped = req.query.search.trim().slice(0, 120).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.email = { $regex: escaped, $options: 'i' };
    }
    const [users, total] = await Promise.all([
      User.find(filter).select('_id email role status createdAt').sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
      User.countDocuments(filter)
    ]);
    res.json({ users: users.map(u => ({ id: String(u._id), email: u.email, role: u.role, status: u.status || 'active', createdAt: u.createdAt })), page, limit, total });
  } catch (error) { next(error); }
});

router.patch('/users/:id/status', async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ error: 'Invalid user id' });
    const status = req.body?.status;
    if (!['active', 'suspended'].includes(status)) return res.status(400).json({ error: 'status must be active or suspended' });
    if (String(req.user.id) === req.params.id && status === 'suspended') return res.status(400).json({ error: 'You cannot suspend your own admin account' });
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    user.status = status;
    await user.save();
    await AdminAudit.create({ actorId: req.user.id, action: 'user.status.changed', targetId: String(user._id), details: { email: user.email, status } });
    res.json({ user: { id: String(user._id), email: user.email, role: user.role, status: user.status } });
  } catch (error) { next(error); }
});

router.get('/audit', async (req, res, next) => {
  try {
    const limit = Math.max(1, Math.min(100, Number.parseInt(req.query.limit || '50', 10) || 50));
    const events = await AdminAudit.find({}).sort({ createdAt: -1 }).limit(limit).populate('actorId', 'email').lean();
    res.json({ events: events.map(e => ({ id: String(e._id), actor: e.actorId?.email || 'Unknown', action: e.action, targetId: e.targetId, details: e.details, createdAt: e.createdAt })) });
  } catch (error) { next(error); }
});

export default router;
