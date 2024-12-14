import { QueryKeyFeed } from '@/lib/enum';
import { ErrorServerResponse, Post } from '@/lib/types';
import { useAuth } from '@/providers/auth-provider';
import { deletePost } from '@/services/posts';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

export default function useDeletePost(postId: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deletePost,
    onSuccess: () => {
      queryClient.setQueryData<{ data: Post[] }>(
        [`${QueryKeyFeed.Timeline}:${user?.id}`],
        (old) => {
          if (!old?.data) return old;
          return {
            data: old.data.filter((post) => post.id !== postId),
          };
        },
      );
      toast.success('Post deleted successfully');
      queryClient.invalidateQueries({
        queryKey: [`${QueryKeyFeed.Timeline}:${user?.id}`],
      });
    },
    onError: (error: ErrorServerResponse) => {
      toast.error(`Delete post failed: ${error.response.data.message[0]}`);
    },
  });
}
