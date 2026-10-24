# Cricket Platform Backend

Node.js + Express + MongoDB starter for a cricket live-score website.

## Features in this starter
- Protected API structure and health endpoint
- Phone sign-in integration planned through Firebase Authentication (SMS OTP + reCAPTCHA)
- Cricket live feed adapter via an authorized cricket data provider
- Wallet ledger design notes: no client-side balance mutation; use idempotent, audited server-side transactions
- Admin API planning and deployment checklist

## Setup
1. Copy `.env.example` to `.env` and fill the required values.
2. Install Node.js 20+ and run `npm install`.
3. Run `npm start`.

## Important integrations still required
- Configure Firebase project, enable phone sign-in, and add authorized domains.
- Obtain an authorized cricket API key with live match and commentary rights.
- Configure MongoDB Atlas.
- Payment processing is deliberately not enabled. Do not accept deposits or withdrawals until an approved provider, verified webhooks, reconciliation, anti-fraud controls, and applicable legal/compliance review are in place.
- Do not use fake balances, synthetic live scores, or hardcoded login credentials in production.
