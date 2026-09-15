"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import { useFormStatus } from "react-dom";
import type { PartnerAssignee, Todo, TodoPriority } from "@/lib/types";
import { formatFriendlyDate, daysUntil } from "@/lib/dates";
import {
  addTodo,
  updateTodo,
  toggleTodoStatus,
  deleteTodo,
  reorderTodos,
  convertTodoToPlan,
} from "@/app/(app)/todos/actions";

function assigneeLabel(assignee: PartnerAssignee, names: { a: string; b: string }): string {
  if (assignee === "partner_a") return names.a;
  if (assignee === "partner_b") return names.b;
  return "Both";
}

function SubmitButton({ label, pendingLabel }: { label: string; pendingLabel: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-primary !py-2 !px-4 text-sm" disabled={pending}>
      {pending ? pendingLabel : label}
    </button>
  );
}

function TodoForm({
  names,
  initial,
  onDone,
}: {
  names: { a: string; b: string };
  initial?: Todo;
  onDone: () => void;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const action = initial ? updateTodo : addTodo;

  return (
    <form
      ref={formRef}
      action={async (formData) => {
        if (initial) formData.set("todoId", initial.id);
        await action(formData);
        formRef.current?.reset();
        onDone();
      }}
      className="card-panel p-4 space-y-2.5"
    >
      <input
        name="title"
        placeholder="Buy groceries"
        defaultValue={initial?.title ?? ""}
        className="input-field"
        required
      />
      <input
        name="note"
        placeholder="Note (optional)"
        defaultValue={initial?.note ?? ""}
        className="input-field"
      />
      <div className="grid grid-cols-2 gap-2.5">
        <input
          type="date"
          name="dueDate"
          defaultValue={initial?.due_date ?? ""}
          className="input-field"
        />
        <select name="priority" defaultValue={initial?.priority ?? "normal"} className="input-field">
          <option value="normal">Normal</option>
          <option value="important">Important</option>
        </select>
      </div>
      <select name="assignee" defaultValue={initial?.assignee ?? "both"} className="input-field">
        <option value="both">Both</option>
        <option value="partner_a">{names.a}</option>
        <option value="partner_b">{names.b}</option>
      </select>
      <div className="flex gap-2 pt-1">
        <SubmitButton label={initial ? "save changes" : "+ add task"} pendingLabel={initial ? "Saving…" : "Adding…"} />
        <button type="button" onClick={onDone} className="btn-ghost !py-2 !px-3 text-sm">
          cancel
        </button>
      </div>
    </form>
  );
}

function TodoRow({
  todo,
  names,
  onMove,
  isFirst,
  isLast,
}: {
  todo: Todo;
  names: { a: string; b: string };
  onMove: (id: string, dir: -1 | 1) => void;
  isFirst: boolean;
  isLast: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const [editing, setEditing] = useState(false);
  const [convertingOn, setConvertingOn] = useState<string | null>(null);
  const isDone = todo.status === "done";
  const overdue = !isDone && todo.due_date && daysUntil(todo.due_date) < 0;

  if (editing) {
    return (
      <div className="card-panel p-3">
        <TodoForm names={names} initial={todo} onDone={() => setEditing(false)} />
      </div>
    );
  }

  return (
    <div className={`card-panel p-3 flex items-start gap-3 ${isDone ? "opacity-55" : ""}`}>
      <button
        onClick={() => startTransition(() => toggleTodoStatus(todo.id, !isDone))}
        disabled={pending}
        className={`mt-0.5 w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center text-[11px] ${
          isDone ? "bg-bezel border-bezel text-white" : "border-ink/30"
        }`}
        aria-label={isDone ? "Mark as not done" : "Mark as done"}
      >
        {isDone ? "✓" : ""}
      </button>

      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold ${isDone ? "line-through text-ink-soft" : "text-ink"}`}>
          {todo.title}
          {todo.priority === "important" && !isDone && (
            <span className="ml-1.5 text-[10px] font-bold text-accent uppercase tracking-wide">important</span>
          )}
        </p>
        {todo.note && <p className="text-xs text-ink-soft mt-0.5">{todo.note}</p>}
        <div className="flex flex-wrap items-center gap-2 mt-1">
          <span className="text-[10px] font-semibold text-ink-soft">{assigneeLabel(todo.assignee, names)}</span>
          {todo.due_date && (
            <span className={`text-[10px] font-bold ${overdue ? "text-accent" : "text-ink-soft"}`}>
              {overdue ? "overdue · " : ""}
              {formatFriendlyDate(todo.due_date)}
            </span>
          )}
        </div>

        {convertingOn !== null && (
          <form
            action={async (formData) => {
              const date = String(formData.get("planDate") ?? "");
              await convertTodoToPlan(todo.id, date);
              setConvertingOn(null);
            }}
            className="flex gap-1.5 mt-2"
          >
            <input type="date" name="planDate" defaultValue={todo.due_date ?? ""} className="input-field !py-1 text-xs" required />
            <button type="submit" className="btn-ghost !py-1 !px-2 text-[11px]">
              confirm
            </button>
            <button type="button" onClick={() => setConvertingOn(null)} className="btn-ghost !py-1 !px-2 text-[11px]">
              cancel
            </button>
          </form>
        )}
      </div>

      <div className="flex flex-col gap-1 flex-shrink-0 items-end">
        {!isDone && (
          <div className="flex gap-0.5">
            <button
              onClick={() => onMove(todo.id, -1)}
              disabled={isFirst}
              className="btn-ghost !py-0.5 !px-1.5 text-[11px] disabled:opacity-30"
              aria-label="Move up"
            >
              ↑
            </button>
            <button
              onClick={() => onMove(todo.id, 1)}
              disabled={isLast}
              className="btn-ghost !py-0.5 !px-1.5 text-[11px] disabled:opacity-30"
              aria-label="Move down"
            >
              ↓
            </button>
          </div>
        )}
        <div className="flex gap-1">
          {!isDone && convertingOn === null && (
            <button onClick={() => setConvertingOn(todo.id)} className="btn-ghost !py-1 !px-2 text-[10px]">
              → plan
            </button>
          )}
          <button onClick={() => setEditing(true)} className="btn-ghost !py-1 !px-2 text-[10px]">
            edit
          </button>
          <button
            onClick={() => startTransition(() => deleteTodo(todo.id))}
            className="btn-ghost !py-1 !px-2 text-[10px] text-accent"
          >
            delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default function TodosClient({
  todos,
  partnerNames,
}: {
  todos: Todo[];
  partnerNames: { a: string; b: string };
}) {
  const [open, setOpen] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);
  const [, startTransition] = useTransition();

  const active = useMemo(() => todos.filter((t) => t.status === "active"), [todos]);
  const completed = useMemo(() => todos.filter((t) => t.status === "done"), [todos]);

  function handleMove(id: string, dir: -1 | 1) {
    const ids = active.map((t) => t.id);
    const idx = ids.indexOf(id);
    const targetIdx = idx + dir;
    if (targetIdx < 0 || targetIdx >= ids.length) return;
    [ids[idx], ids[targetIdx]] = [ids[targetIdx], ids[idx]];
    startTransition(() => reorderTodos(ids));
  }

  return (
    <div>
      <p className="font-hand text-4xl md:text-5xl leading-none mb-1">To-do ☑</p>
      <p className="text-sm text-ink-soft mb-6">the everyday things we need to get done</p>

      <div className="mb-6">
        {open ? (
          <TodoForm names={partnerNames} onDone={() => setOpen(false)} />
        ) : (
          <button onClick={() => setOpen(true)} className="btn-primary w-full sm:w-auto">
            + add a task
          </button>
        )}
      </div>

      {active.length === 0 ? (
        <p className="text-sm text-ink-soft mb-6">Nothing to do right now — enjoy it.</p>
      ) : (
        <div className="space-y-2 mb-6">
          {active.map((t, i) => (
            <TodoRow
              key={t.id}
              todo={t}
              names={partnerNames}
              onMove={handleMove}
              isFirst={i === 0}
              isLast={i === active.length - 1}
            />
          ))}
        </div>
      )}

      {completed.length > 0 && (
        <div>
          <button
            onClick={() => setShowCompleted((s) => !s)}
            className="text-[11px] font-bold uppercase tracking-wide text-ink-soft mb-2"
          >
            {showCompleted ? "▾" : "▸"} Completed ({completed.length})
          </button>
          {showCompleted && (
            <div className="space-y-2">
              {completed.map((t) => (
                <TodoRow key={t.id} todo={t} names={partnerNames} onMove={handleMove} isFirst isLast />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
