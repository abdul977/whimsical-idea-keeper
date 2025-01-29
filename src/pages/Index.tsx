import { useState, useEffect } from "react";
import { CreateNoteButton } from "@/components/CreateNoteButton";
import { EmptyState } from "@/components/EmptyState";
import { NoteCard } from "@/components/NoteCard";
import { NoteEditor } from "@/components/NoteEditor";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  NotebookPen, 
  Sparkles, 
  Lightbulb, 
  Rocket, 
  Loader2, 
  PlusCircle 
} from "lucide-react";
import { ProcessingVariant } from "@/types/note";

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
  processingType: ProcessingVariant;
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
    mutationFn: async (noteData: { title: string, entries: { content: string; audio_url?: string }[], processingType: ProcessingVariant }) => {
      const { data: note, error: noteError } = await supabase
        .from('notes')
        .insert([{ 
          title: noteData.title,
          processing_type: noteData.processingType 
        }])
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
    mutationFn: async (noteData: { 
      id: string; 
      title: string; 
      entries: { id?: string; content: string; audio_url?: string }[];
      processingType: ProcessingVariant 
    }) => {
      const { error: noteError } = await supabase
        .from('notes')
        .update({ 
          title: noteData.title,
          processing_type: noteData.processingType 
        })
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
    createNoteMutation.mutate({
      ...noteData,
      processingType: ProcessingVariant.SUMMARY // Default processing type
    });
    setIsEditorOpen(false);
  };

  const handleUpdateNote = (noteData: { id: string; title: string; entries: { id?: string; content: string; audio_url?: string }[] }) => {
    updateNoteMutation.mutate({
      ...noteData,
      processingType: editingNote?.processingType || ProcessingVariant.SUMMARY // Preserve existing or use default
    });
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
      <div className="min-h-screen bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 flex justify-center items-center">
        <Loader2 className="h-16 w-16 text-white animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 py-10">
      <div className="container max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center mb-12 bg-white/20 backdrop-blur-sm rounded-xl p-6 shadow-2xl">
          <div className="flex items-center space-x-4">
            <NotebookPen className="h-10 w-10 text-white" />
            <h1 className="text-4xl font-bold text-white drop-shadow-lg">
              My Notes
            </h1>
          </div>
          <CreateNoteButton 
            onClick={() => setIsEditorOpen(true)} 
            className="bg-white/30 hover:bg-white/50 text-white transition-all duration-300 flex items-center space-x-2 px-4 py-2 rounded-full"
          >
            <PlusCircle className="h-5 w-5" />
            <span>New Note</span>
          </CreateNoteButton>
        </div>

        {notes.length === 0 ? (
          <div className="flex justify-center items-center">
            <EmptyState />
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {notes.map((note) => (
              <div 
                key={note.id} 
                className="transform transition-all duration-300 hover:scale-105 hover:shadow-2xl"
              >
                <NoteCard
                  note={note}
                  onEdit={handleEditNote}
                  onDelete={handleDeleteNote}
                  className="bg-white/20 backdrop-blur-sm rounded-xl border border-white/30 hover:border-white/50 transition-all duration-300"
                />
              </div>
            ))}
          </div>
        )}

        <div className="fixed bottom-8 right-8 flex items-center space-x-4">
          <div className="bg-white/30 backdrop-blur-sm p-3 rounded-full shadow-2xl animate-pulse">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <div className="bg-white/30 backdrop-blur-sm p-3 rounded-full shadow-2xl animate-bounce">
            <Lightbulb className="h-6 w-6 text-white" />
          </div>
          <div className="bg-white/30 backdrop-blur-sm p-3 rounded-full shadow-2xl hover:animate-spin">
            <Rocket className="h-6 w-6 text-white" />
          </div>
        </div>

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
    </div>
  );
};

export default Index;