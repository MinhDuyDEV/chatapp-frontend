import { useInfiniteQuery } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { getUsersLikedPost } from '@/services/posts';
import Image from 'next/image';
import avatar from '@/assets/avatar.png';
import { QueryKeyFeed } from '@/lib/enum';
import { useInView } from 'react-intersection-observer';
import { useEffect } from 'react';
import { UsersLikedPost } from '@/lib/types';
import { useAuth } from '@/providers/auth-provider';
import UserRelationshipButton from '../relationship/UserRelationshipButton';
import { useRouter } from 'next/navigation';

interface LikeListModalProps {
  isOpen: boolean;
  onClose: () => void;
  postId: string;
}

const LikeListModal = ({ isOpen, onClose, postId }: LikeListModalProps) => {
  const router = useRouter();
  const {
    data: users,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: [QueryKeyFeed.UsersLikedPost, postId],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await getUsersLikedPost(postId, pageParam as number, 10);
      return response;
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.page < lastPage.totalPages) {
        return lastPage.page + 1;
      }
    },
    initialPageParam: 1,
    enabled: isOpen,
    staleTime: Infinity,
  });
  const { user: me } = useAuth();
  const { ref, inView } = useInView();

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      void fetchNextPage();
    }
  }, [fetchNextPage, inView, hasNextPage, isFetchingNextPage]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Users liked post</DialogTitle>
        </DialogHeader>
        <div className="max-h-96 overflow-y-auto">
          {users?.pages.map((page, pageIndex) => (
            <div key={pageIndex}>
              {page.data.map((like: UsersLikedPost) => (
                <div key={like.user.id} className="flex items-center gap-4 p-2">
                  <Image
                    src={like.user.avatar || avatar}
                    alt={like.user.username}
                    width={40}
                    height={40}
                    className="rounded-full cursor-pointer"
                    onClick={() =>
                      router.push(`/profile/${like.user.username}`)
                    }
                  />
                  <span
                    className="hover:underline cursor-pointer"
                    onClick={() =>
                      router.push(`/profile/${like.user.username}`)
                    }
                  >
                    {like.user.profile.firstName} {like.user.profile.lastName}
                  </span>
                  {like.user.id !== me?.id && (
                    <UserRelationshipButton
                      postId={postId}
                      userId={like.user.id}
                      relationship={like.relationship}
                    />
                  )}
                </div>
              ))}
            </div>
          ))}
          <div ref={ref} className="h-1" />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LikeListModal;
