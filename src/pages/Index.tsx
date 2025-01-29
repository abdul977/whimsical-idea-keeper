import { useState, useEffect } from "react";
import { CreateNoteButton } from "@/components/CreateNoteButton";
import { EmptyState } from "@/components/EmptyState";
import { NoteCard } from "@/components/NoteCard";
import { NoteEditor } from "@/components/NoteEditor";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface NoteEntry {
  id: string;
  content: string;
  audio_url?: string;
  entry_order: number;
  created_at: string;
}

interface Note {
  id: string;
  title: string;
  entries: NoteEntry[];
  created_at: string;
}

const Index = () => {
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | undefined>();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: notes = [], isLoading } = useQuery({
    queryKey: ['notes'],
    queryFn: async () => {
      const { data: notesData, error: notesError } = await supabase
        .from('notes')
        .select(`
          id,
          title,
          created_at,
          note_entries (
            id,
            content,
            audio_url,
            entry_order,
            created_at
          )
        `)
        .order('created_at', { ascending: false });

      if (notesError) throw notesError;

      return notesData.map((note: any) => ({
        ...note,
        entries: note.note_entries.sort((a: NoteEntry, b: NoteEntry) => a.entry_order - b.entry_order),
      }));
    },
  });

  const createNoteMutation = useMutation({
    mutationFn: async (noteData: { title: string, entries: { content: string; audio_url?: string }[] }) => {
      const { data: note, error: noteError } = await supabase
        .from('notes')
        .insert([{ title: noteData.title }])
        .select()
        .single();

      if (noteError) throw noteError;

      const entries = noteData.entries.map((entry, index) => ({
        note_id: note.id,
        content: entry.content,
        audio_url: entry.audio_url,
        entry_order: index,
      }));

      const { error: entriesError } = await supabase
        .from('note_entries')
        .insert(entries);

      if (entriesError) throw entriesError;

      return note;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      toast({
        title: "Note created",
        description: "Your note has been created successfully.",
      });
    },
  });

  const updateNoteMutation = useMutation({
    mutationFn: async (noteData: { id: string; title: string; entries: { id?: string; content: string; audio_url?: string }[] }) => {
      const { error: noteError } = await supabase
        .from('notes')
        .update({ title: noteData.title })
        .eq('id', noteData.id);

      if (noteError) throw noteError;

      // Delete existing entries
      const { error: deleteError } = await supabase
        .from('note_entries')
        .delete()
        .eq('note_id', noteData.id);

      if (deleteError) throw deleteError;

      // Insert new entries
      const entries = noteData.entries.map((entry, index) => ({
        note_id: noteData.id,
        content: entry.content,
        audio_url: entry.audio_url,
        entry_order: index,
      }));

      const { error: entriesError } = await supabase
        .from('note_entries')
        .insert(entries);

      if (entriesError) throw entriesError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      toast({
        title: "Note updated",
        description: "Your note has been updated successfully.",
      });
    },
  });

  const deleteNoteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      toast({
        title: "Note deleted",
        description: "Your note has been deleted successfully.",
        variant: "destructive",
      });
    },
  });

  const handleCreateNote = (noteData: { title: string; entries: { content: string; audio_url?: string }[] }) => {
    createNoteMutation.mutate(noteData);
    setIsEditorOpen(false);
  };

  const handleUpdateNote = (noteData: { id: string; title: string; entries: { id?: string; content: string; audio_url?: string }[] }) => {
    updateNoteMutation.mutate(noteData);
    setEditingNote(undefined);
    setIsEditorOpen(false);
  };

  const handleEditNote = (note: Note) => {
    setEditingNote(note);
    setIsEditorOpen(true);
  };

  const handleDeleteNote = (id: string) => {
    deleteNoteMutation.mutate(id);
  };

  if (isLoading) {
    return (
      <div className="container py-10 max-w-4xl">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
        </div>
      </div>
    );
  }

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