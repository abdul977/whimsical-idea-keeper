import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';

export interface Collaborator {
  user_id: string;
  email?: string;
  display_name?: string;
  permission: 'view' | 'edit';
  joined_at: string;
}

export async function inviteCollaborator(
  noteId: string, 
  collaborator: Omit<Collaborator, 'joined_at'>
): Promise<boolean> {
  try {
    // Fetch current note to get existing collaborators
    const { data: noteData, error: fetchError } = await supabase
      .from('notes')
      .select('collaborators')
      .eq('id', noteId)
      .single();

    if (fetchError) {
      throw fetchError;
    }

    // Parse existing collaborators or initialize empty array
    const existingCollaborators: Collaborator[] = noteData.collaborators 
      ? JSON.parse(noteData.collaborators) 
      : [];

    // Check if collaborator already exists
    const collaboratorExists = existingCollaborators.some(
      c => c.user_id === collaborator.user_id
    );

    if (collaboratorExists) {
      throw new Error('Collaborator already exists');
    }

    // Add new collaborator with current timestamp
    const updatedCollaborators = [
      ...existingCollaborators, 
      { 
        ...collaborator, 
        joined_at: new Date().toISOString() 
      }
    ];

    // Update note with new collaborators list
    const { error: updateError } = await supabase
      .from('notes')
      .update({ 
        collaborators: JSON.stringify(updatedCollaborators) 
      })
      .eq('id', noteId);

    if (updateError) {
      throw updateError;
    }

    return true;
  } catch (error) {
    console.error('Error inviting collaborator:', error);
    return false;
  }
}

export async function removeCollaborator(
  noteId: string, 
  userId: string
): Promise<boolean> {
  try {
    // Fetch current note to get existing collaborators
    const { data: noteData, error: fetchError } = await supabase
      .from('notes')
      .select('collaborators')
      .eq('id', noteId)
      .single();

    if (fetchError) {
      throw fetchError;
    }

    // Parse existing collaborators
    const existingCollaborators: Collaborator[] = noteData.collaborators 
      ? JSON.parse(noteData.collaborators) 
      : [];

    // Remove specified collaborator
    const updatedCollaborators = existingCollaborators.filter(
      c => c.user_id !== userId
    );

    // Update note with new collaborators list
    const { error: updateError } = await supabase
      .from('notes')
      .update({ 
        collaborators: JSON.stringify(updatedCollaborators) 
      })
      .eq('id', noteId);

    if (updateError) {
      throw updateError;
    }

    return true;
  } catch (error) {
    console.error('Error removing collaborator:', error);
    return false;
  }
}

export async function updateCollaboratorPermission(
  noteId: string, 
  userId: string, 
  permission: 'view' | 'edit'
): Promise<boolean> {
  try {
    // Fetch current note to get existing collaborators
    const { data: noteData, error: fetchError } = await supabase
      .from('notes')
      .select('collaborators')
      .eq('id', noteId)
      .single();

    if (fetchError) {
      throw fetchError;
    }

    // Parse existing collaborators
    const existingCollaborators: Collaborator[] = noteData.collaborators 
      ? JSON.parse(noteData.collaborators) 
      : [];

    // Update collaborator's permission
    const updatedCollaborators = existingCollaborators.map(c => 
      c.user_id === userId 
        ? { ...c, permission } 
        : c
    );

    // Update note with new collaborators list
    const { error: updateError } = await supabase
      .from('notes')
      .update({ 
        collaborators: JSON.stringify(updatedCollaborators) 
      })
      .eq('id', noteId);

    if (updateError) {
      throw updateError;
    }

    return true;
  } catch (error) {
    console.error('Error updating collaborator permission:', error);
    return false;
  }
}