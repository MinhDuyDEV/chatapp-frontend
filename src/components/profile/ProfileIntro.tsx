import { Cake, CircleUserRound, MapPinHouse, Rss } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserProfile } from '@/lib/types';
import { formatDate } from 'date-fns';
import Link from 'next/link';
import { getSocialIcon } from '@/lib/utils';

interface ProfileIntroProps {
  user?: UserProfile | null;
}

export default function ProfileIntro({ user }: ProfileIntroProps) {
  return (
    <Card className="p-4">
      <h2 className="mb-4 text-lg font-semibold">INTRO</h2>
      <div className="space-y-4">
        {user?.profile?.gender && (
          <div className="flex items-center gap-2">
            <CircleUserRound size={16} />
            <span className="text-sm text-muted-foreground">
              {user?.profile.gender.charAt(0).toUpperCase() +
                user?.profile.gender.slice(1)}
            </span>
          </div>
        )}
        {user?.profile?.birthday && (
          <div className="flex items-center gap-2">
            <Cake size={16} />
            <span className="text-sm text-muted-foreground">
              Born{' '}
              {formatDate(new Date(user?.profile.birthday), 'MMMM dd, yyyy')}
            </span>
          </div>
        )}
        {user?.profile?.address && (
          <div className="flex items-center gap-2">
            <MapPinHouse size={16} />
            <span className="text-sm text-muted-foreground">
              From {user?.profile.address}
            </span>
          </div>
        )}
        {user?.profile?.socialLinks && user?.profile.socialLinks.length > 0 && (
          <div className="space-y-4">
            {user?.profile.socialLinks.map((link, index) => (
              <div key={index} className="flex items-center gap-2">
                {getSocialIcon(link.platform)}
                <Link
                  href={link.url as string}
                  target="_blank"
                  className="text-sm text-muted-foreground"
                >
                  {link.url}
                </Link>
              </div>
            ))}
          </div>
        )}
        <div className="flex items-center gap-2">
          <Rss size={16} />
          <span className="text-sm text-muted-foreground">
            52,844 Followers
          </span>
        </div>
        <Button variant="outline" className="w-full">
          Edit Details
        </Button>
      </div>
    </Card>
  );
}
