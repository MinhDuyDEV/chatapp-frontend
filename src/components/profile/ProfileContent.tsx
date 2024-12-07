import { UserProfile } from '@/lib/types';
import PostFeed from '../posts/PostFeed';
import ProfileIntro from './ProfileIntro';
import Suggestion from './Suggestion';

interface ProfileContentProps {
  user?: UserProfile | null;
}

export default function ProfileContent({ user }: ProfileContentProps) {
  return (
    <div className="mt-8 p-7.5 grid gap-6 md:grid-cols-[300px_1fr_300px] bg-muted/50 rounded-lg">
      <ProfileIntro user={user} />
      <PostFeed />
      <Suggestion />
    </div>
  );
}
