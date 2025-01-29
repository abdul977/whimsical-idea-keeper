export interface NoteEntry {
  id?: string;
  content: string;
  audio_url?: string;
  audioTranscription?: string;
  entry_order?: number;
  created_at?: string;
}

export enum ProcessingVariant {
  ACTIONABLE = 'actionable',
  SUMMARY = 'summary',
  REASONING = 'reasoning',
  GRAMMAR = 'grammar'
}

export interface Note {
  id?: string;
  title: string;
  entries: NoteEntry[];
  processingType: ProcessingVariant;
  created_at?: string;
}