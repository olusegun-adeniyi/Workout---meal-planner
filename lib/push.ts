import webpush from 'web-push'

type MealReminderPayload = {
  title: string
  body: string
  url?: string
  tag?: string
}

function requireEnv(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }
  return value
}

export function configureWebPush() {
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT || 'mailto:hello@example.com',
    requireEnv('NEXT_PUBLIC_VAPID_PUBLIC_KEY'),
    requireEnv('VAPID_PRIVATE_KEY'),
  )
}

export async function sendMealReminder(
  subscription: webpush.PushSubscription,
  payload: MealReminderPayload,
) {
  configureWebPush()

  return webpush.sendNotification(
    subscription,
    JSON.stringify({
      url: '/today',
      tag: 'meal-reminder',
      ...payload,
    }),
  )
}
