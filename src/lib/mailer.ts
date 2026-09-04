import "server-only";

/**
 * Minimal Resend integration via a plain fetch call (no SDK dependency needed for one call type).
 * Requires RESEND_API_KEY to be set; silently no-ops without it so the app works fine before the
 * user sets up an email account. Never throws - a failed/missing email should never block the
 * action that triggered it (e.g. saving a memory).
 */
export async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || !to) return;

  const from = process.env.RESEND_FROM_EMAIL || "Our Little World <onboarding@resend.dev>";

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from, to, subject, html }),
    });
    if (!response.ok) {
      console.error("Resend email failed:", response.status, await response.text().catch(() => ""));
    }
  } catch (err) {
    console.error("Resend email error:", err);
  }
}
