self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})

self.addEventListener('push', (event) => {
  const fallback = {
    title: 'Time to eat',
    body: 'Open Forge and log your meal.',
    url: '/today',
  }

  let payload = fallback

  if (event.data) {
    try {
      payload = { ...fallback, ...event.data.json() }
    } catch {
      payload = { ...fallback, body: event.data.text() }
    }
  }

  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      icon: '/icons/forge-icon.svg',
      badge: '/icons/forge-maskable-icon.svg',
      tag: payload.tag || 'meal-reminder',
      renotify: true,
      data: {
        url: payload.url || '/today',
      },
      actions: [
        { action: 'open', title: 'Open Forge' },
      ],
    }),
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  const destination = event.notification.data?.url || '/today'

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      const existingClient = clientList.find((client) => client.url.includes(destination))

      if (existingClient) {
        return existingClient.focus()
      }

      return clients.openWindow(destination)
    }),
  )
})
