'use client';

import useRelationship from '@/app/hooks/useRelationship';
import useFollow from '@/app/hooks/useFollow';
import useFriendRequest from '@/app/hooks/useFriendRequest';
import { Button } from '@/components/ui/button';
import { FriendRequestStatus } from '@/lib/enum';
import {
  MessageCircle,
  UserCheck,
  UserX,
  Plus,
  Check,
  UserMinus,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import FriendRequestModal from '@/components/modals/friend-request-modal';

interface RelationshipProps {
  userId: string;
}

export default function Relationship({ userId }: RelationshipProps) {
  const router = useRouter();
  const { data: relationship } = useRelationship(userId);
  const { handleFollow, isLoading: isFollowLoading } = useFollow({ userId });
  const {
    handleAcceptRequest,
    handleDeclineRequest,
    handleCancelFriend,
    handleCancelFriendRequest,
    isAccepting,
    isDeclining,
    isCancelingFriend,
    isCancelingFriendRequest,
  } = useFriendRequest({ userId });

  const handleMessage = () => {
    router.push(`/message/${userId}`);
  };

  const renderFollowButton = () => {
    if (relationship?.isFollowing) {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="flex items-center gap-2"
              disabled={isFollowLoading}
            >
              <Check size={20} />
              {isFollowLoading ? 'Updating...' : 'Following'}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              className="text-destructive focus:text-destructive flex justify-center items-center gap-2 cursor-pointer"
              onClick={() => handleFollow(true)}
              disabled={isFollowLoading}
            >
              <UserMinus size={16} />
              Unfollow
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }

    return (
      <Button
        variant="default"
        className="flex items-center gap-2"
        onClick={() => handleFollow(false)}
        disabled={isFollowLoading}
      >
        <Plus size={20} />
        {isFollowLoading ? 'Updating...' : 'Follow'}
      </Button>
    );
  };

  const renderFriendButton = () => {
    if (relationship?.isFriend) {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <UserCheck size={20} />
              {isCancelingFriend ? 'Updating...' : 'Friends'}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              className="text-destructive focus:text-destructive flex justify-center items-center gap-2 cursor-pointer"
              onClick={handleCancelFriend}
              disabled={isCancelingFriend}
            >
              <UserX size={16} />
              Unfriend
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }

    if (relationship?.hasPendingFriendRequest && relationship.requestId) {
      const isPending =
        relationship.friendRequestStatus === FriendRequestStatus.PENDING;
      const isSentByMe = relationship.pendingFriendRequestType === 'sent';

      if (isPending && isSentByMe) {
        return (
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={() => handleCancelFriendRequest(relationship.requestId)}
            disabled={isCancelingFriendRequest}
          >
            <UserX size={20} />
            {isCancelingFriendRequest ? 'Canceling...' : 'Cancel Request'}
          </Button>
        );
      }

      if (isPending && !isSentByMe) {
        return (
          <div className="flex gap-2">
            <Button
              variant="default"
              className="flex items-center gap-2"
              onClick={() => handleAcceptRequest(relationship.requestId)}
              disabled={isAccepting || isDeclining}
            >
              <UserCheck size={20} />
              {isAccepting ? 'Accepting...' : 'Accept'}
            </Button>
            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={() => handleDeclineRequest(relationship.requestId)}
              disabled={isAccepting || isDeclining}
            >
              <UserX size={20} />
              {isDeclining ? 'Declining...' : 'Decline'}
            </Button>
          </div>
        );
      }
    }

    return <FriendRequestModal userId={userId} />;
  };

  return (
    <div className="flex items-center gap-2">
      {renderFollowButton()}
      {renderFriendButton()}
      <Button
        variant="outline"
        className="flex items-center gap-2"
        onClick={handleMessage}
      >
        <MessageCircle size={20} />
        Message
      </Button>
    </div>
  );
}
