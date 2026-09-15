// Minimal service worker whose only job is to receive Web Push events and show a
// notification, and to focus/open the app when that notification is tapped.
// Deliberately does NOT do any asset caching / offline support - keeping this tiny
// avoids the classic "stale cached app" bugs that come with more ambitious service workers.

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", (event) => {
  if (!event.data) return;

  let payload = { title: "Our Little World", body: "Something new happened.", url: "/" };
  try {
    payload = { ...payload, ...event.data.json() };
  } catch {
    payload.body = event.data.text();
  }

  event.waitUntil(
    (async () => {
      await self.registration.showNotification(payload.title, {
        body: payload.body,
        icon: "/icon-192.png",
        badge: "/icon-192.png",
        data: { url: payload.url || "/" },
      });
      // Android home-screen icon badge (Badging API) - iOS has no equivalent for web apps.
      // Count of still-open notifications, so the badge number stays accurate as they're read/dismissed.
      if ("setAppBadge" in self.navigator) {
        try {
          const open = await self.registration.getNotifications();
          await self.navigator.setAppBadge(open.length);
        } catch {}
      }
    })()
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/";

  event.waitUntil(
    (async () => {
      if ("setAppBadge" in self.navigator) {
        try {
          const stillOpen = await self.registration.getNotifications();
          if (stillOpen.length > 0) await self.navigator.setAppBadge(stillOpen.length);
          else await self.navigator.clearAppBadge();
        } catch {}
      }
      const clientsList = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
      for (const client of clientsList) {
        if ("focus" in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      return self.clients.openWindow(url);
    })()
  );
});
