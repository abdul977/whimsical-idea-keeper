import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CreateNoteButtonProps {
  onClick: () => void;
}

export function CreateNoteButton({ onClick }: CreateNoteButtonProps) {
  return (
    <Button
      onClick={onClick}
      className="flex items-center space-x-2 bg-note-800 hover:bg-note-900 text-white"
    >
      <Plus className="h-4 w-4" />
      <span>New Note</span>
    </Button>
  );
}