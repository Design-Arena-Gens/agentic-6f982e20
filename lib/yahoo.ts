export type YahooCandle = { timestamp: number[]; indicators: { quote: { open?: number[]; high?: number[]; low?: number[]; close?: number[]; volume?: number[] }[] } };

export async function fetchYahoo1m(symbol: string, range: string = '2d') {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=${range}&interval=1m&includePrePost=false`;
  const res = await fetch(url, { next: { revalidate: 30 } });
  if (!res.ok) throw new Error(`Yahoo fetch failed ${res.status}`);
  const json = await res.json();
  const result = json?.chart?.result?.[0];
  if (!result) throw new Error('No result');
  const ts: number[] = result.timestamp;
  const q = result.indicators.quote[0];
  const o = q.open ?? [];
  const h = q.high ?? [];
  const l = q.low ?? [];
  const c = q.close ?? [];
  const v = q.volume ?? [];
  const candles = ts.map((t: number, i: number) => ({ t, o: o[i], h: h[i], l: l[i], c: c[i], v: v[i] }));
  return candles.filter(c => Number.isFinite(c.c));
}

export function aggregateTo5m(candles: { t: number; o: number; h: number; l: number; c: number; v?: number }[]) {
  const buckets: Record<number, { t: number; o: number; h: number; l: number; c: number; v: number }> = {};
  for (const c of candles) {
    const bucket = Math.floor(c.t / 300) * 300;
    const b = buckets[bucket];
    if (!b) {
      buckets[bucket] = { t: bucket, o: c.o, h: c.h, l: c.l, c: c.c, v: c.v ?? 0 };
    } else {
      b.h = Math.max(b.h, c.h);
      b.l = Math.min(b.l, c.l);
      b.c = c.c;
      b.v += c.v ?? 0;
    }
  }
  const out = Object.values(buckets).sort((a, b) => a.t - b.t);
  return out;
}
