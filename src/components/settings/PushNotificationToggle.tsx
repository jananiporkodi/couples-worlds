"use client";

import { useEffect, useState } from "react";
import { savePushSubscription, removePushSubscription } from "@/app/(app)/settings/actions";

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) outputArray[i] = rawData.charCodeAt(i);
  return outputArray;
}

type Support = "checking" | "unsupported" | "needs-install" | "ready";

export default function PushNotificationToggle() {
  const [support, setSupport] = useState<Support>("checking");
  const [subscribed, setSubscribed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function check() {
      if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
        setSupport("unsupported");
        return;
      }
      // iOS only allows push subscriptions from a home-screen-installed instance, not a regular Safari tab.
      const isStandalone =
        window.matchMedia("(display-mode: standalone)").matches || (navigator as { standalone?: boolean }).standalone === true;
      const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
      if (isIOS && !isStandalone) {
        setSupport("needs-install");
        return;
      }

      setSupport("ready");
      try {
        const reg = await navigator.serviceWorker.register("/sw.js");
        const existing = await reg.pushManager.getSubscription();
        setSubscribed(!!existing);
      } catch {
        // registration failing shouldn't block the toggle from rendering; enabling will retry it
      }
    }
    check();
  }, []);

  async function enable() {
    setBusy(true);
    setError(null);
    try {
      const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!publicKey) {
        setError("Push notifications aren't set up yet.");
        return;
      }
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setError("Notifications permission was not granted.");
        return;
      }
      const reg = await navigator.serviceWorker.register("/sw.js");
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey) as BufferSource,
      });
      const json = sub.toJSON() as { endpoint: string; keys: { p256dh: string; auth: string } };
      await savePushSubscription(json);
      setSubscribed(true);
    } catch (err) {
      console.error(err);
      setError("Something went wrong enabling notifications.");
    } finally {
      setBusy(false);
    }
  }

  async function disable() {
    setBusy(true);
    setError(null);
    try {
      const reg = await navigator.serviceWorker.getRegistration();
      const sub = await reg?.pushManager.getSubscription();
      if (sub) {
        await removePushSubscription(sub.endpoint);
        await sub.unsubscribe();
      }
      setSubscribed(false);
    } catch (err) {
      console.error(err);
      setError("Something went wrong turning notifications off.");
    } finally {
      setBusy(false);
    }
  }

  if (support === "checking") return null;

  if (support === "unsupported") {
    return <p className="text-xs text-ink-soft">Notifications aren&apos;t supported on this browser.</p>;
  }

  if (support === "needs-install") {
    return (
      <p className="text-xs text-ink-soft">
        Add this app to your Home Screen first (Share → Add to Home Screen), then come back here to turn on notifications.
      </p>
    );
  }

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2.5">
        <button
          type="button"
          onClick={subscribed ? disable : enable}
          disabled={busy}
          className={`relative w-10 h-6 rounded-full transition ${subscribed ? "bg-accent" : "bg-black/15 dark:bg-white/15"}`}
          aria-pressed={subscribed}
          aria-label="Toggle push notifications"
        >
          <span
            className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
              subscribed ? "translate-x-4" : ""
            }`}
          />
        </button>
        <span className="text-sm">{subscribed ? "Notifications on for this device" : "Turn on notifications for this device"}</span>
      </div>
      {error && <p className="text-xs text-accent">{error}</p>}
    </div>
  );
}
