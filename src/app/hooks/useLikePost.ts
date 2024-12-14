import { QueryKeyFeed } from '@/lib/enum';
import { Post } from '@/lib/types';
import { useAuth } from '@/providers/auth-provider';
import { likePost } from '@/services/posts';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const useLikePost = (postId: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  if (!user) throw new Error('User is not authenticated');

  const queryKey = [`${QueryKeyFeed.Timeline}:${user.id}`];

  const mutation = useMutation({
    mutationFn: () => likePost(postId),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey });
      const previousData = queryClient.getQueryData<{ data: Post[] }>(queryKey);

      queryClient.setQueryData<{ data: Post[] }>(queryKey, (old) => {
        if (!old?.data) return old;

        return {
          ...old,
          data: old.data.map((post) =>
            post.id === postId
              ? {
                  ...post,
                  likesCount: post.isLikedByMe
                    ? post.likesCount - 1
                    : post.likesCount + 1,
                  isLikedByMe: !post.isLikedByMe,
                }
              : post,
          ),
        };
      });

      return { previousData };
    },
    onError: (_, __, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(queryKey, context.previousData);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  return { toggleLike: () => mutation.mutate(), isLoading: mutation.isPending };
};

export default useLikePost;
