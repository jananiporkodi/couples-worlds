import { getNotes } from "@/lib/data";
import NotesTabs from "@/components/notes/NotesTabs";
import AddNoteForm from "@/components/notes/AddNoteForm";

export const dynamic = "force-dynamic";

export default async function NotesPage() {
  const notes = await getNotes();

  return (
    <div>
      <p className="font-hand text-4xl md:text-5xl leading-none mb-1">Love Jar 🫙</p>
      <p className="text-sm text-ink-soft mb-6">little notes to each other, saved for later</p>

      <div className="mb-6">
        <AddNoteForm />
      </div>

      <NotesTabs notes={notes} />
    </div>
  );
}
