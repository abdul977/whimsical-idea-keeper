import { Pencil, Trash2, PlayCircle, PauseCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useState, useRef } from "react";

interface Note {
  id: string;
  title: string;
  content: string;
  audioUrl?: string;
  createdAt: Date;
}

interface NoteCardProps {
  note: Note;
  onEdit: (note: Note) => void;
  onDelete: (id: string) => void;
}

export function NoteCard({ note, onEdit, onDelete }: NoteCardProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const toggleAudio = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <Card className="p-6 space-y-4 transition-all duration-200 hover:shadow-lg">
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <h3 className="font-semibold text-xl text-note-800">{note.title}</h3>
          <p className="text-sm text-muted-foreground">
            {new Date(note.createdAt).toLocaleDateString()}
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
      <p className="text-note-800 line-clamp-3">{note.content}</p>
      {note.audioUrl && (
        <div className="mt-4">
          <audio ref={audioRef} src={note.audioUrl} onEnded={() => setIsPlaying(false)} />
          <Button
            variant="outline"
            size="sm"
            onClick={toggleAudio}
            className="flex items-center space-x-2"
          >
            {isPlaying ? (
              <PauseCircle className="h-4 w-4" />
            ) : (
              <PlayCircle className="h-4 w-4" />
            )}
            <span>{isPlaying ? "Pause" : "Play"} Recording</span>
          </Button>
        </div>
      )}
    </Card>
  );
}