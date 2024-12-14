import { FriendRequestStatus, QueryKeyFeed, QueryKeyProfile } from '@/lib/enum';
import { UserRelationship, UsersLikedPost } from '@/lib/types';
import {
  acceptFriendRequest,
  declineFriendRequest,
  cancelFriend,
  sendFriendRequest,
  cancelFriendRequest,
} from '@/services/friends';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface UseFriendRequestProps {
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

export default function useFriendRequest({
  userId,
  postId,
}: UseFriendRequestProps) {
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

  const updateCaches = (updates: Partial<UserRelationship>) => {
    // Update relationship cache
    queryClient.setQueryData<UserRelationship>(
      [`${QueryKeyProfile.Relationship}:${userId}`],
      (old) => (old ? { ...old, ...updates } : undefined),
    );

    // Update users liked post cache if postId exists
    if (postId) {
      updateUsersLikedPostCache(updates);
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
    queryClient.invalidateQueries({
      queryKey: [`${QueryKeyProfile.Relationship}:${userId}`],
    });
    if (postId) {
      queryClient.invalidateQueries({
        queryKey: [QueryKeyFeed.UsersLikedPost, postId],
      });
    }
  };

  const updateUsersLikedPostCache = (updates: Partial<UserRelationship>) => {
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
                      ...updates,
                    },
                  }
                : like,
            ),
          })),
        };
      },
    );
  };

  // Mutations
  const acceptMutation = useMutation({
    mutationFn: (requestId: string) => acceptFriendRequest(requestId),
    onMutate: async () => {
      await cancelAllQueries();
      const previousData = getPreviousData();

      const updates = {
        isFriend: true,
        hasPendingFriendRequest: false,
        friendRequestStatus: FriendRequestStatus.ACCEPTED,
      };
      updateCaches(updates);

      return { previousData };
    },
    onError: (_err, _requestId, context) => handleError(context),
    onSettled: () => {
      invalidateQueries();
    },
  });

  const declineMutation = useMutation({
    mutationFn: (data: { requestId: string; reason?: string }) =>
      declineFriendRequest(data.requestId, { reason: data.reason }),
    onMutate: async () => {
      await cancelAllQueries();
      const previousData = getPreviousData();

      const updates = {
        isFriend: false,
        hasPendingFriendRequest: false,
        friendRequestStatus: FriendRequestStatus.REJECTED,
      };
      updateCaches(updates);

      return { previousData };
    },
    onError: (_err, _data, context) => handleError(context),
    onSettled: () => {
      invalidateQueries();
    },
  });

  const cancelFriendMutation = useMutation({
    mutationFn: () => cancelFriend(userId),
    onMutate: async () => {
      await cancelAllQueries();
      const previousData = getPreviousData();

      const updates = {
        isFriend: false,
        hasPendingFriendRequest: false,
        friendRequestStatus: FriendRequestStatus.NONE,
      };
      updateCaches(updates);

      return { previousData };
    },
    onError: (_err, _data, context) => handleError(context),
    onSettled: () => {
      invalidateQueries();
    },
  });

  const sendRequestMutation = useMutation({
    mutationFn: (message?: string) =>
      sendFriendRequest({ receiverId: userId, message }),
    onMutate: async () => {
      await cancelAllQueries();
      const previousData = getPreviousData();

      const updates = {
        hasPendingFriendRequest: true,
        pendingFriendRequestType: 'sent' as 'sent' | 'received' | undefined,
        friendRequestStatus: FriendRequestStatus.PENDING,
      };
      updateCaches(updates);

      return { previousData };
    },
    onError: (_err, _data, context) => handleError(context),
    onSettled: () => {
      invalidateQueries();
    },
  });

  const cancelFriendRequestMutation = useMutation({
    mutationFn: (requestId: string) => cancelFriendRequest(requestId),
    onMutate: async () => {
      await cancelAllQueries();
      const previousData = getPreviousData();

      const updates = {
        hasPendingFriendRequest: false,
        friendRequestStatus: FriendRequestStatus.NONE,
      };
      updateCaches(updates);

      return { previousData };
    },
    onError: (_err, _data, context) => handleError(context),
    onSettled: () => {
      invalidateQueries();
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
