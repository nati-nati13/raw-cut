import { Resend } from 'resend'

const FROM = process.env.EMAIL_FROM ?? 'RAW&CUT <noreply@raw-cut.vercel.app>'
const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://raw-cut.vercel.app'

// ─── Helper ────────────────────────────────────────────────────────────────

async function send(to: string, subject: string, html: string) {
  const key = process.env.RESEND_API_KEY
  if (!key) {
    console.warn('[email] RESEND_API_KEY not set — skipping send to', to)
    return
  }
  const resend = new Resend(key)
  const { error } = await resend.emails.send({ from: FROM, to, subject, html })
  if (error) console.error('[email] send error:', error)
}

// ─── Templates ─────────────────────────────────────────────────────────────

function layout(content: string) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f9f9f9; margin: 0; padding: 0; }
    .wrap { max-width: 560px; margin: 40px auto; background: #fff; border: 1px solid #e5e5e5; border-radius: 8px; overflow: hidden; }
    .header { background: #000; padding: 24px 32px; }
    .header a { color: #fff; font-weight: 800; font-size: 18px; text-decoration: none; letter-spacing: -0.03em; text-transform: uppercase; }
    .body { padding: 32px; color: #222; line-height: 1.6; }
    .body h2 { margin-top: 0; font-size: 20px; }
    .body p { color: #444; font-size: 15px; }
    .btn { display: inline-block; background: #000; color: #fff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 600; font-size: 15px; margin: 16px 0; }
    .footer { padding: 20px 32px; border-top: 1px solid #e5e5e5; font-size: 12px; color: #999; }
    table { width: 100%; border-collapse: collapse; font-size: 14px; }
    td { padding: 8px 0; border-bottom: 1px solid #f0f0f0; color: #444; }
    td:last-child { text-align: right; font-weight: 600; }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="header"><a href="${BASE}">RAW&amp;CUT</a></div>
    <div class="body">${content}</div>
    <div class="footer">RAW&amp;CUT · Independent fashion marketplace · <a href="${BASE}" style="color:#999;">${BASE}</a></div>
  </div>
</body>
</html>`
}

// ─── Exports ───────────────────────────────────────────────────────────────

export async function sendPasswordResetEmail(to: string, name: string, rawToken: string) {
  const url = `${BASE}/reset-password/${rawToken}`
  await send(
    to,
    'Reset your RAW&CUT password',
    layout(`
      <h2>Reset your password</h2>
      <p>Hi ${name},</p>
      <p>We received a request to reset your password. Click the button below — this link expires in <strong>1 hour</strong>.</p>
      <a class="btn" href="${url}">Reset password</a>
      <p style="font-size:13px;color:#999;">If you didn't request this, ignore this email. Your password won't change.</p>
    `)
  )
}

export async function sendOrderConfirmation(
  to: string,
  name: string,
  order: {
    orderNumber: string
    items: { title: string; quantity: number; price: number }[]
    subtotal: number
    shippingCost: number
    totalAmount: number
    currency: string
    shippingAddress: { street: string; city: string; country: string; postalCode: string }
  }
) {
  const rows = order.items
    .map(
      (i) => `<tr><td>${i.title} ×${i.quantity}</td><td>${order.currency} ${(i.price * i.quantity).toFixed(2)}</td></tr>`
    )
    .join('')

  await send(
    to,
    `Order confirmed — ${order.orderNumber}`,
    layout(`
      <h2>Order confirmed!</h2>
      <p>Hi ${name}, thank you for your order.</p>
      <p style="font-size:14px;color:#666;">Order <strong style="color:#000;">${order.orderNumber}</strong></p>
      <table>
        ${rows}
        <tr><td style="color:#999;">Shipping</td><td>${order.currency} ${order.shippingCost.toFixed(2)}</td></tr>
        <tr><td style="font-weight:700;color:#000;">Total</td><td style="font-size:16px;">${order.currency} ${order.totalAmount.toFixed(2)}</td></tr>
      </table>
      <p style="margin-top:20px;font-size:13px;color:#666;">
        Shipping to: ${order.shippingAddress.street}, ${order.shippingAddress.city} ${order.shippingAddress.postalCode}, ${order.shippingAddress.country}
      </p>
      <a class="btn" href="${BASE}/orders">View my orders</a>
    `)
  )
}

export async function sendDesignerApproved(to: string, name: string, storeName: string) {
  await send(
    to,
    'Your RAW&CUT designer application was approved!',
    layout(`
      <h2>You're approved! 🎉</h2>
      <p>Hi ${name},</p>
      <p>Your designer application for <strong>${storeName}</strong> has been approved. You can now list products and start selling on RAW&amp;CUT.</p>
      <a class="btn" href="${BASE}/dashboard/designer">Go to your dashboard</a>
    `)
  )
}

export async function sendDesignerRejected(to: string, name: string, storeName: string) {
  await send(
    to,
    'Update on your RAW&CUT application',
    layout(`
      <h2>Application update</h2>
      <p>Hi ${name},</p>
      <p>After review, we weren't able to approve <strong>${storeName}</strong> at this time. This may be due to our current capacity or curation focus.</p>
      <p>You're welcome to reapply in the future. If you have questions, reply to this email.</p>
    `)
  )
}

export async function sendWelcomeEmail(to: string, name: string) {
  await send(
    to,
    'Welcome to RAW&CUT',
    layout(`
      <h2>Welcome, ${name}!</h2>
      <p>Your RAW&amp;CUT account is ready. Explore independent designers and find pieces made with intention.</p>
      <a class="btn" href="${BASE}/products">Start exploring</a>
    `)
  )
}
