"use client"

import { useEffect, useMemo, useState } from 'react'
import { DEFAULT_PAIRS } from '@/lib/pairs'
import { nextFiveMinuteEpoch } from '@/lib/signals'
import Link from 'next/link'

function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === 'undefined') return initial
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : initial
  })
  useEffect(() => { localStorage.setItem(key, JSON.stringify(value)) }, [key, value])
  return [value, setValue] as const
}

export default function Dashboard() {
  const [quality, setQuality] = useLocalStorage<number>('minQuality', 0.6)
  const [sensitivity, setSensitivity] = useLocalStorage<'low' | 'medium' | 'high'>('sensitivity', 'medium')
  const [symbols, setSymbols] = useLocalStorage<string[]>(
    'symbols',
    DEFAULT_PAIRS.map(p => p.symbol)
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<any>(null)

  const query = useMemo(() => {
    const params = new URLSearchParams()
    params.set('symbols', symbols.join(','))
    params.set('quality', String(quality))
    params.set('sensitivity', sensitivity)
    params.set('limit', '20')
    return `/api/signals?${params.toString()}`
  }, [symbols, quality, sensitivity])

  useEffect(() => {
    let active = true
    async function load() {
      setLoading(true); setError(null)
      try {
        const res = await fetch(query)
        if (!res.ok) throw new Error(`Error ${res.status}`)
        const json = await res.json()
        if (active) setData(json)
      } catch (e: any) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }
    load()
    const id = setInterval(load, 15000)
    return () => { active = false; clearInterval(id) }
  }, [query])

  const nextEntry = nextFiveMinuteEpoch() * 1000

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card">
          <div className="text-sm text-slate-400">Next 5m entry</div>
          <div className="text-2xl font-semibold mt-1">{new Date(nextEntry).toLocaleTimeString()}</div>
        </div>
        <div className="card">
          <div className="text-sm text-slate-400">Minimum quality</div>
          <div className="flex items-center gap-2 mt-2">
            <input className="input" type="number" step={0.05} min={0} max={1} value={quality} onChange={e => setQuality(Math.max(0, Math.min(1, Number(e.target.value))))} />
            <select className="input max-w-[140px]" value={sensitivity} onChange={e => setSensitivity(e.target.value as any)}>
              <option value="low">low</option>
              <option value="medium">medium</option>
              <option value="high">high</option>
            </select>
          </div>
          <div className="text-xs text-slate-400 mt-2">Adjust in <Link className="underline" href="/admin">Admin</Link></div>
        </div>
        <div className="card">
          <div className="text-sm text-slate-400">Symbols</div>
          <div className="text-xs mt-2 text-slate-300 break-words">{symbols.join(', ')}</div>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold">Latest signals</h2>
          <button className="btn" onClick={() => {
            // toggle a popular subset
            setSymbols(DEFAULT_PAIRS.map(p => p.symbol))
          }}>Reset pairs</button>
        </div>
        {loading && <div className="text-slate-400">Loading...</div>}
        {error && <div className="text-red-400">{error}</div>}
        {data && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-slate-400">
                <tr>
                  <th className="py-2">Time</th>
                  <th>Symbol</th>
                  <th>Direction</th>
                  <th>Price</th>
                  <th>RSI</th>
                  <th>MACD Hist</th>
                  <th>Level</th>
                  <th>Quality</th>
                </tr>
              </thead>
              <tbody>
                {data.signals.map((s: any, i: number) => (
                  <tr key={i} className="border-t border-slate-800">
                    <td className="py-2">{new Date(s.time * 1000).toLocaleTimeString()}</td>
                    <td>{s.symbol}</td>
                    <td className={s.direction === 'BUY' ? 'text-success' : 'text-danger'}>{s.direction}</td>
                    <td>{s.price.toFixed(5)}</td>
                    <td>{s.rsi.toFixed(1)}</td>
                    <td>{s.macdHist.toFixed(4)}</td>
                    <td>{s.levelType} @ {s.levelPrice.toFixed(5)}</td>
                    <td>{(s.quality * 100).toFixed(0)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {data && (
        <div className="card">
          <h2 className="font-semibold mb-3">Current trends</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-sm">
            {Object.entries(data.trends).map(([sym, tr]: any) => (
              <div key={sym} className="px-3 py-2 rounded-md bg-slate-900 border border-slate-800 flex items-center justify-between">
                <span className="text-slate-300">{sym}</span>
                <span className={tr === 'BULL' ? 'text-success' : tr === 'BEAR' ? 'text-danger' : 'text-slate-400'}>{tr}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
