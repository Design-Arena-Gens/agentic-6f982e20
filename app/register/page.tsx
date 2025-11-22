"use client"

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (password !== confirm) { setError('Passwords do not match'); return }
    const usersRaw = localStorage.getItem('bos_users')
    const users = usersRaw ? (JSON.parse(usersRaw) as { email: string; password: string }[]) : []
    if (users.find(u => u.email === email)) { setError('Email already registered'); return }
    users.push({ email, password })
    localStorage.setItem('bos_users', JSON.stringify(users))
    localStorage.setItem('bos_user', JSON.stringify({ email }))
    router.push('/')
  }

  return (
    <div className="max-w-md mx-auto card">
      <h2 className="text-xl font-semibold mb-4">Register</h2>
      <form className="space-y-3" onSubmit={onSubmit}>
        <div>
          <label className="block text-sm mb-1">Email</label>
          <input className="input" value={email} onChange={e => setEmail(e.target.value)} type="email" required />
        </div>
        <div>
          <label className="block text-sm mb-1">Password</label>
          <input className="input" value={password} onChange={e => setPassword(e.target.value)} type="password" required />
        </div>
        <div>
          <label className="block text-sm mb-1">Confirm Password</label>
          <input className="input" value={confirm} onChange={e => setConfirm(e.target.value)} type="password" required />
        </div>
        {error && <div className="text-danger text-sm">{error}</div>}
        <button className="btn w-full" type="submit">Create account</button>
      </form>
      <div className="text-sm text-slate-400 mt-3">Already have an account? <a className="underline" href="/login">Login</a></div>
    </div>
  )
}
