import { FriendRequestStatus, QueryKeyProfile } from '@/lib/enum';
import { UserRelationship } from '@/lib/types';
import {
  acceptFriendRequest,
  declineFriendRequest,
  cancelFriend,
  sendFriendRequest,
  cancelFriendRequest,
} from '@/services/friends';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export default function useFriendRequest(userId: string) {
  const queryClient = useQueryClient();

  const updateRelationshipCache = (status: 'accept' | 'decline' | 'cancel') => {
    queryClient.setQueryData<UserRelationship>(
      [`${QueryKeyProfile.Relationship}:${userId}`],
      (old) =>
        old
          ? {
              ...old,
              isFriend: status === 'accept',
              hasPendingFriendRequest: false,
              friendRequestStatus:
                status === 'accept'
                  ? FriendRequestStatus.ACCEPTED
                  : status === 'decline'
                  ? FriendRequestStatus.REJECTED
                  : FriendRequestStatus.NONE,
            }
          : undefined,
    );
  };

  const acceptMutation = useMutation({
    mutationFn: (requestId: string) => acceptFriendRequest(requestId),
    onMutate: async () => {
      await queryClient.cancelQueries({
        queryKey: [`${QueryKeyProfile.Relationship}:${userId}`],
      });

      const previousRelationship = queryClient.getQueryData<UserRelationship>([
        `${QueryKeyProfile.Relationship}:${userId}`,
      ]);

      updateRelationshipCache('accept');

      return { previousRelationship };
    },
    onError: (_err, _requestId, context) => {
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

  const declineMutation = useMutation({
    mutationFn: (data: { requestId: string; reason?: string }) =>
      declineFriendRequest(data.requestId, { reason: data.reason }),
    onMutate: async () => {
      await queryClient.cancelQueries({
        queryKey: [`${QueryKeyProfile.Relationship}:${userId}`],
      });

      const previousRelationship = queryClient.getQueryData<UserRelationship>([
        `${QueryKeyProfile.Relationship}:${userId}`,
      ]);

      updateRelationshipCache('decline');

      return { previousRelationship };
    },
    onError: (_err, _data, context) => {
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

  const cancelFriendMutation = useMutation({
    mutationFn: () => cancelFriend(userId),
    onMutate: async () => {
      await queryClient.cancelQueries({
        queryKey: [`${QueryKeyProfile.Relationship}:${userId}`],
      });

      const previousRelationship = queryClient.getQueryData<UserRelationship>([
        `${QueryKeyProfile.Relationship}:${userId}`,
      ]);

      updateRelationshipCache('cancel');

      return { previousRelationship };
    },
    onError: (_err, _data, context) => {
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

  const sendRequestMutation = useMutation({
    mutationFn: (message?: string) =>
      sendFriendRequest({ receiverId: userId, message }),
    onMutate: async () => {
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
                hasPendingFriendRequest: true,
                pendingFriendRequestType: 'sent',
                friendRequestStatus: FriendRequestStatus.PENDING,
              }
            : undefined,
      );

      return { previousRelationship };
    },
    onError: (_err, _data, context) => {
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

  const cancelFriendRequestMutation = useMutation({
    mutationFn: (requestId: string) => cancelFriendRequest(requestId),
    onMutate: async () => {
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
                hasPendingFriendRequest: false,
                friendRequestStatus: FriendRequestStatus.NONE,
              }
            : undefined,
      );

      return { previousRelationship };
    },
    onError: (_err, _data, context) => {
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

  const handleAcceptRequest = (requestId: string) => {
    acceptMutation.mutate(requestId);
  };

  const handleDeclineRequest = (requestId: string, reason?: string) => {
    declineMutation.mutate({ requestId, reason });
  };

  const handleCancelFriend = () => {
    cancelFriendMutation.mutate();
  };

  const handleSendRequest = (message?: string) => {
    sendRequestMutation.mutate(message);
  };

  const handleCancelFriendRequest = (requestId: string) => {
    cancelFriendRequestMutation.mutate(requestId);
  };

  return {
    handleAcceptRequest,
    handleDeclineRequest,
    handleCancelFriend,
    handleSendRequest,
    handleCancelFriendRequest,
    isAccepting: acceptMutation.isPending,
    isDeclining: declineMutation.isPending,
    isCancelingFriend: cancelFriendMutation.isPending,
    isSending: sendRequestMutation.isPending,
    isCancelingFriendRequest: cancelFriendRequestMutation.isPending,
  };
}
