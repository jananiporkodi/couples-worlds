"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { PartnerAssignee, TodoPriority } from "@/lib/types";

export async function addTodo(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  if (!title) return;
  const note = String(formData.get("note") ?? "").trim() || null;
  const dueDate = String(formData.get("dueDate") ?? "").trim() || null;
  const priority = (String(formData.get("priority") ?? "normal").trim() || "normal") as TodoPriority;
  const assignee = (String(formData.get("assignee") ?? "both").trim() || "both") as PartnerAssignee;

  const supabase = getSupabaseServerClient();
  const { error } = await supabase.from("todos").insert({
    title,
    note,
    due_date: dueDate,
    priority,
    assignee,
  });
  if (error) throw error;

  revalidatePath("/todos");
  revalidatePath("/");
}

export async function updateTodo(formData: FormData) {
  const todoId = String(formData.get("todoId") ?? "").trim();
  if (!todoId) return;
  const title = String(formData.get("title") ?? "").trim();
  const note = String(formData.get("note") ?? "").trim() || null;
  const dueDate = String(formData.get("dueDate") ?? "").trim() || null;
  const priority = (String(formData.get("priority") ?? "normal").trim() || "normal") as TodoPriority;
  const assignee = (String(formData.get("assignee") ?? "both").trim() || "both") as PartnerAssignee;

  const supabase = getSupabaseServerClient();
  const { error } = await supabase
    .from("todos")
    .update({ title, note, due_date: dueDate, priority, assignee })
    .eq("id", todoId);
  if (error) throw error;

  revalidatePath("/todos");
  revalidatePath("/");
}

export async function toggleTodoStatus(todoId: string, done: boolean) {
  if (!todoId) return;
  const supabase = getSupabaseServerClient();
  const { error } = await supabase
    .from("todos")
    .update({ status: done ? "done" : "active", completed_at: done ? new Date().toISOString() : null })
    .eq("id", todoId);
  if (error) throw error;

  revalidatePath("/todos");
  revalidatePath("/");
}

export async function deleteTodo(todoId: string) {
  if (!todoId) return;
  const supabase = getSupabaseServerClient();
  const { error } = await supabase.from("todos").delete().eq("id", todoId);
  if (error) throw error;

  revalidatePath("/todos");
  revalidatePath("/");
}

export async function reorderTodos(orderedIds: string[]) {
  if (!orderedIds.length) return;
  const supabase = getSupabaseServerClient();
  await Promise.all(
    orderedIds.map((id, index) => supabase.from("todos").update({ position: index }).eq("id", id))
  );
  revalidatePath("/todos");
}

export async function convertTodoToPlan(todoId: string, planDate: string) {
  if (!todoId || !planDate) return;
  const supabase = getSupabaseServerClient();

  const { data: todo, error: fetchError } = await supabase.from("todos").select("*").eq("id", todoId).single();
  if (fetchError) throw fetchError;

  const { error: insertError } = await supabase.from("plans").insert({
    title: todo.title,
    description: todo.note,
    plan_date: planDate,
    person: todo.assignee,
  });
  if (insertError) throw insertError;

  revalidatePath("/todos");
  revalidatePath("/plans");
  revalidatePath("/");
}
