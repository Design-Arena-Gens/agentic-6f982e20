"use client"

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    const usersRaw = localStorage.getItem('bos_users')
    const users = usersRaw ? (JSON.parse(usersRaw) as { email: string; password: string }[]) : []
    const u = users.find(u => u.email === email && u.password === password)
    if (!u) { setError('Invalid credentials'); return }
    localStorage.setItem('bos_user', JSON.stringify({ email }))
    router.push('/')
  }

  return (
    <div className="max-w-md mx-auto card">
      <h2 className="text-xl font-semibold mb-4">Login</h2>
      <form className="space-y-3" onSubmit={onSubmit}>
        <div>
          <label className="block text-sm mb-1">Email</label>
          <input className="input" value={email} onChange={e => setEmail(e.target.value)} type="email" required />
        </div>
        <div>
          <label className="block text-sm mb-1">Password</label>
          <input className="input" value={password} onChange={e => setPassword(e.target.value)} type="password" required />
        </div>
        {error && <div className="text-danger text-sm">{error}</div>}
        <button className="btn w-full" type="submit">Login</button>
      </form>
      <div className="text-sm text-slate-400 mt-3">No account? <a className="underline" href="/register">Register</a></div>
    </div>
  )
}
