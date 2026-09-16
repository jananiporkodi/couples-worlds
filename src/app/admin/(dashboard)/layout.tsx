import { redirect } from "next/navigation";
import { isAdminSession } from "@/lib/admin-auth";

/**
 * Guards everything under /admin except /admin/lock itself - that page is a
 * sibling route outside this (dashboard) route group specifically so this
 * layout never wraps it (wrapping it here would redirect-loop: the guard
 * would bounce every visit to /admin/lock right back to /admin/lock).
 */
export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  if (!isAdminSession()) {
    redirect("/admin/lock");
  }
  return <div className="min-h-screen bg-cream">{children}</div>;
}
