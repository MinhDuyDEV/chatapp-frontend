import axiosInstance from '@/lib/axiosInstance';
import { UserRelationship } from '@/lib/types';

interface SendFriendRequestDto {
  receiverId: string;
  message?: string;
}

export const sendFriendRequest = async (data: SendFriendRequestDto) => {
  const response = await axiosInstance.post('/api/friends/requests', data);
  return response.data;
};

export const cancelFriendRequest = async (requestId: string) => {
  const response = await axiosInstance.delete(
    `/api/friends/requests/cancel/${requestId}`,
  );
  return response.data;
};

export const getRelationship = async (
  userId: string,
): Promise<UserRelationship> => {
  const response = await axiosInstance.get(
    `/api/friends/${userId}/relationship`,
  );
  return response.data;
};

export const acceptFriendRequest = async (requestId: string) => {
  const response = await axiosInstance.put(
    `/api/friends/requests/${requestId}/accept`,
  );
  return response.data;
};

export const declineFriendRequest = async (
  requestId: string,
  data: { reason?: string },
) => {
  const response = await axiosInstance.put(
    `/api/friends/requests/${requestId}/reject`,
    {
      data,
    },
  );
  return response.data;
};

export const cancelFriend = async (userId: string) => {
  const response = await axiosInstance.delete(`/api/friends/cancel/${userId}`);
  return response.data;
};
