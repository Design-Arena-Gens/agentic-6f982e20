import { NextRequest, NextResponse } from 'next/server'
import { sendTelegramMessage } from '@/lib/telegram'

export async function POST(req: NextRequest) {
  const update = await req.json().catch(() => ({}))
  const message = update?.message?.text as string | undefined
  const chatId = update?.message?.chat?.id

  if (message?.startsWith('/start')) {
    await sendTelegramMessage('Bot is online. Use /help for commands.')
  } else if (message?.startsWith('/help')) {
    await sendTelegramMessage('Commands:\n/now - latest signals')
  } else if (message?.startsWith('/now')) {
    // keep minimal to avoid heavy work on webhook; respond simple
    await sendTelegramMessage('Visit dashboard for latest signals: https://agentic-6f982e20.vercel.app')
  }

  return NextResponse.json({ ok: true, chatId })
}
