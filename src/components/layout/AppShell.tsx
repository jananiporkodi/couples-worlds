import SidebarNav from "./SidebarNav";
import BottomNav from "./BottomNav";
import FloatingSparkles from "./FloatingSparkles";
import NotificationsBell from "./NotificationsBell";
import ThemeToggle from "./ThemeToggle";
import KissButton from "./KissButton";
import { getRecentActivity, getSettingsMap, getReceivedKissCount } from "@/lib/data";
import { getMoonPhase } from "@/lib/moon";

export default async function AppShell({ children }: { children: React.ReactNode }) {
  const [activity, settings, kissCount] = await Promise.all([
    getRecentActivity(5),
    getSettingsMap().catch(() => ({}) as Record<string, unknown>),
    getReceivedKissCount().catch(() => 0),
  ]);
  const motionEnabled = settings.motion_enabled !== false;
  const moonPhase = getMoonPhase();

  return (
    <div className="min-h-screen flex">
      {motionEnabled && <FloatingSparkles />}
      <div className="fixed top-3 right-3 md:top-4 md:right-4 z-50 flex items-center gap-2">
        <span
          title={moonPhase.name}
          className="w-9 h-9 flex items-center justify-center rounded-full bg-paper/90 dark:bg-paper-dark/90 backdrop-blur-sm shadow-sm border border-black/[0.06] dark:border-white/10 text-base"
        >
          {moonPhase.emoji}
        </span>
        <KissButton receivedCount={kissCount} />
        <ThemeToggle />
        <NotificationsBell items={activity} />
      </div>
      <SidebarNav />
      <main className="flex-1 min-w-0 px-4 pt-6 pb-24 md:px-10 md:py-8 md:pb-10">
        <div className="mx-auto max-w-5xl">{children}</div>
      </main>
      <BottomNav />
    </div>
  );
}
