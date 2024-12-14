import { QueryKeyFeed } from '@/lib/enum';
import { User } from '@/lib/types';
import { getTimelineFollowing } from '@/services/timeline';
import { useInfiniteQuery } from '@tanstack/react-query';

export default function useTimelineFollowing({ user }: { user: User | null }) {
  return useInfiniteQuery({
    queryKey: [`${QueryKeyFeed.Timeline}:${user?.id}`],
    queryFn: async ({ pageParam = 1 }) => {
      const data = await getTimelineFollowing(pageParam as number, 10);
      return data;
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.page < lastPage.totalPages) {
        return lastPage.page + 1;
      }
    },
    initialPageParam: 1,
    enabled: !!user,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
