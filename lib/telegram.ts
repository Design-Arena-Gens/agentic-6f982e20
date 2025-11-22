const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
const CHAT_ID = process.env.TELEGRAM_CHAT_ID

export async function sendTelegramMessage(text: string) {
  if (!BOT_TOKEN || !CHAT_ID) return { ok: false, skipped: true }
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: CHAT_ID, text, parse_mode: 'Markdown' })
  })
  const json = await res.json().catch(() => ({}))
  return { ok: res.ok, json }
}
