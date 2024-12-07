import axiosInstance from '@/lib/axiosInstance';

export const followUser = async (userId: string) => {
  const response = await axiosInstance.post(`/api/follow/${userId}`);
  return response.data;
};

export const unfollowUser = async (userId: string) => {
  const response = await axiosInstance.delete(`/api/follow/${userId}`);
  return response.data;
};
