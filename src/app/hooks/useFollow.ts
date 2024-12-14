import { QueryKeyFeed, QueryKeyProfile } from '@/lib/enum';
import { UserRelationship, UsersLikedPost } from '@/lib/types';
import { followUser, unfollowUser } from '@/services/follows';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface UseFollowProps {
  userId: string;
  postId?: string;
}

interface ErrorContext {
  previousData?: {
    relationship?: UserRelationship;
    usersLikedPost?: unknown;
  };
}

const getQueryKeys = (userId: string, postId?: string) => {
  const keys = [[`${QueryKeyProfile.Relationship}:${userId}`]];
  if (postId) {
    keys.push([QueryKeyFeed.UsersLikedPost, postId]);
  }
  return keys;
};

export default function useFollow({ userId, postId }: UseFollowProps) {
  const queryClient = useQueryClient();

  const cancelAllQueries = async () => {
    const keys = getQueryKeys(userId, postId);
    await Promise.all(
      keys.map((key) => queryClient.cancelQueries({ queryKey: key })),
    );
  };

  const getPreviousData = () => {
    return {
      relationship: queryClient.getQueryData<UserRelationship>([
        `${QueryKeyProfile.Relationship}:${userId}`,
      ]),
      usersLikedPost: postId
        ? queryClient.getQueryData([QueryKeyFeed.UsersLikedPost, postId])
        : undefined,
    };
  };

  const updateCaches = (isFollowing: boolean) => {
    // Update relationship cache
    queryClient.setQueryData<UserRelationship>(
      [`${QueryKeyProfile.Relationship}:${userId}`],
      (old) => (old ? { ...old, isFollowing } : undefined),
    );

    // Update users liked post cache
    if (postId) {
      queryClient.setQueriesData<{ pages: { data: UsersLikedPost[] }[] }>(
        { queryKey: [QueryKeyFeed.UsersLikedPost, postId] },
        (old) => {
          if (!old?.pages) return old;
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              data: page.data.map((like) =>
                like.user.id === userId
                  ? {
                      ...like,
                      relationship: {
                        ...like.relationship,
                        isFollowing,
                      },
                    }
                  : like,
              ),
            })),
          };
        },
      );
    }
  };

  const handleError = (context?: ErrorContext) => {
    if (context?.previousData?.relationship) {
      queryClient.setQueryData(
        [`${QueryKeyProfile.Relationship}:${userId}`],
        context.previousData.relationship,
      );
    }
    if (context?.previousData?.usersLikedPost && postId) {
      queryClient.setQueryData(
        [QueryKeyFeed.UsersLikedPost, postId],
        context.previousData.usersLikedPost,
      );
    }
  };

  const invalidateQueries = () => {
    const keys = getQueryKeys(userId, postId);
    keys.forEach((key) => {
      queryClient.invalidateQueries({ queryKey: key });
    });
  };

  const followMutation = useMutation({
    mutationFn: (isFollowing: boolean) =>
      isFollowing ? unfollowUser(userId) : followUser(userId),
    onMutate: async (isFollowing) => {
      await cancelAllQueries();
      const previousData = getPreviousData();

      updateCaches(!isFollowing);

      return { previousData };
    },
    onError: (err, isFollowing, context) => handleError(context),
    onSettled: invalidateQueries,
  });

  const handleFollow = (isFollowing: boolean) => {
    followMutation.mutate(isFollowing);
  };

  return {
    handleFollow,
    isLoading: followMutation.isPending,
  };
}
