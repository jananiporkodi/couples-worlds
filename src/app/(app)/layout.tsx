import AppShell from "@/components/layout/AppShell";
import { getCurrentWorldId } from "@/lib/world";

export default async function AppGroupLayout({ children }: { children: React.ReactNode }) {
  // Redirects to /welcome if there's no session, or the session's world has
  // been disabled/archived since the cookie was issued. Every actual query
  // this app makes is already scoped to the session's world by the Neon
  // shim (src/lib/supabase/server.ts) - this is the one status check that
  // shim doesn't do on its own.
  await getCurrentWorldId();
  return <AppShell>{children}</AppShell>;
}
