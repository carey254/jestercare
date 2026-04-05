import { PHONE_E164 } from '../data/contact'

const DEFAULT_MESSAGE =
  "Hi Jester Speed Delivery — I'm in Nairobi and I'd like to place an order."

export function getWhatsAppUrl(message?: string): string {
  const raw = import.meta.env.VITE_WHATSAPP_PHONE ?? PHONE_E164
  const phone = String(raw).replace(/\D/g, '') || PHONE_E164
  const text = message?.trim() || DEFAULT_MESSAGE
  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`
}
