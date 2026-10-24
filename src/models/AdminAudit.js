import mongoose from 'mongoose';

const adminAuditSchema = new mongoose.Schema({
  actorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  action: { type: String, required: true, maxlength: 80 },
  targetId: { type: String, default: '' },
  details: { type: mongoose.Schema.Types.Mixed, default: {} },
  createdAt: { type: Date, default: Date.now, index: true }
}, { versionKey: false });

export default mongoose.models.AdminAudit || mongoose.model('AdminAudit', adminAuditSchema);
