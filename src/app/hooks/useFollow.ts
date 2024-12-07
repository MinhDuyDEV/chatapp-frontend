import { QueryKeyProfile } from '@/lib/enum';
import { UserRelationship } from '@/lib/types';
import { followUser, unfollowUser } from '@/services/follows';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export default function useFollow(userId: string) {
  const queryClient = useQueryClient();

  const followMutation = useMutation({
    mutationFn: (isFollowing: boolean) =>
      isFollowing ? unfollowUser(userId) : followUser(userId),
    onMutate: async (isFollowing) => {
      await queryClient.cancelQueries({
        queryKey: [`${QueryKeyProfile.Relationship}:${userId}`],
      });

      const previousRelationship = queryClient.getQueryData<UserRelationship>([
        `${QueryKeyProfile.Relationship}:${userId}`,
      ]);

      queryClient.setQueryData<UserRelationship>(
        [`${QueryKeyProfile.Relationship}:${userId}`],
        (old) =>
          old
            ? {
                ...old,
                isFollowing: !isFollowing,
              }
            : undefined,
      );

      return { previousRelationship };
    },
    onError: (err, isFollowing, context) => {
      queryClient.setQueryData(
        [`${QueryKeyProfile.Relationship}:${userId}`],
        context?.previousRelationship,
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: [`${QueryKeyProfile.Relationship}:${userId}`],
      });
    },
  });

  const handleFollow = (isFollowing: boolean) => {
    followMutation.mutate(isFollowing);
  };

  return {
    handleFollow,
    isLoading: followMutation.isPending,
  };
}
