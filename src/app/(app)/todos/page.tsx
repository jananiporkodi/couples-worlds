import { getTodos, getPartnerNames } from "@/lib/data";
import TodosClient from "@/components/todos/TodosClient";

export const dynamic = "force-dynamic";

export default async function TodosPage() {
  const [todos, partnerNames] = await Promise.all([getTodos(), getPartnerNames()]);
  return <TodosClient todos={todos} partnerNames={partnerNames} />;
}
