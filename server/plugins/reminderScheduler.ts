import { checkDueReminders } from '../utils/checkDueReminders'

// local-only scheduler: while the dev/node server process stays alive, check
// for due-date reminders periodically. On Vercel, a Vercel Cron job hits
// GET /api/cron/send-reminders instead (see vercel.json).
const CHECK_INTERVAL_MS = 15 * 60 * 1000

export default defineNitroPlugin(() => {
  // on Vercel, a Vercel Cron job hits GET /api/cron/send-reminders instead --
  // serverless functions don't stay alive for setInterval to matter there
  if (process.env.VERCEL) return

  async function run() {
    try {
      const sent = await checkDueReminders()
      if (sent > 0) {
        console.log(`[kokobean] sent ${sent} due-date reminder email(s)`)
      }
    } catch (error) {
      console.error('[kokobean] reminder check failed', error)
    }
  }

  setTimeout(run, 10_000)
  setInterval(run, CHECK_INTERVAL_MS)
})
