import { checkDueReminders } from '../utils/checkDueReminders'

// local-only scheduler: while the dev/node server process stays alive, check
// for due-date reminders periodically. Once deployed, this can be replaced by
// (or run alongside) an external cron hitting POST /api/cron/send-reminders.
const CHECK_INTERVAL_MS = 15 * 60 * 1000

export default defineNitroPlugin(() => {
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
