import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { inviteCollaborator } from '@/lib/collaborators';
import { Copy, Share2 } from 'lucide-react';

interface ShareButtonProps {
  noteId: string;
  currentUserId: string;
}

export function ShareButton({ noteId, currentUserId }: ShareButtonProps) {
  const [email, setEmail] = useState('');
  const [permission, setPermission] = useState<'view' | 'edit'>('view');
  const { toast } = useToast();

  const handleInvite = async () => {
    // Basic email validation
    if (!email || !email.includes('@')) {
      toast({
        title: 'Invalid Email',
        description: 'Please enter a valid email address',
        variant: 'destructive'
      });
      return;
    }

    try {
      // Generate a unique user ID (in a real app, this would come from authentication)
      const userId = `user_${email.replace('@', '_')}`;

      const success = await inviteCollaborator(noteId, {
        user_id: userId,
        email,
        permission,
        display_name: email.split('@')[0]
      });

      if (success) {
        toast({
          title: 'Collaborator Invited',
          description: `${email} has been invited with ${permission} access`,
          variant: 'default'
        });
        setEmail('');
      } else {
        toast({
          title: 'Invitation Failed',
          description: 'Unable to invite collaborator',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive'
      });
    }
  };

  const handleCopyShareLink = async () => {
    // In a real implementation, this would generate a unique sharing token
    const shareLink = `${window.location.origin}/notes/${noteId}/share`;
    
    try {
      await navigator.clipboard.writeText(shareLink);
      toast({
        title: 'Share Link Copied',
        description: 'You can now share this link with collaborators',
        variant: 'default'
      });
    } catch (error) {
      toast({
        title: 'Copy Failed',
        description: 'Unable to copy share link',
        variant: 'destructive'
      });
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <Share2 className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share Note</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex space-x-2">
            <Input 
              placeholder="Collaborator's email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Select 
              value={permission}
              onValueChange={(value: 'view' | 'edit') => setPermission(value)}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Permission" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="view">View</SelectItem>
                <SelectItem value="edit">Edit</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Button 
            onClick={handleInvite} 
            className="w-full"
            disabled={!email}
          >
            Invite Collaborator
          </Button>

          <div className="border-t pt-4">
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={handleCopyShareLink}
            >
              <Copy className="mr-2 h-4 w-4" />
              Copy Share Link
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}