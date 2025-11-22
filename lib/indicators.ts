export type Candle = {
  t: number; // epoch seconds
  o: number;
  h: number;
  l: number;
  c: number;
  v?: number;
};

function ema(values: number[], period: number): number[] {
  if (values.length === 0) return [];
  const k = 2 / (period + 1);
  const result: number[] = [];
  let prev = values[0];
  result.push(prev);
  for (let i = 1; i < values.length; i++) {
    const next = values[i] * k + prev * (1 - k);
    result.push(next);
    prev = next;
  }
  return result;
}

export function rsi(closes: number[], period = 14): number[] {
  if (closes.length === 0) return [];
  const gains: number[] = [];
  const losses: number[] = [];

  for (let i = 1; i < closes.length; i++) {
    const change = closes[i] - closes[i - 1];
    gains.push(Math.max(0, change));
    losses.push(Math.max(0, -change));
  }

  // Wilder's smoothing
  const avgGain: number[] = [];
  const avgLoss: number[] = [];
  let sumGain = 0;
  let sumLoss = 0;
  for (let i = 0; i < period; i++) {
    sumGain += gains[i] ?? 0;
    sumLoss += losses[i] ?? 0;
  }
  avgGain[period] = sumGain / period;
  avgLoss[period] = sumLoss / period;

  for (let i = period + 1; i <= gains.length; i++) {
    const g = gains[i - 1] ?? 0;
    const l = losses[i - 1] ?? 0;
    avgGain[i] = (avgGain[i - 1] * (period - 1) + g) / period;
    avgLoss[i] = (avgLoss[i - 1] * (period - 1) + l) / period;
  }

  const rsiValues: number[] = [];
  for (let i = 0; i < closes.length; i++) {
    const idx = i; // map closes index to gains index+1
    if (idx < period) {
      rsiValues.push(NaN);
      continue;
    }
    const g = avgGain[idx] ?? 0;
    const l = avgLoss[idx] ?? 0;
    const rs = l === 0 ? 100 : g / l;
    const rsi = 100 - 100 / (1 + rs);
    rsiValues.push(rsi);
  }
  return rsiValues;
}

export type MACDResult = {
  macd: number[];
  signal: number[];
  histogram: number[];
};

export function macd(closes: number[], fast = 12, slow = 26, signalPeriod = 9): MACDResult {
  const emaFast = ema(closes, fast);
  const emaSlow = ema(closes, slow);
  const macdLine = closes.map((_, i) => (emaFast[i] ?? NaN) - (emaSlow[i] ?? NaN));
  const signalLine = ema(macdLine.map(v => (Number.isFinite(v) ? v : 0)), signalPeriod);
  const hist = macdLine.map((v, i) => v - (signalLine[i] ?? 0));
  return { macd: macdLine, signal: signalLine, histogram: hist };
}

export function simpleAtr(candles: Candle[], period = 14): number[] {
  const trs: number[] = [];
  for (let i = 0; i < candles.length; i++) {
    const { h, l } = candles[i];
    trs.push(h - l);
  }
  // simple moving average ATR (ok for thresholds)
  const atr: number[] = [];
  let sum = 0;
  for (let i = 0; i < trs.length; i++) {
    sum += trs[i];
    if (i >= period) sum -= trs[i - period];
    atr.push(i >= period - 1 ? sum / period : NaN);
  }
  return atr;
}
