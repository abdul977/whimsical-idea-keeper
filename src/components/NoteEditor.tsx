import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mic, Square, Loader2, Plus, Trash } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface NoteEntry {
  id?: string;
  content: string;
  audio_url?: string;
  entry_order?: number;
  created_at?: string;
}

interface Note {
  id: string;
  title: string;
  entries: NoteEntry[];
  created_at: string;
}

interface NoteEditorProps {
  note?: Note;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (note: { id?: string; title: string; entries: NoteEntry[] }) => void;
}

export function NoteEditor({ note, open, onOpenChange, onSave }: NoteEditorProps) {
  const [title, setTitle] = useState(note?.title || "");
  const [entries, setEntries] = useState<NoteEntry[]>(
    note?.entries || [{ content: "", audio_url: undefined }]
  );
  const [recordingEntryIndex, setRecordingEntryIndex] = useState<number | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const { toast } = useToast();

  const startRecording = async (entryIndex: number) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      const chunks: BlobPart[] = [];
      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunks, { type: "audio/webm" });
        const file = new File([blob], `recording-${Date.now()}.webm`, {
          type: "audio/webm",
        });

        const { data, error } = await supabase.storage
          .from("audio_notes")
          .upload(`${crypto.randomUUID()}.webm`, file);

        if (error) {
          toast({
            title: "Error",
            description: "Failed to upload audio recording.",
            variant: "destructive",
          });
          return;
        }

        const { data: { publicUrl } } = supabase.storage
          .from("audio_notes")
          .getPublicUrl(data.path);

        setEntries((prev) =>
          prev.map((entry, idx) =>
            idx === entryIndex ? { ...entry, audio_url: publicUrl } : entry
          )
        );
      };

      mediaRecorder.start();
      setRecordingEntryIndex(entryIndex);
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not access microphone. Please check your permissions.",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recordingEntryIndex !== null) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
      setRecordingEntryIndex(null);
    }
  };

  const handleSave = () => {
    if (!title.trim()) {
      toast({
        title: "Error",
        description: "Please enter a title for your note.",
        variant: "destructive",
      });
      return;
    }

    const validEntries = entries.filter((entry) => entry.content.trim() || entry.audio_url);
    if (validEntries.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one entry with content or audio.",
        variant: "destructive",
      });
      return;
    }

    onSave({
      id: note?.id,
      title,
      entries: validEntries,
    });

    setTitle("");
    setEntries([{ content: "", audio_url: undefined }]);
    onOpenChange(false);
  };

  const addEntry = () => {
    setEntries([...entries, { content: "", audio_url: undefined }]);
  };

  const removeEntry = (index: number) => {
    if (entries.length > 1) {
      setEntries(entries.filter((_, idx) => idx !== index));
    }
  };

  const updateEntryContent = (index: number, content: string) => {
    setEntries(
      entries.map((entry, idx) => (idx === index ? { ...entry, content } : entry))
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>{note ? "Edit Note" : "Create Note"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Input
              placeholder="Note title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="space-y-4">
            {entries.map((entry, index) => (
              <div key={index} className="space-y-2 p-4 border rounded-lg relative">
                <Textarea
                  placeholder="Write your entry here..."
                  className="min-h-[100px]"
                  value={entry.content}
                  onChange={(e) => updateEntryContent(index, e.target.value)}
                />
                <div className="flex items-center space-x-4">
                  {recordingEntryIndex === index ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={stopRecording}
                      className="text-red-500"
                    >
                      <Square className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => startRecording(index)}
                      className="hover:text-red-500"
                      disabled={recordingEntryIndex !== null}
                    >
                      {recordingEntryIndex === null ? (
                        <Mic className="h-4 w-4" />
                      ) : (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      )}
                    </Button>
                  )}
                  {entry.audio_url && (
                    <audio controls src={entry.audio_url} className="flex-1" />
                  )}
                  {entries.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeEntry(index)}
                      className="hover:text-red-500 absolute top-2 right-2"
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={addEntry}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Entry
            </Button>
          </div>
        </div>
        <div className="flex justify-end">
          <Button onClick={handleSave}>Save Note</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}