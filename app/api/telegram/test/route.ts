import { NextResponse } from 'next/server'
import { sendTelegramMessage } from '@/lib/telegram'

export async function GET() {
  const res = await sendTelegramMessage('Test message from Binary Options Signals bot ?')
  return NextResponse.json(res)
}
