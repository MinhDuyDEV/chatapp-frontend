import ProfileLayout from '@/components/profile/ProfileLayout';
import type { Metadata } from 'next';

type Props = {
  params: {
    username: string;
  };
};

export const metadata: Metadata = {
  title: 'Profile | Meetmax',
  description: 'Profile page of Meetmax',
};

const ProfileUsernamePage = ({ params }: Props) => {
  return <ProfileLayout username={params.username} />;
};

export default ProfileUsernamePage;
