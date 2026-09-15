import "server-only";
import webpush from "web-push";
import { cookies } from "next/headers";
import { getSupabaseServerClient } from "./supabase/server";
import { getSettingsMap } from "./data";
import { PARTNER_COOKIE_NAME, isValidPartnerId, type PartnerId } from "./auth";

/** The display name of whoever is using this device right now, for building notification text like "Vishwa added a memory". Falls back to a neutral phrase if identity/name isn't set up. */
export async function getActorName(): Promise<string> {
  const actor = cookies().get(PARTNER_COOKIE_NAME)?.value;
  if (!isValidPartnerId(actor)) return "Your partner";

  const settings = await getSettingsMap().catch(() => ({}) as Record<string, unknown>);
  const name = (actor === "partner_a" ? settings.partner_a_name : settings.partner_b_name) as string | undefined;
  return name || "Your partner";
}

let configured = false;

function ensureConfigured(): boolean {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT || "mailto:hello@example.com";
  if (!publicKey || !privateKey) return false;

  if (!configured) {
    webpush.setVapidDetails(subject, publicKey, privateKey);
    configured = true;
  }
  return true;
}

/**
 * Sends a web push notification to every device registered to `partnerId`.
 * Silently no-ops if VAPID keys aren't configured, and prunes subscriptions
 * that the push service reports as gone (410/404) - a device that uninstalled
 * or revoked permission shouldn't cause errors on every future notification.
 */
async function sendPushToPartner(partnerId: PartnerId, payload: { title: string; body: string; url: string }) {
  if (!ensureConfigured()) return;

  const supabase = getSupabaseServerClient();
  const { data: subs } = await supabase.from("push_subscriptions").select("id,endpoint,p256dh,auth").eq("partner_id", partnerId);
  if (!subs || subs.length === 0) return;

  const body = JSON.stringify(payload);

  await Promise.all(
    subs.map(async (sub: { id: string; endpoint: string; p256dh: string; auth: string }) => {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          body
        );
      } catch (err: unknown) {
        const statusCode = (err as { statusCode?: number })?.statusCode;
        if (statusCode === 404 || statusCode === 410) {
          await supabase.from("push_subscriptions").delete().eq("id", sub.id);
        } else {
          console.error("push send failed:", err);
        }
      }
    })
  );
}

/**
 * Notifies whichever partner did NOT trigger the current server action, based on the
 * `olw_partner` identity cookie. Never throws - a failed/misconfigured push should
 * never block the action that triggered it (adding a memory, plan, note, etc.).
 */
export async function notifyOtherPartner(payload: { title: string; body: string; url: string }) {
  try {
    const actor = cookies().get(PARTNER_COOKIE_NAME)?.value;
    if (!isValidPartnerId(actor)) return;

    const recipient: PartnerId = actor === "partner_a" ? "partner_b" : "partner_a";
    await sendPushToPartner(recipient, payload);
  } catch (err) {
    console.error("notifyOtherPartner failed:", err);
  }
}
