import axiosInstance from '@/lib/axiosInstance';
import { Pagination, Post } from '@/lib/types';

export const getTimelineFollowing = async (
  page: number,
  limit: number,
): Promise<Pagination<Post>> => {
  const response = await axiosInstance.get('/api/timeline/following', {
    params: { page, limit },
  });
  return response.data;
};
