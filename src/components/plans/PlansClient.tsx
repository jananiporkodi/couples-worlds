"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import { useFormStatus } from "react-dom";
import type { PartnerAssignee, Plan } from "@/lib/types";
import { PLAN_CATEGORIES } from "@/lib/types";
import { formatFriendlyDate, daysUntil } from "@/lib/dates";
import { getPlanState, formatTimeRange } from "@/lib/plans";
import { addPlan, markPlanStatus, deletePlan, convertPlanToMemory } from "@/app/(app)/plans/actions";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function pad(n: number): string {
  return String(n).padStart(2, "0");
}
function dateKey(year: number, monthIndex: number, day: number): string {
  return `${year}-${pad(monthIndex + 1)}-${pad(day)}`;
}
function todayKey(): string {
  const now = new Date();
  return dateKey(now.getFullYear(), now.getMonth(), now.getDate());
}

function personLabel(person: PartnerAssignee, names: { a: string; b: string }): string {
  if (person === "partner_a") return names.a;
  if (person === "partner_b") return names.b;
  return "Both";
}

const STATE_DOT: Record<string, string> = {
  upcoming: "bg-ink/30",
  completed: "bg-accent",
  missed: "bg-ink/20",
  cancelled: "bg-ink/10",
};

const STATE_CHIP: Record<string, string> = {
  upcoming: "bg-lavender text-ink",
  completed: "bg-blush text-accent",
  missed: "bg-black/5 dark:bg-white/10 text-ink-soft line-through",
  cancelled: "bg-black/5 dark:bg-white/10 text-ink-soft line-through",
};

function SubmitButton({ label = "+ add plan", pendingLabel = "Adding…" }: { label?: string; pendingLabel?: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-primary !py-2 !px-4 text-sm" disabled={pending}>
      {pending ? pendingLabel : label}
    </button>
  );
}

function AddPlanForm({ defaultDate, names, onDone }: { defaultDate: string; names: { a: string; b: string }; onDone: () => void }) {
  const formRef = useRef<HTMLFormElement>(null);
  return (
    <form
      ref={formRef}
      action={async (formData) => {
        await addPlan(formData);
        formRef.current?.reset();
        onDone();
      }}
      className="card-panel p-4 space-y-2.5"
    >
      <input name="title" placeholder="Dinner date" className="input-field" required />
      <textarea name="description" placeholder="Any details? (optional)" className="input-field" rows={2} />
      <div className="grid grid-cols-2 gap-2.5">
        <input type="date" name="planDate" defaultValue={defaultDate} className="input-field" required />
        <input name="location" placeholder="Location (optional)" className="input-field" />
      </div>
      <div className="grid grid-cols-2 gap-2.5">
        <input type="time" name="startTime" className="input-field" />
        <input type="time" name="endTime" className="input-field" />
      </div>
      <div className="grid grid-cols-2 gap-2.5">
        <select name="category" defaultValue="" className="input-field">
          <option value="">category (optional)</option>
          {PLAN_CATEGORIES.map((c) => (
            <option key={c.key} value={c.key}>
              {c.emoji} {c.label}
            </option>
          ))}
        </select>
        <select name="person" defaultValue="both" className="input-field">
          <option value="both">Both</option>
          <option value="partner_a">{names.a}</option>
          <option value="partner_b">{names.b}</option>
        </select>
      </div>
      <select name="reminderMinutesBefore" defaultValue="" className="input-field">
        <option value="">no reminder</option>
        <option value="60">1 hour before</option>
        <option value="1440">1 day before</option>
        <option value="10080">1 week before</option>
      </select>
      <div className="flex gap-2 pt-1">
        <SubmitButton />
        <button type="button" onClick={onDone} className="btn-ghost !py-2 !px-3 text-sm">
          cancel
        </button>
      </div>
    </form>
  );
}

function ConvertToMemoryForm({ plan, onDone }: { plan: Plan; onDone: () => void }) {
  const formRef = useRef<HTMLFormElement>(null);
  return (
    <form
      ref={formRef}
      action={async (formData) => {
        formData.set("planId", plan.id);
        await convertPlanToMemory(formData);
        onDone();
      }}
      className="card-panel p-4 space-y-2.5 border-2 border-accent/30"
    >
      <p className="font-hand text-xl">Turn &ldquo;{plan.title}&rdquo; into a memory</p>
      <input name="title" defaultValue={plan.title} className="input-field" placeholder="Title" />
      <textarea
        name="story"
        defaultValue={plan.description ?? ""}
        placeholder="Tell the full story…"
        className="input-field"
        rows={3}
      />
      <div className="grid grid-cols-2 gap-2.5">
        <input name="location" defaultValue={plan.location ?? ""} placeholder="Location" className="input-field" />
        <input name="tags" placeholder="tags, comma, separated" className="input-field" />
      </div>
      <input type="file" name="photos" accept="image/*,video/*" multiple className="input-field !py-2 text-xs" />
      <div className="flex gap-2 pt-1">
        <SubmitButton label="save as memory" pendingLabel="Saving…" />
        <button type="button" onClick={onDone} className="btn-ghost !py-2 !px-3 text-sm">
          cancel
        </button>
      </div>
    </form>
  );
}

function PlanDetailRow({ plan, names }: { plan: Plan; names: { a: string; b: string } }) {
  const [pending, startTransition] = useTransition();
  const [converting, setConverting] = useState(false);
  const state = getPlanState(plan);
  const remaining = daysUntil(plan.plan_date);
  const timeRange = formatTimeRange(plan.start_time, plan.end_time);
  const categoryMeta = PLAN_CATEGORIES.find((c) => c.key === plan.category);

  if (converting) {
    return <ConvertToMemoryForm plan={plan} onDone={() => setConverting(false)} />;
  }

  return (
    <div className="card-panel p-3.5">
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className={`w-1.5 h-1.5 rounded-full ${STATE_DOT[state]}`} />
            <p className={`font-hand text-xl leading-tight ${state === "missed" || state === "cancelled" ? "opacity-60" : ""}`}>
              {categoryMeta ? `${categoryMeta.emoji} ` : ""}
              {plan.title}
            </p>
            {state === "completed" && <span className="text-accent text-sm">♥</span>}
          </div>
          {plan.location && <p className="text-[11px] text-ink-soft mt-0.5">📍 {plan.location}</p>}
          {timeRange && <p className="text-[11px] text-ink-soft mt-0.5">🕐 {timeRange}</p>}
          {plan.description && <p className="text-sm text-ink-soft mt-1">{plan.description}</p>}
          <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
            <span className={`chip text-[10px] !py-0.5 !px-2 ${STATE_CHIP[state]}`}>{state}</span>
            <span className="text-[10px] text-ink-soft">{personLabel(plan.person, names)}</span>
            {state === "upcoming" && (
              <span className="text-[10px] font-bold text-ink-soft">
                {remaining === 0 ? "today!" : `in ${remaining}d`}
              </span>
            )}
          </div>
        </div>
        <div className="flex flex-col gap-1.5 flex-shrink-0">
          {plan.status === "planned" && (
            <>
              {(state === "missed" || state === "upcoming") && (
                <button onClick={() => setConverting(true)} className="btn-ghost !py-1 !px-2 text-[11px]">
                  → memory
                </button>
              )}
              <button
                disabled={pending}
                onClick={() => startTransition(() => markPlanStatus(plan.id, "cancelled"))}
                className="btn-ghost !py-1 !px-2 text-[11px]"
              >
                cancel
              </button>
            </>
          )}
          {plan.status === "cancelled" && (
            <button
              disabled={pending}
              onClick={() => startTransition(() => markPlanStatus(plan.id, "planned"))}
              className="btn-ghost !py-1 !px-2 text-[11px]"
            >
              undo
            </button>
          )}
          <button
            disabled={pending}
            onClick={() => startTransition(() => deletePlan(plan.id))}
            className="btn-ghost !py-1 !px-2 text-[11px] text-accent"
          >
            delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PlansClient({ plans, partnerNames }: { plans: Plan[]; partnerNames: { a: string; b: string } }) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [addingOn, setAddingOn] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"month" | "agenda">("month");

  const plansByDate = useMemo(() => {
    const map = new Map<string, Plan[]>();
    for (const plan of plans) {
      const list = map.get(plan.plan_date) ?? [];
      list.push(plan);
      map.set(plan.plan_date, list);
    }
    return map;
  }, [plans]);

  const cells = useMemo(() => {
    const firstOfMonth = new Date(Date.UTC(viewYear, viewMonth, 1));
    const startWeekday = firstOfMonth.getUTCDay();
    const daysInMonth = new Date(Date.UTC(viewYear, viewMonth + 1, 0)).getUTCDate();
    const daysInPrevMonth = new Date(Date.UTC(viewYear, viewMonth, 0)).getUTCDate();

    const result: { key: string; day: number; inMonth: boolean }[] = [];
    for (let i = startWeekday - 1; i >= 0; i--) {
      const day = daysInPrevMonth - i;
      const [y, m] = viewMonth === 0 ? [viewYear - 1, 11] : [viewYear, viewMonth - 1];
      result.push({ key: dateKey(y, m, day), day, inMonth: false });
    }
    for (let day = 1; day <= daysInMonth; day++) {
      result.push({ key: dateKey(viewYear, viewMonth, day), day, inMonth: true });
    }
    while (result.length % 7 !== 0 || result.length < 42) {
      const last = result[result.length - 1];
      const [ly, lm, ld] = last.key.split("-").map(Number);
      const nextUtc = new Date(Date.UTC(ly, lm - 1, ld + 1));
      result.push({
        key: dateKey(nextUtc.getUTCFullYear(), nextUtc.getUTCMonth(), nextUtc.getUTCDate()),
        day: nextUtc.getUTCDate(),
        inMonth: false,
      });
      if (result.length >= 42) break;
    }
    return result;
  }, [viewYear, viewMonth]);

  function goToMonth(delta: number) {
    let m = viewMonth + delta;
    let y = viewYear;
    if (m < 0) { m = 11; y -= 1; } else if (m > 11) { m = 0; y += 1; }
    setViewMonth(m);
    setViewYear(y);
  }
  function goToToday() {
    setViewYear(today.getFullYear());
    setViewMonth(today.getMonth());
    setSelectedDate(todayKey());
  }

  const selectedPlans = selectedDate ? plansByDate.get(selectedDate) ?? [] : [];
  const tKey = todayKey();

  const agendaPlans = useMemo(() => [...plans].sort((a, b) => (a.plan_date < b.plan_date ? -1 : 1)), [plans]);

  return (
    <div>
      <p className="font-hand text-4xl md:text-5xl leading-none mb-1">Our calendar 🗓</p>
      <p className="text-sm text-ink-soft mb-5">things we&apos;ve planned</p>

      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          {viewMode === "month" && (
            <>
              <button onClick={() => goToMonth(-1)} className="btn-ghost !py-1.5 !px-3 text-sm" aria-label="Previous month">‹</button>
              <p className="font-hand text-2xl min-w-[180px] text-center">
                {MONTH_NAMES[viewMonth]} {viewYear}
              </p>
              <button onClick={() => goToMonth(1)} className="btn-ghost !py-1.5 !px-3 text-sm" aria-label="Next month">›</button>
              <button onClick={goToToday} className="btn-ghost !py-1.5 !px-3 text-xs ml-1">today</button>
            </>
          )}
          <div className="flex rounded-full border border-ink/15 overflow-hidden ml-2">
            <button
              onClick={() => setViewMode("month")}
              className={`px-3 py-1.5 text-xs font-semibold ${viewMode === "month" ? "bg-ink text-white" : "text-ink-soft"}`}
            >
              month
            </button>
            <button
              onClick={() => setViewMode("agenda")}
              className={`px-3 py-1.5 text-xs font-semibold ${viewMode === "agenda" ? "bg-ink text-white" : "text-ink-soft"}`}
            >
              agenda
            </button>
          </div>
        </div>
        <button
          onClick={() => {
            setViewMode("month");
            setAddingOn(selectedDate ?? tKey);
            setSelectedDate(selectedDate ?? tKey);
          }}
          className="btn-primary !py-2 !px-4 text-sm"
        >
          + add plan
        </button>
      </div>

      {viewMode === "month" ? (
        <div className="card-panel p-2 sm:p-3 mb-6 overflow-x-auto">
          <div className="grid grid-cols-7 gap-1 min-w-[560px]">
            {WEEKDAYS.map((w) => (
              <div key={w} className="text-center text-[10px] font-bold uppercase tracking-wide text-ink-soft py-1.5">
                {w}
              </div>
            ))}
            {cells.map((cell) => {
              const dayPlans = plansByDate.get(cell.key) ?? [];
              const isToday = cell.key === tKey;
              const isSelected = cell.key === selectedDate;
              const visiblePlans = dayPlans.slice(0, 2);
              const extraCount = dayPlans.length - visiblePlans.length;

              return (
                <button
                  key={cell.key}
                  onClick={() => { setSelectedDate(cell.key); setAddingOn(null); }}
                  className={`text-left rounded-lg p-1.5 min-h-[86px] border transition flex flex-col gap-1 ${
                    isSelected ? "border-accent bg-peach/40" : "border-transparent hover:bg-black/[0.03] dark:hover:bg-white/[0.04]"
                  } ${!cell.inMonth ? "opacity-40" : ""}`}
                >
                  <span
                    className={`text-[11px] font-bold w-5 h-5 flex items-center justify-center rounded-full ${
                      isToday ? "bg-accent text-white" : "text-ink-soft"
                    }`}
                  >
                    {cell.day}
                  </span>
                  <div className="flex flex-col gap-0.5">
                    {visiblePlans.map((p) => {
                      const state = getPlanState(p);
                      return (
                        <span key={p.id} className={`text-[10px] leading-tight px-1.5 py-0.5 rounded truncate ${STATE_CHIP[state]}`}>
                          {p.title}
                        </span>
                      );
                    })}
                    {extraCount > 0 && <span className="text-[10px] text-ink-soft pl-1">+{extraCount} more</span>}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="space-y-2.5 mb-6">
          {agendaPlans.length === 0 && <p className="text-sm text-ink-soft">Nothing planned yet.</p>}
          {agendaPlans.map((p) => (
            <PlanDetailRow key={p.id} plan={p} names={partnerNames} />
          ))}
        </div>
      )}

      {viewMode === "month" && selectedDate && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="font-hand text-2xl">{formatFriendlyDate(selectedDate)}</p>
            <button onClick={() => setAddingOn(selectedDate)} className="btn-ghost !py-1.5 !px-3 text-xs">
              + add plan on this day
            </button>
          </div>

          {selectedPlans.length === 0 ? (
            <p className="text-sm text-ink-soft">Nothing planned for this day yet.</p>
          ) : (
            <div className="grid gap-2.5 sm:grid-cols-2">
              {selectedPlans.map((p) => (
                <PlanDetailRow key={p.id} plan={p} names={partnerNames} />
              ))}
            </div>
          )}
        </div>
      )}

      {viewMode === "month" && !selectedDate && <p className="text-sm text-ink-soft">Click any day to see or add plans.</p>}

      <div className="flex flex-wrap gap-3 mt-6 text-[11px] text-ink-soft">
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-ink/30" /> upcoming</span>
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-accent" /> completed</span>
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-ink/20" /> missed</span>
      </div>

      {addingOn && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          onClick={() => setAddingOn(null)}
        >
          <div className="w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <AddPlanForm defaultDate={addingOn} names={partnerNames} onDone={() => setAddingOn(null)} />
          </div>
        </div>
      )}
    </div>
  );
}
