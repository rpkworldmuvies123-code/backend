# BharatTrade Backend

Node.js + Express API starter with MongoDB-backed registration/login, short-lived JWTs, input validation, Helmet, CORS allow-list, rate limiting, market-data demo fallback, and a broker adapter boundary.

## Local setup
1. Install Node.js 20+.
2. Copy `.env.example` to `.env` and set `MONGODB_URI`, `JWT_SECRET` (random, at least 32 characters), and `FRONTEND_URL`.
3. Run `npm install`, then `npm run dev`.
4. The server connects to MongoDB at startup when `MONGODB_URI` is configured. Check `GET http://localhost:5000/api/health`.

## Render setup
- Root directory: `backend` (if the monorepo contains both folders).
- Build command: `npm install`
- Start command: `npm start`
- Add environment variables from `.env.example` in Render's Environment panel.
- Set `FRONTEND_URL` to your exact deployed frontend origin. Do not include a trailing slash.
- Use a dedicated production MongoDB database and strong unique secrets. Never commit `.env`.

## API
- `GET /api/health`
- `GET /api/market/quotes` (demo values until a provider adapter is implemented)
- `GET /api/market/quotes/:symbol`
- `GET /api/market/indices` (illustrative values only)
- `POST /api/auth/register` `{ "email": "...", "password": "minimum 10 characters" }`
- `POST /api/auth/login` same payload
- `GET /api/auth/me` with `Authorization: Bearer <token>`
- `GET /api/account/profile` (authenticated; requires broker adapter)
- `GET /api/account/holdings` (authenticated; requires broker adapter)
- `GET /api/orders` (authenticated; returns empty list while broker is not configured)
- `POST /api/orders` (authenticated; validates payload but intentionally refuses live order placement until a production broker adapter exists)

## Live broker integration — important
No broker credentials were supplied, and this repository does **not** claim to support live trading yet. `src/services/broker/index.js` is a fail-closed adapter stub. Select a broker (e.g. one available to your Indian account) and implement its official API/OAuth flow using that broker's current documentation. Do not put API secrets in frontend environment variables or expose access tokens to browsers. Never accept a client-supplied broker access token as trusted input.

Before enabling live orders, implement and test: authorization/code exchange and token refresh where supported, server-side secret storage, official instrument/token mapping, quote source provenance and timestamps, order idempotency, pre-trade balance/quantity/price checks, market-hours and product validation, risk limits, audit logs, webhook signature verification, token revocation, and clear error handling. Use sandbox/paper testing where the broker offers it. Have a qualified reviewer check applicable SEBI/exchange/broker requirements before production use.

## Security notes
- JWT secret must be at least 32 characters. Current token lifetime defaults to 15 minutes.
- Passwords hashed with bcrypt cost 12.
- Registration does not grant admin privileges.
- CORS uses an explicit frontend origin allow-list.
- Add HTTPS, monitoring, backups, secrets rotation, login-specific rate limits, and a reviewed refresh/session strategy before public launch.
