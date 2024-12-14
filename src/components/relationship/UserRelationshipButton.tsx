import { UserRelationship } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Check, Clock, UserCheck, UserMinus, UserX } from 'lucide-react';
import { FriendRequestStatus } from '@/lib/enum';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import useFollow from '@/app/hooks/useFollow';
import useFriendRequest from '@/app/hooks/useFriendRequest';
import FriendRequestModal from '../modals/friend-request-modal';

interface UserRelationshipButtonProps {
  postId: string;
  userId: string;
  relationship: UserRelationship;
}

export default function UserRelationshipButton({
  postId,
  userId,
  relationship,
}: UserRelationshipButtonProps) {
  const {
    requestId,
    isFriend,
    isFollowing,
    hasPendingFriendRequest,
    friendRequestStatus,
    pendingFriendRequestType,
  } = relationship;
  const { handleFollow, isLoading: isFollowLoading } = useFollow({
    userId,
    postId,
  });
  const {
    handleAcceptRequest,
    handleDeclineRequest,
    handleCancelFriend,
    handleCancelFriendRequest,
    isAccepting,
    isDeclining,
    isCancelingFriend,
    isCancelingFriendRequest,
  } = useFriendRequest({ userId, postId });

  if (isFriend) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="ml-auto">
            <UserCheck className="size-4" />
            Friends
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem
            onClick={handleCancelFriend}
            className="flex justify-center cursor-pointer"
          >
            <UserX className="size-4" />
            {isCancelingFriend ? 'Canceling...' : 'Unfriend'}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  if (
    hasPendingFriendRequest &&
    friendRequestStatus === FriendRequestStatus.PENDING
  ) {
    const isSentByMe = pendingFriendRequestType === 'sent';

    if (isSentByMe) {
      return (
        <Button
          variant="outline"
          size="sm"
          className="ml-auto"
          onClick={() => handleCancelFriendRequest(requestId)}
          disabled={isCancelingFriendRequest}
        >
          <UserX className="size-4" />
          {isCancelingFriendRequest ? 'Canceling...' : 'Cancel Request'}
        </Button>
      );
    } else {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="ml-auto">
              <Clock className="size-4" />
              Respond
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem
              onClick={() => handleAcceptRequest(requestId)}
              className="flex justify-center cursor-pointer"
            >
              <UserCheck className="size-4" />
              {isAccepting ? 'Accepting...' : 'Accept'}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleDeclineRequest(requestId)}
              className="flex justify-center cursor-pointer"
            >
              <UserMinus className="size-4" />
              {isDeclining ? 'Declining...' : 'Decline'}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }
  }

  if (isFollowing) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="ml-auto">
            <Check className="size-4" />
            Following
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem
            onClick={() => handleFollow(true)}
            className="flex justify-center cursor-pointer"
          >
            <UserX className="size-4" />
            {isFollowLoading ? 'Unfollowing...' : 'Unfollow'}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return <FriendRequestModal userId={userId} />;
}
