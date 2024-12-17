'use client';

import Image from 'next/image';
import banner from '@/assets/cover-photo.png';
import { Button } from '@/components/ui/button';
import { CloudUpload, ImageIcon } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useState } from 'react';
import PhotoUploadModal from '@/components/modals/photo-upload-modal';
import { User, UserProfile } from '@/lib/types';
import Relationship from './Relationship';
import { useQueryClient } from '@tanstack/react-query';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface ProfileHeaderProps {
  user?: UserProfile | null;
}

export default function ProfileHeader({ user }: ProfileHeaderProps) {
  const [avatarModalOpen, setAvatarModalOpen] = useState(false);
  const [coverPhotoModalOpen, setCoverPhotoModalOpen] = useState(false);
  const queryClient = useQueryClient();
  const me = queryClient.getQueryData<User>(['me']);

  if (!user) return null;

  return (
    <div className="rounded-md shadow pb-7.5">
      <div className="relative">
        <Image
          src={user.profile.coverPhoto || banner}
          alt="Cover Photo"
          width={1232}
          height={350}
          className="aspect-[1232/350] object-cover rounded-md"
          priority
        />
        <Button
          variant="outline"
          className="absolute right-4 bottom-4 bg-background/80 backdrop-blur-sm"
          onClick={() => setCoverPhotoModalOpen(true)}
        >
          <CloudUpload />
          Edit Cover Photo
        </Button>
        <Popover>
          <PopoverTrigger asChild>
            <div className="absolute -bottom-16 left-6 rounded-full border-2 border-background cursor-pointer">
              <Avatar className="object-cover aspect-[1/1] shadow h-24 w-24">
                <AvatarImage src={user.avatar ?? undefined} />
                <AvatarFallback className="text-3xl">
                  {user.profile.firstName?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
          </PopoverTrigger>
          <PopoverContent className="w-fit py-1 px-2">
            <div className="flex items-center gap-3.5 p-3 hover:bg-gray-100 cursor-pointer rounded-sm">
              <ImageIcon size={20} />
              <span>See profile picture</span>
            </div>
            <div
              className="flex items-center gap-3.5 p-3 hover:bg-gray-100 cursor-pointer rounded-sm"
              onClick={() => setAvatarModalOpen(true)}
            >
              <CloudUpload size={20} />
              <span>Upload new picture</span>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <div className="flex justify-between mt-[75px] px-7.5">
        <div>
          <h1 className="text-2xl font-bold">
            {user.profile?.firstName} {user.profile?.lastName}
          </h1>
          <p className="text-muted-foreground">{user.profile?.bio}</p>
        </div>
        {me?.id !== user.id && <Relationship userId={user.id} />}
      </div>

      {avatarModalOpen && (
        <PhotoUploadModal
          isOpen={avatarModalOpen}
          onClose={() => setAvatarModalOpen(false)}
          isAvatar
        />
      )}

      {coverPhotoModalOpen && (
        <PhotoUploadModal
          isOpen={coverPhotoModalOpen}
          onClose={() => setCoverPhotoModalOpen(false)}
        />
      )}
    </div>
  );
}
