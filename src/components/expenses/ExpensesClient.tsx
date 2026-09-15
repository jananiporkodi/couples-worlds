"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import { useFormStatus } from "react-dom";
import type { Expense, PartnerAssignee } from "@/lib/types";
import { EXPENSE_CATEGORIES } from "@/lib/types";
import { todayIST, formatFriendlyDate } from "@/lib/dates";
import { addExpense, updateExpense, deleteExpense } from "@/app/(app)/expenses/actions";

function formatINR(n: number): string {
  return `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
}

function monthLabel(ym: string): string {
  const [y, m] = ym.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, 1)).toLocaleDateString("en-US", { month: "long", year: "numeric", timeZone: "UTC" });
}

/** First and last day of the calendar month containing `dateStr` (a "YYYY-MM-DD" string). */
function currentMonthBounds(dateStr: string): { from: string; to: string } {
  const [y, m] = dateStr.split("-").map(Number);
  const from = `${y}-${String(m).padStart(2, "0")}-01`;
  const lastDay = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const to = `${y}-${String(m).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
  return { from, to };
}

function categoryMeta(key: string) {
  return EXPENSE_CATEGORIES.find((c) => c.key === key) ?? EXPENSE_CATEGORIES[EXPENSE_CATEGORIES.length - 1];
}

function SubmitButton({ label, pendingLabel }: { label: string; pendingLabel: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-primary !py-2 !px-4 text-sm" disabled={pending}>
      {pending ? pendingLabel : label}
    </button>
  );
}

function ExpenseForm({
  expense,
  names,
  defaultPaidBy,
  onDone,
}: {
  expense?: Expense;
  names: { a: string; b: string };
  defaultPaidBy: "partner_a" | "partner_b";
  onDone: () => void;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const isEdit = Boolean(expense);

  return (
    <form
      ref={formRef}
      action={async (formData) => {
        if (isEdit && expense) {
          formData.set("expenseId", expense.id);
          await updateExpense(formData);
        } else {
          await addExpense(formData);
          formRef.current?.reset();
        }
        onDone();
      }}
      className="card-panel p-4 space-y-2.5"
    >
      <p className="font-hand text-xl">{isEdit ? "Edit expense" : "Add an expense"}</p>
      <div className="flex flex-wrap items-center gap-2">
        <input
          name="title"
          defaultValue={expense?.title}
          placeholder="Groceries, dinner, cab…"
          className="input-field flex-1 min-w-[160px]"
          required
        />
        <input
          type="number"
          name="amount"
          defaultValue={expense?.amount}
          step="0.01"
          min="0"
          placeholder="Amount (₹)"
          className="input-field !w-28"
          required
        />
        <input
          type="date"
          name="expenseDate"
          defaultValue={expense?.expense_date ?? todayIST()}
          className="input-field !w-[150px]"
          required
        />
        <select name="category" defaultValue={expense?.category ?? "other"} className="input-field !w-auto">
          {EXPENSE_CATEGORIES.map((c) => (
            <option key={c.key} value={c.key}>
              {c.emoji} {c.label}
            </option>
          ))}
        </select>
        <select name="paidBy" defaultValue={expense?.paid_by ?? defaultPaidBy} className="input-field !w-auto">
          <option value="partner_a">Paid by {names.a}</option>
          <option value="partner_b">Paid by {names.b}</option>
        </select>
        <input
          name="notes"
          defaultValue={expense?.notes ?? ""}
          placeholder="Notes (optional)"
          className="input-field flex-1 min-w-[140px]"
        />
        <label className="flex items-center gap-1.5 text-xs text-ink-soft whitespace-nowrap">
          <input type="checkbox" name="isShared" defaultChecked={expense?.is_shared ?? true} className="w-4 h-4" />
          split equally
        </label>
        <SubmitButton label={isEdit ? "save changes" : "add expense"} pendingLabel={isEdit ? "Saving…" : "Adding…"} />
        <button type="button" onClick={onDone} className="btn-ghost !py-2 !px-3 text-sm">
          cancel
        </button>
      </div>
    </form>
  );
}

function BarRow({ label, emoji, amount, max }: { label: string; emoji: string; amount: number; max: number }) {
  const pct = max > 0 ? Math.max(4, Math.round((amount / max) * 100)) : 0;
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span>
          {emoji} {label}
        </span>
        <span className="font-bold">{formatINR(amount)}</span>
      </div>
      <div className="h-2 rounded-full bg-black/[0.05] dark:bg-white/10 overflow-hidden">
        <div className="h-full rounded-full bg-accent" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function ExpensesClient({
  expenses,
  partnerNames,
  currentPartner,
}: {
  expenses: Expense[];
  partnerNames: { a: string; b: string };
  currentPartner: PartnerAssignee | null;
}) {
  const defaultRange = useMemo(() => currentMonthBounds(todayIST()), []);
  const [from, setFrom] = useState(defaultRange.from);
  const [to, setTo] = useState(defaultRange.to);
  const [adding, setAdding] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [deletePending, startDeleteTransition] = useTransition();

  const defaultPaidBy: "partner_a" | "partner_b" =
    currentPartner === "partner_a" || currentPartner === "partner_b" ? currentPartner : "partner_a";

  function resetToThisMonth() {
    const bounds = currentMonthBounds(todayIST());
    setFrom(bounds.from);
    setTo(bounds.to);
  }

  function showAllTime() {
    if (expenses.length === 0) return;
    const dates = expenses.map((e) => e.expense_date);
    setFrom(dates.reduce((a, b) => (a < b ? a : b)));
    setTo(dates.reduce((a, b) => (a > b ? a : b)));
  }

  const filtered = useMemo(
    () => expenses.filter((e) => e.expense_date >= from && e.expense_date <= to),
    [expenses, from, to]
  );

  const grouped = useMemo(() => {
    const map = new Map<string, Expense[]>();
    for (const e of filtered) {
      const key = e.expense_date.slice(0, 7);
      const list = map.get(key) ?? [];
      list.push(e);
      map.set(key, list);
    }
    return Array.from(map.entries()).sort((a, b) => (a[0] < b[0] ? 1 : -1));
  }, [filtered]);

  const stats = useMemo(() => {
    let total = 0;
    let sharedByA = 0;
    let sharedByB = 0;
    let totalByA = 0;
    let totalByB = 0;
    const byCategory = new Map<string, number>();

    for (const e of filtered) {
      total += e.amount;
      byCategory.set(e.category, (byCategory.get(e.category) ?? 0) + e.amount);
      if (e.paid_by === "partner_a") totalByA += e.amount;
      else totalByB += e.amount;
      if (e.is_shared) {
        if (e.paid_by === "partner_a") sharedByA += e.amount;
        else sharedByB += e.amount;
      }
    }

    const balance = (sharedByA - sharedByB) / 2; // positive: B owes A; negative: A owes B
    const categories = Array.from(byCategory.entries())
      .map(([key, amount]) => ({ key, amount }))
      .sort((a, b) => b.amount - a.amount);
    const maxCategory = categories[0]?.amount ?? 0;

    return { total, totalByA, totalByB, balance, categories, maxCategory };
  }, [filtered]);

  return (
    <div>
      <p className="font-hand text-4xl md:text-5xl leading-none mb-1">Our expenses 💰</p>
      <p className="text-sm text-ink-soft mb-5">what we&apos;ve spent, split fairly</p>

      <div className="flex flex-wrap items-end gap-2 mb-5">
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wide text-ink-soft mb-1">From</label>
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="input-field !w-auto text-sm" />
        </div>
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wide text-ink-soft mb-1">To</label>
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="input-field !w-auto text-sm" />
        </div>
        <button onClick={resetToThisMonth} className="btn-ghost !py-2 !px-3 text-xs">
          this month
        </button>
        <button onClick={showAllTime} className="btn-ghost !py-2 !px-3 text-xs">
          all time
        </button>
        <button onClick={() => setAdding(true)} className="btn-primary !py-2 !px-4 text-sm ml-auto">
          + add expense
        </button>
      </div>

      {adding && (
        <div className="mb-5">
          <ExpenseForm names={partnerNames} defaultPaidBy={defaultPaidBy} onDone={() => setAdding(false)} />
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-3 mb-5">
        <div className="card-panel p-4">
          <p className="text-[10px] font-bold uppercase tracking-wide text-ink-soft mb-1">Spent in range</p>
          <p className="text-2xl font-bold">{formatINR(stats.total)}</p>
        </div>
        <div className="card-panel p-4">
          <p className="text-[10px] font-bold uppercase tracking-wide text-ink-soft mb-1">Paid by each</p>
          <p className="text-sm">
            {partnerNames.a}: <span className="font-bold">{formatINR(stats.totalByA)}</span>
          </p>
          <p className="text-sm">
            {partnerNames.b}: <span className="font-bold">{formatINR(stats.totalByB)}</span>
          </p>
        </div>
        <div className="card-panel p-4">
          <p className="text-[10px] font-bold uppercase tracking-wide text-ink-soft mb-1">Split balance</p>
          {Math.round(Math.abs(stats.balance) * 100) === 0 ? (
            <p className="text-sm font-bold text-ink-soft">all settled up 🎉</p>
          ) : stats.balance > 0 ? (
            <p className="text-sm">
              {partnerNames.b} owes {partnerNames.a}{" "}
              <span className="font-bold text-accent">{formatINR(stats.balance)}</span>
            </p>
          ) : (
            <p className="text-sm">
              {partnerNames.a} owes {partnerNames.b}{" "}
              <span className="font-bold text-accent">{formatINR(Math.abs(stats.balance))}</span>
            </p>
          )}
        </div>
      </div>

      {stats.categories.length > 0 && (
        <div className="card-panel p-5 mb-5">
          <p className="text-[11px] font-bold uppercase tracking-wide text-ink-soft mb-3">By category</p>
          <div className="space-y-2.5">
            {stats.categories.map((c) => {
              const meta = categoryMeta(c.key);
              return <BarRow key={c.key} label={meta.label} emoji={meta.emoji} amount={c.amount} max={stats.maxCategory} />;
            })}
          </div>
        </div>
      )}

      {grouped.length === 0 ? (
        <p className="text-sm text-ink-soft">No expenses logged in this range.</p>
      ) : (
        grouped.map(([monthKey, items]) => (
          <div key={monthKey} className="mb-6">
            <p className="font-hand text-xl mb-2">{monthLabel(monthKey)}</p>
            <div className="card-panel p-0 overflow-x-auto">
              <table className="w-full text-sm min-w-[640px]">
                <thead>
                  <tr className="text-left text-[10px] font-bold uppercase tracking-wide text-ink-soft border-b border-black/10 dark:border-white/10">
                    <th className="py-2 px-3">Date</th>
                    <th className="py-2 px-3">Title</th>
                    <th className="py-2 px-3">Category</th>
                    <th className="py-2 px-3">Paid by</th>
                    <th className="py-2 px-3">Split</th>
                    <th className="py-2 px-3 text-right">Amount</th>
                    <th className="py-2 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((e) => {
                    const meta = categoryMeta(e.category);
                    const payerName = e.paid_by === "partner_a" ? partnerNames.a : partnerNames.b;
                    return (
                      <tr key={e.id} className="border-b last:border-0 border-black/[0.05] dark:border-white/5">
                        <td className="py-2 px-3 whitespace-nowrap text-ink-soft text-xs">
                          {formatFriendlyDate(e.expense_date)}
                        </td>
                        <td className="py-2 px-3">
                          <p className="font-semibold truncate max-w-[180px]">{e.title}</p>
                          {e.notes && <p className="text-[11px] text-ink-soft italic truncate max-w-[180px]">{e.notes}</p>}
                        </td>
                        <td className="py-2 px-3 whitespace-nowrap text-xs">
                          {meta.emoji} {meta.label}
                        </td>
                        <td className="py-2 px-3 whitespace-nowrap text-xs">{payerName}</td>
                        <td className="py-2 px-3 whitespace-nowrap text-xs">{e.is_shared ? "split" : "personal"}</td>
                        <td className="py-2 px-3 whitespace-nowrap text-right font-bold">{formatINR(e.amount)}</td>
                        <td className="py-2 px-3 whitespace-nowrap text-right">
                          <button
                            onClick={() => setEditingExpense(e)}
                            className="text-[11px] text-ink-soft underline underline-offset-2 mr-2.5"
                          >
                            edit
                          </button>
                          <button
                            disabled={deletePending}
                            onClick={() => startDeleteTransition(() => deleteExpense(e.id))}
                            className="text-[11px] text-accent underline underline-offset-2"
                          >
                            delete
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ))
      )}

      {editingExpense && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          onClick={() => setEditingExpense(null)}
        >
          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <ExpenseForm
              expense={editingExpense}
              names={partnerNames}
              defaultPaidBy={editingExpense.paid_by}
              onDone={() => setEditingExpense(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
