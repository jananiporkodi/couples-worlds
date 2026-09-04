import { getNotes } from "@/lib/data";
import NoteCard from "@/components/notes/NoteCard";
import AddNoteForm from "@/components/notes/AddNoteForm";

export const dynamic = "force-dynamic";

export default async function NotesPage() {
  const notes = await getNotes();

  return (
    <div>
      <p className="font-hand text-4xl md:text-5xl leading-none mb-1">Notes to each other 💌</p>
      <p className="text-sm text-ink-soft mb-6">a shared journal, just for us</p>

      <div className="mb-6">
        <AddNoteForm />
      </div>

      {notes.length === 0 ? (
        <p className="text-sm text-ink-soft">No notes yet — write the first one.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {notes.map((n) => (
            <NoteCard key={n.id} note={n} />
          ))}
        </div>
      )}
    </div>
  );
}
