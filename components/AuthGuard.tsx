"use client"

import { useEffect, useState } from 'react'

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false)
  const [loggedIn, setLoggedIn] = useState(false)

  useEffect(() => {
    const u = localStorage.getItem('bos_user')
    setLoggedIn(!!u)
    setReady(true)
  }, [])

  if (!ready) return <div className="card">Loading...</div>
  if (!loggedIn) return (
    <div className="card">
      <div className="text-lg font-semibold mb-2">Login required</div>
      <div className="text-slate-300 mb-4">Please login or register to access signals.</div>
      <div className="flex gap-2">
        <a className="btn" href="/login">Login</a>
        <a className="btn" href="/register">Register</a>
      </div>
    </div>
  )
  return <>{children}</>
}
