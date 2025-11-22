import { NextRequest, NextResponse } from 'next/server'
import { fetchYahoo1m, aggregateTo5m } from '@/lib/yahoo'

export const revalidate = 30

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const symbol = searchParams.get('symbol')
  const range = searchParams.get('range') ?? '5d'
  if (!symbol) return NextResponse.json({ error: 'symbol required' }, { status: 400 })
  const m1 = await fetchYahoo1m(symbol, range)
  const m5 = aggregateTo5m(m1)
  return NextResponse.json({ symbol, m1Count: m1.length, m5 })
}
