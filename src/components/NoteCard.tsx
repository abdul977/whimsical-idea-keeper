import { Pencil, Trash2, PlayCircle, PauseCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useState, useRef } from "react";

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

interface NoteCardProps {
  note: Note;
  onEdit: (note: Note) => void;
  onDelete: (id: string) => void;
}

export function NoteCard({ note, onEdit, onDelete }: NoteCardProps) {
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const audioRefs = useRef<{ [key: string]: HTMLAudioElement | null }>({});

  const toggleAudio = (entryId: string, audioUrl?: string) => {
    if (!audioUrl || !audioRefs.current[entryId]) return;

    if (playingAudioId === entryId) {
      audioRefs.current[entryId]?.pause();
      setPlayingAudioId(null);
    } else {
      // Pause any currently playing audio
      if (playingAudioId && audioRefs.current[playingAudioId]) {
        audioRefs.current[playingAudioId]?.pause();
      }
      audioRefs.current[entryId]?.play();
      setPlayingAudioId(entryId);
    }
  };

  return (
    <Card className="p-6 space-y-4 transition-all duration-200 hover:shadow-lg">
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <h3 className="font-semibold text-xl text-note-800">{note.title}</h3>
          <p className="text-sm text-muted-foreground">
            {new Date(note.created_at).toLocaleDateString()}
          </p>
        </div>
        <div className="space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(note)}
            className="hover:text-blue-500"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(note.id)}
            className="hover:text-red-500"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="space-y-4">
        {note.entries.map((entry) => (
          <div key={entry.id} className="space-y-2">
            <p className="text-note-800">{entry.content}</p>
            {entry.audio_url && (
              <div>
                <audio
                  ref={(el) => (audioRefs.current[entry.id] = el)}
                  src={entry.audio_url}
                  onEnded={() => setPlayingAudioId(null)}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleAudio(entry.id, entry.audio_url)}
                  className="flex items-center space-x-2"
                >
                  {playingAudioId === entry.id ? (
                    <PauseCircle className="h-4 w-4" />
                  ) : (
                    <PlayCircle className="h-4 w-4" />
                  )}
                  <span>
                    {playingAudioId === entry.id ? "Pause" : "Play"} Recording
                  </span>
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}