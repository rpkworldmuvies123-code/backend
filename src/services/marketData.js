import { getBroker } from './broker/index.js';

const demoQuotes = [
  { symbol: 'NIFTY 50', name: 'Nifty 50', price: 24854.05, changePercent: 0.72 },
  { symbol: 'SENSEX', name: 'BSE Sensex', price: 81745.62, changePercent: 0.58 },
  { symbol: 'BANKNIFTY', name: 'Nifty Bank', price: 56102.80, changePercent: 0.41 },
  { symbol: 'RELIANCE', name: 'Reliance Industries', price: 1428.50, changePercent: -0.34 },
  { symbol: 'TCS', name: 'Tata Consultancy Services', price: 3190.20, changePercent: 0.81 },
  { symbol: 'INFY', name: 'Infosys', price: 1512.75, changePercent: 1.13 }
];

export async function getQuotes() {
  const broker = getBroker();
  if (broker.isConfigured()) {
    const quotes = await broker.getQuotes();
    return { provider: broker.name, isLive: true, quotes };
  }
  return { provider: 'demo', isLive: false, quotes: demoQuotes };
}
export async function getQuote(symbol) {
  const normalized = String(symbol || '').trim().toUpperCase();
  const { quotes } = await getQuotes();
  return quotes.find(q => q.symbol.toUpperCase() === normalized) || null;
}
