import { NextRequest, NextResponse } from 'next/server'
import { DEFAULT_PAIRS } from '@/lib/pairs'
import { fetchYahoo1m, aggregateTo5m } from '@/lib/yahoo'
import { computeSignalsForCandles, nextFiveMinuteEpoch, type Signal } from '@/lib/signals'

export const revalidate = 15

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const symbolsParam = searchParams.get('symbols')
  const minQuality = Number(searchParams.get('quality') ?? '0.6')
  const sensitivity = (searchParams.get('sensitivity') ?? 'medium') as 'low' | 'medium' | 'high'
  const limit = Number(searchParams.get('limit') ?? '20')

  const symbols = symbolsParam?.split(',').map(s => s.trim()).filter(Boolean) ?? DEFAULT_PAIRS.map(p => p.symbol)

  // fetch all in parallel
  const results = await Promise.allSettled(symbols.map(async (symbol) => {
    const m1 = await fetchYahoo1m(symbol, '5d')
    const m5 = aggregateTo5m(m1)
    const { signals, trend } = computeSignalsForCandles(symbol, m5, sensitivity, minQuality)
    return { symbol, m5, signals, trend }
  }))

  const data = results
    .filter(r => r.status === 'fulfilled')
    .map((r: any) => r.value as { symbol: string; m5: any[]; signals: Signal[]; trend: string })

  // flatten and sort
  const allSignals = data.flatMap(d => d.signals.map(s => ({ ...s, symbol: d.symbol })))
  allSignals.sort((a, b) => b.time - a.time)

  const latestBucket = nextFiveMinuteEpoch() - 300
  const latestNowSignals = allSignals.filter(s => s.time === latestBucket)

  return NextResponse.json({
    symbols,
    minQuality,
    sensitivity,
    latestBucket,
    latestNowSignals,
    signals: allSignals.slice(0, limit),
    trends: Object.fromEntries(data.map(d => [d.symbol, d.trend]))
  })
}
