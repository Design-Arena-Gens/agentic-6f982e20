"use client"

import { useEffect, useState } from 'react'
import { DEFAULT_PAIRS } from '@/lib/pairs'

function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === 'undefined') return initial
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : initial
  })
  useEffect(() => { localStorage.setItem(key, JSON.stringify(value)) }, [key, value])
  return [value, setValue] as const
}

export default function AdminPage() {
  const [quality, setQuality] = useLocalStorage<number>('minQuality', 0.6)
  const [sensitivity, setSensitivity] = useLocalStorage<'low' | 'medium' | 'high'>('sensitivity', 'medium')
  const [symbols, setSymbols] = useLocalStorage<string[]>('symbols', DEFAULT_PAIRS.map(p => p.symbol))

  const [pairText, setPairText] = useState(symbols.join('\n'))

  useEffect(() => { setPairText(symbols.join('\n')) }, [])

  function savePairs() {
    const list = pairText.split(/\s+/).map(s => s.trim()).filter(Boolean)
    setSymbols(list)
  }

  return (
    <div className="max-w-2xl mx-auto card space-y-4">
      <h2 className="text-xl font-semibold">Admin Settings</h2>
      <div>
        <label className="block text-sm mb-1">Minimum Signal Quality (0-1)</label>
        <input className="input" type="number" step={0.05} min={0} max={1} value={quality} onChange={e => setQuality(Math.max(0, Math.min(1, Number(e.target.value))))} />
      </div>
      <div>
        <label className="block text-sm mb-1">Indicator Sensitivity</label>
        <select className="input" value={sensitivity} onChange={e => setSensitivity(e.target.value as any)}>
          <option value="low">low</option>
          <option value="medium">medium</option>
          <option value="high">high</option>
        </select>
      </div>
      <div>
        <label className="block text-sm mb-1">Pairs (Yahoo symbols, one per line)</label>
        <textarea className="input h-40" value={pairText} onChange={e => setPairText(e.target.value)} />
        <button className="btn mt-2" onClick={savePairs}>Save Pairs</button>
      </div>
      <div className="text-sm text-slate-400">Telegram env vars (optional): TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID</div>
    </div>
  )
}
