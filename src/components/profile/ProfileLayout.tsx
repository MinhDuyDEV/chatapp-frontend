'use client';

import useUserProfile from '@/app/hooks/useUserProfile';
import ProfileContent from './ProfileContent';
import ProfileHeader from './ProfileHeader';

type ProfileLayoutProps = {
  username: string;
};

export default function ProfileLayout({ username }: ProfileLayoutProps) {
  const { data: user } = useUserProfile(username);

  return (
    <div className="space-y-7.5 flex-1 overflow-y-scroll custom-scrollbar">
      <ProfileHeader user={user} />
      <ProfileContent user={user} />
    </div>
  );
}
