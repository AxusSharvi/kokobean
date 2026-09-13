const RESEND_API_URL = 'https://api.resend.com/emails'
const FROM_ADDRESS = 'kokobean <onboarding@resend.dev>'

export async function sendEmail(to: string, subject: string, html: string): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.warn('[kokobean] RESEND_API_KEY is not set — skipping email send')
    return false
  }

  const res = await fetch(RESEND_API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ from: FROM_ADDRESS, to, subject, html })
  })

  if (!res.ok) {
    console.error(`[kokobean] Failed to email ${to}: ${res.status} ${await res.text()}`)
    return false
  }

  return true
}

export function resetPasswordEmailHtml(userName: string, resetUrl: string) {
  return `
    <div style="font-family: Georgia, 'Times New Roman', serif; background:#FFEED6; padding:32px 16px;">
      <div style="max-width:480px;margin:0 auto;background:#FFFAF3;border:1px solid #A5AF79;border-radius:12px;padding:28px 24px;">
        <p style="font-size:13px;letter-spacing:.08em;text-transform:uppercase;color:#96855A;margin:0 0 20px;">kokobean</p>
        <p style="font-size:15px;color:#3A3120;margin:0 0 14px;">Hi ${userName},</p>
        <p style="font-size:16px;color:#3A3120;margin:0 0 20px;">
          Someone asked to reset your kokobean password. Click below to choose a new one — this link works for 1 hour.
        </p>
        <p style="margin:0 0 20px;">
          <a href="${resetUrl}" style="display:inline-block;background:#9E5434;color:#FFFFFF;text-decoration:none;font-size:14px;font-weight:bold;padding:10px 20px;border-radius:8px;">Reset password</a>
        </p>
        <p style="font-size:13px;color:#96855A;margin:0;">If you didn't request this, you can safely ignore this email.</p>
      </div>
    </div>
  `
}

export function reminderEmailHtml(userName: string, todoTitle: string, when: 'today' | 'tomorrow') {
  const whenLabel = when === 'today' ? 'due today' : 'due tomorrow'
  return `
    <div style="font-family: Georgia, 'Times New Roman', serif; background:#FFEED6; padding:32px 16px;">
      <div style="max-width:480px;margin:0 auto;background:#FFFAF3;border:1px solid #A5AF79;border-radius:12px;padding:28px 24px;">
        <p style="font-size:13px;letter-spacing:.08em;text-transform:uppercase;color:#96855A;margin:0 0 20px;">kokobean</p>
        <p style="font-size:15px;color:#3A3120;margin:0 0 14px;">Hi ${userName},</p>
        <p style="font-size:16px;color:#3A3120;margin:0 0 20px;">
          Just a reminder — <strong>&ldquo;${todoTitle}&rdquo;</strong> is ${whenLabel}.
        </p>
        <p style="font-size:13px;color:#96855A;margin:0;">Log in to check it off and bank your Koko Points.</p>
      </div>
    </div>
  `
}
