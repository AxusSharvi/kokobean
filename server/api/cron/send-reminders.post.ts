import { checkDueReminders } from '../../utils/checkDueReminders'

export default defineEventHandler(async () => {
  const sent = await checkDueReminders()
  return { ok: true, sent }
})
