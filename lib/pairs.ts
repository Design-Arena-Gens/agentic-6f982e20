export type Pair = { symbol: string; name: string };

export const DEFAULT_PAIRS: Pair[] = [
  { symbol: 'EURUSD=X', name: 'EUR/USD' },
  { symbol: 'GBPUSD=X', name: 'GBP/USD' },
  { symbol: 'USDJPY=X', name: 'USD/JPY' },
  { symbol: 'USDCHF=X', name: 'USD/CHF' },
  { symbol: 'USDCAD=X', name: 'USD/CAD' },
  { symbol: 'AUDUSD=X', name: 'AUD/USD' },
  { symbol: 'NZDUSD=X', name: 'NZD/USD' },
  { symbol: 'EURJPY=X', name: 'EUR/JPY' },
  { symbol: 'GBPJPY=X', name: 'GBP/JPY' },
  { symbol: 'EURGBP=X', name: 'EUR/GBP' }
];
