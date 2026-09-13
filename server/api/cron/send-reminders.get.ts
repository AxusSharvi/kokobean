import { checkDueReminders } from '../../utils/checkDueReminders'

// triggered by Vercel Cron (GET, with an `Authorization: Bearer $CRON_SECRET`
// header it adds automatically) -- reject anything else so this can't be
// spammed by the public to trigger extra email sends
export default defineEventHandler(async (event) => {
  const secret = process.env.CRON_SECRET
  if (secret) {
    const auth = getHeader(event, 'authorization')
    if (auth !== `Bearer ${secret}`) {
      throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
    }
  }

  const sent = await checkDueReminders()
  return { ok: true, sent }
})
