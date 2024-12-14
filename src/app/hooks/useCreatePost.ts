import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createPost } from '@/services/posts';
import { ErrorServerResponse, Post } from '@/lib/types';
import toast from 'react-hot-toast';
import { useAuth } from '@/providers/auth-provider';
import { QueryKeyFeed } from '@/lib/enum';

const useCreatePost = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPost,
    onMutate: async () => {
      await queryClient.cancelQueries({
        queryKey: [`${QueryKeyFeed.Timeline}:${user?.id}`],
      });
      const previousPosts = queryClient.getQueryData<{ data: Post[] }>([
        `${QueryKeyFeed.Timeline}:${user?.id}`,
      ]);

      return { previousPosts };
    },
    onError: (error: ErrorServerResponse, _, context) => {
      if (context?.previousPosts) {
        queryClient.setQueryData(
          [`${QueryKeyFeed.Timeline}:${user?.id}`],
          context.previousPosts,
        );
      }
      toast.error(`Create post failed: ${error.response.data.message[0]}`);
    },
    onSuccess: (post) => {
      queryClient.setQueryData<{ data: Post[] }>(
        [`${QueryKeyFeed.Timeline}:${user?.id}`],
        (old) => {
          if (!old?.data) return old;
          return { data: [post, ...old.data] };
        },
      );
      toast.success('Post created successfully');
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: [`${QueryKeyFeed.Timeline}:${user?.id}`],
      });
    },
  });
};

export default useCreatePost;
