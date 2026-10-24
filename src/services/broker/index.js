/*
 * Broker adapter boundary.
 * Implement this interface only against the selected broker's official API and current docs.
 * Do not guess endpoint URLs, sign requests client-side, or accept broker credentials from users.
 * This default adapter intentionally fails closed: it cannot submit live orders.
 */
class UnconfiguredBroker {
  name = 'none';
  isConfigured() { return false; }
  async getQuotes() { throw new Error('Broker is not configured'); }
  async getQuote() { throw new Error('Broker is not configured'); }
  async getProfile() { throw new Error('Broker is not configured'); }
  async getHoldings() { throw new Error('Broker is not configured'); }
  async getOrders() { throw new Error('Broker is not configured'); }
  async placeOrder() { throw new Error('Live order placement is disabled until a broker adapter is implemented and tested'); }
}
export function getBroker() {
  // Add a vetted adapter selected by BROKER_PROVIDER after implementing OAuth/token refresh,
  // request signing, instrument mapping, rate limits, audit logs and idempotency.
  return new UnconfiguredBroker();
}
