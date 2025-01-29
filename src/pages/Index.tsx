import { useState } from "react";
import { CreateNoteButton } from "@/components/CreateNoteButton";
import { EmptyState } from "@/components/EmptyState";
import { NoteCard } from "@/components/NoteCard";
import { NoteEditor } from "@/components/NoteEditor";
import { useToast } from "@/components/ui/use-toast";

interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
}

const Index = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | undefined>();
  const { toast } = useToast();

  const handleCreateNote = (noteData: Omit<Note, "id" | "createdAt">) => {
    const newNote: Note = {
      ...noteData,
      id: crypto.randomUUID(),
      createdAt: new Date(),
    };
    setNotes((prev) => [newNote, ...prev]);
    toast({
      title: "Note created",
      description: "Your note has been created successfully.",
    });
  };

  const handleEditNote = (note: Note) => {
    setEditingNote(note);
    setIsEditorOpen(true);
  };

  const handleUpdateNote = (noteData: Omit<Note, "id" | "createdAt">) => {
    if (!editingNote) return;
    const updatedNote = {
      ...editingNote,
      ...noteData,
    };
    setNotes((prev) =>
      prev.map((note) => (note.id === editingNote.id ? updatedNote : note))
    );
    setEditingNote(undefined);
    toast({
      title: "Note updated",
      description: "Your note has been updated successfully.",
    });
  };

  const handleDeleteNote = (id: string) => {
    setNotes((prev) => prev.filter((note) => note.id !== id));
    toast({
      title: "Note deleted",
      description: "Your note has been deleted successfully.",
      variant: "destructive",
    });
  };

  return (
    <div className="container py-10 max-w-4xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-note-800">My Notes</h1>
        <CreateNoteButton onClick={() => setIsEditorOpen(true)} />
      </div>

      {notes.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {notes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              onEdit={handleEditNote}
              onDelete={handleDeleteNote}
            />
          ))}
        </div>
      )}

      <NoteEditor
        note={editingNote}
        open={isEditorOpen}
        onOpenChange={(open) => {
          setIsEditorOpen(open);
          if (!open) setEditingNote(undefined);
        }}
        onSave={editingNote ? handleUpdateNote : handleCreateNote}
      />
    </div>
  );
};

export default Index;