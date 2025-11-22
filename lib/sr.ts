import type { Candle } from "./indicators";

export type Level = { price: number; strength: number; type: 'support' | 'resistance' };

function isPivotHigh(c: Candle[], i: number, left = 2, right = 2) {
  for (let l = i - left; l < i; l++) if (c[l]?.h > c[i].h) return false;
  for (let r = i + 1; r <= i + right; r++) if (c[r]?.h > c[i].h) return false;
  return true;
}

function isPivotLow(c: Candle[], i: number, left = 2, right = 2) {
  for (let l = i - left; l < i; l++) if (c[l]?.l < c[i].l) return false;
  for (let r = i + 1; r <= i + right; r++) if (c[r]?.l < c[i].l) return false;
  return true;
}

export function detectLevels(candles: Candle[], tolerance: number): Level[] {
  const raw: Level[] = [];
  for (let i = 3; i < candles.length - 3; i++) {
    if (isPivotHigh(candles, i, 3, 3)) raw.push({ price: candles[i].h, strength: 1, type: 'resistance' });
    if (isPivotLow(candles, i, 3, 3)) raw.push({ price: candles[i].l, strength: 1, type: 'support' });
  }
  // cluster by proximity
  raw.sort((a, b) => a.price - b.price);
  const clustered: Level[] = [];
  for (const lvl of raw) {
    const last = clustered[clustered.length - 1];
    if (last && Math.abs(last.price - lvl.price) <= tolerance && last.type === lvl.type) {
      // merge
      last.price = (last.price * last.strength + lvl.price) / (last.strength + 1);
      last.strength += 1;
    } else {
      clustered.push({ ...lvl });
    }
  }
  return clustered;
}

export function nearestLevelDistance(levels: Level[], price: number, kind: 'support' | 'resistance') {
  const lvls = levels.filter(l => l.type === kind);
  if (lvls.length === 0) return { distance: Infinity, level: undefined as Level | undefined };
  let best = lvls[0];
  let bestDist = Math.abs(best.price - price);
  for (const l of lvls) {
    const d = Math.abs(l.price - price);
    if (d < bestDist) { best = l; bestDist = d; }
  }
  return { distance: bestDist, level: best };
}
