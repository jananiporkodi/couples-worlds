import Link from "next/link";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import CreateWorldForm from "./CreateWorldForm";
import { setWorldStatus } from "./actions";
import type { World } from "@/lib/world";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, string> = {
  created: "Created",
  onboarding: "Onboarding",
  active: "Active",
  disabled: "Disabled",
  archived: "Archived",
};

export default async function AdminDashboardPage() {
  const supabase = getSupabaseServerClient();
  const { data } = await supabase.from("worlds").select("*").order("created_at", { ascending: false });
  const worlds = (data as World[] | null) ?? [];

  return (
    <main className="max-w-3xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-hand text-4xl leading-none text-ink">Couples Worlds — Admin</h1>
        <form action="/api/admin-logout" method="POST">
          <button type="submit" className="text-xs text-ink-soft underline">
            log out
          </button>
        </form>
      </div>

      <section className="card-panel !bg-white p-6 mb-8">
        <h2 className="text-sm font-bold uppercase tracking-wide text-ink-soft mb-4">Create a new world</h2>
        <CreateWorldForm />
      </section>

      <section className="card-panel !bg-white p-6">
        <h2 className="text-sm font-bold uppercase tracking-wide text-ink-soft mb-4">
          {worlds.length} {worlds.length === 1 ? "world" : "worlds"}
        </h2>
        <div className="space-y-3">
          {worlds.map((world) => (
            <div
              key={world.id}
              className="flex flex-wrap items-center justify-between gap-2 border border-ink/10 rounded-xl px-4 py-3"
            >
              <div>
                <p className="font-semibold text-ink">{world.name}</p>
                <p className="text-xs text-ink-soft">
                  /w/{world.slug} · {STATUS_LABEL[world.status] ?? world.status} · created{" "}
                  {new Date(world.created_at as unknown as string).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <Link href={`/w/${world.slug}/welcome`} className="text-accent font-semibold underline" target="_blank">
                  invite link
                </Link>
                {world.status === "disabled" ? (
                  <form action={setWorldStatus}>
                    <input type="hidden" name="id" value={world.id} />
                    <input type="hidden" name="status" value="active" />
                    <button type="submit" className="text-ink-soft underline">
                      reactivate
                    </button>
                  </form>
                ) : world.status !== "archived" ? (
                  <form action={setWorldStatus}>
                    <input type="hidden" name="id" value={world.id} />
                    <input type="hidden" name="status" value="disabled" />
                    <button type="submit" className="text-ink-soft underline">
                      disable
                    </button>
                  </form>
                ) : null}
                {world.status !== "archived" ? (
                  <form action={setWorldStatus}>
                    <input type="hidden" name="id" value={world.id} />
                    <input type="hidden" name="status" value="archived" />
                    <button type="submit" className="text-ink-soft underline">
                      archive
                    </button>
                  </form>
                ) : null}
              </div>
            </div>
          ))}
          {worlds.length === 0 ? <p className="text-sm text-ink-soft">No worlds yet.</p> : null}
        </div>
      </section>
    </main>
  );
}
