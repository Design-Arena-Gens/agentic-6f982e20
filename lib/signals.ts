import { macd, rsi, simpleAtr, type Candle } from './indicators'
import { detectLevels, nearestLevelDistance, type Level } from './sr'

export type Sensitivity = 'low' | 'medium' | 'high'

export type Signal = {
  symbol: string
  time: number
  direction: 'BUY' | 'SELL'
  price: number
  rsi: number
  macdHist: number
  levelType: 'support' | 'resistance'
  levelPrice: number
  quality: number
}

export function computeSignalsForCandles(symbol: string, candles5m: Candle[], sensitivity: Sensitivity = 'medium', minQuality = 0.6): { signals: Signal[]; trend: 'BULL' | 'BEAR' | 'SIDEWAYS'; levels: Level[] } {
  if (candles5m.length < 50) return { signals: [], trend: 'SIDEWAYS', levels: [] }
  const closes = candles5m.map(c => c.c)
  const macdRes = macd(closes)
  const rsi14 = rsi(closes)
  const atr = simpleAtr(candles5m)

  const lastAtr = atr.at(-1) ?? 0.001
  const tolFactor = sensitivity === 'high' ? 0.5 : sensitivity === 'low' ? 1.5 : 1
  const tolerance = lastAtr * tolFactor
  const levels = detectLevels(candles5m, tolerance)

  const signals: Signal[] = []

  for (let i = 2; i < candles5m.length; i++) {
    const price = candles5m[i].c
    const prevHist = macdRes.histogram[i - 1]
    const hist = macdRes.histogram[i]
    const r = rsi14[i]
    const prevR = rsi14[i - 1]

    if (!Number.isFinite(hist) || !Number.isFinite(prevHist) || !Number.isFinite(r) || !Number.isFinite(prevR)) continue

    // support/resistance proximity
    const { distance: distSup, level: nearSup } = nearestLevelDistance(levels, price, 'support')
    const { distance: distRes, level: nearRes } = nearestLevelDistance(levels, price, 'resistance')

    const nearSupport = distSup <= tolerance
    const nearResistance = distRes <= tolerance

    // crossings
    const macdCrossUp = prevHist < 0 && hist > 0
    const macdCrossDown = prevHist > 0 && hist < 0
    const rsiCrossUp = prevR < 30 && r >= 30
    const rsiCrossDown = prevR > 70 && r <= 70

    // BUY
    if (nearSupport && macdCrossUp && rsiCrossUp) {
      const quality = scoreQuality({
        rsi: r,
        macdSlope: hist - prevHist,
        proximity: distSup / (lastAtr || 1),
        sensitivity,
      })
      if (quality >= minQuality) {
        signals.push({
          symbol,
          time: candles5m[i].t,
          direction: 'BUY',
          price,
          rsi: r,
          macdHist: hist,
          levelType: 'support',
          levelPrice: nearSup?.price ?? price,
          quality,
        })
      }
    }

    // SELL
    if (nearResistance && macdCrossDown && rsiCrossDown) {
      const quality = scoreQuality({
        rsi: 100 - r,
        macdSlope: prevHist - hist,
        proximity: distRes / (lastAtr || 1),
        sensitivity,
      })
      if (quality >= minQuality) {
        signals.push({
          symbol,
          time: candles5m[i].t,
          direction: 'SELL',
          price,
          rsi: r,
          macdHist: hist,
          levelType: 'resistance',
          levelPrice: nearRes?.price ?? price,
          quality,
        })
      }
    }
  }

  // Trend
  const lastMacd = macdRes.macd.at(-1) ?? 0
  const lastSignal = macdRes.signal.at(-1) ?? 0
  const trend = Math.abs(lastMacd - lastSignal) < 1e-6 ? 'SIDEWAYS' : lastMacd > lastSignal ? 'BULL' : 'BEAR'

  return { signals, trend, levels }
}

function scoreQuality(params: { rsi: number; macdSlope: number; proximity: number; sensitivity: 'low' | 'medium' | 'high' }) {
  const rsiScore = Math.min(1, Math.abs(params.rsi - 50) / 50) // further from 50 is stronger
  const macdScore = Math.min(1, Math.abs(params.macdSlope) * 10)
  const proximityScore = Math.max(0, 1 - params.proximity) // closer to level is better
  const base = 0.5 * rsiScore + 0.3 * macdScore + 0.2 * proximityScore
  const sensBoost = params.sensitivity === 'high' ? 0.05 : params.sensitivity === 'low' ? -0.05 : 0
  return Math.min(1, Math.max(0, base + sensBoost))
}

export function nextFiveMinuteEpoch(fromSec?: number) {
  const now = fromSec ?? Math.floor(Date.now() / 1000)
  const next = Math.ceil((now + 1) / 300) * 300
  return next
}
