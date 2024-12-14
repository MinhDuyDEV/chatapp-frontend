'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useState } from 'react';
import useFriendRequest from '@/app/hooks/useFriendRequest';
import useDebounce from '@/app/hooks/useDebounce';
import { UserPlus } from 'lucide-react';

const MAX_CHARACTERS = 250;

interface FriendRequestModalProps {
  userId: string;
}

export default function FriendRequestModal({
  userId,
}: FriendRequestModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const debouncedMessage = useDebounce(message, 300);
  const { handleSendRequest, isSending } = useFriendRequest({ userId });

  const handleSubmit = () => {
    handleSendRequest(debouncedMessage);
    setMessage('');
    setIsOpen(false);
  };

  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    if (newValue.length <= MAX_CHARACTERS) {
      setMessage(newValue);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="default" className="flex items-center gap-2 ml-auto">
          <UserPlus size={20} />
          Add Friend
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Send Friend Request</DialogTitle>
          <DialogDescription>
            Add a message to your friend request. This is optional but can help
            the person know who you are.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="relative">
            <Textarea
              placeholder="Write a message... (optional)"
              value={message}
              onChange={handleMessageChange}
              className="resize-none h-24 overflow-auto pr-4 pb-6"
              maxLength={MAX_CHARACTERS}
            />
            <div className="absolute bottom-2 right-2 text-sm text-muted-foreground">
              {message.length}/{MAX_CHARACTERS} characters
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSending}>
            {isSending ? 'Sending...' : 'Add Friend'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
