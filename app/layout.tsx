import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Binary Options Signals',
  description: '5m signals powered by RSI, MACD, S/R',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="container py-6">
          <header className="flex items-center justify-between mb-6">
            <h1 className="text-xl font-semibold">Binary Options Signals</h1>
            <nav className="flex items-center gap-3 text-sm">
              <a href="/" className="hover:underline">Dashboard</a>
              <a href="/admin" className="hover:underline">Admin</a>
              <a href="/login" className="hover:underline">Login</a>
            </nav>
          </header>
          {children}
          <footer className="mt-10 text-xs text-slate-400">
            Data via Yahoo Finance (unofficial). For education only.
          </footer>
        </div>
      </body>
    </html>
  )
}
