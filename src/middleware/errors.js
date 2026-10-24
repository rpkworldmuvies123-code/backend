export function notFound(req, res) {
  res.status(404).json({ error: 'Route not found', path: req.path });
}
export function errorHandler(err, _req, res, _next) {
  if (res.headersSent) return;
  if (err?.message === 'Origin not allowed by CORS') return res.status(403).json({ error: 'Origin not allowed' });
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
}
