import type { Post, User } from '@/lib/types';
import Image from 'next/image';
import avatar from '@/assets/avatar.png';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { format, formatDistanceToNow } from 'date-fns';
import { VisibilityIcons } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Heart, MessageCircleMore, Share2 } from 'lucide-react';
import AttachmentGallery from './AttachmentGallery';
import useLikePost from '@/app/hooks/useLikePost';
import { useState } from 'react';
import LikeListModal from '@/components/modals/like-list-modal';
import CommentListModal from '@/components/modals/comment-list-modal';
import CustomPostMe from './CustomPostMe';
import CustomPost from './CustomPost';
import { useRouter } from 'next/navigation';

interface PostCardProps {
  post: Post;
  user: User | null;
}

const PostCard = ({ post, user }: PostCardProps) => {
  const { toggleLike, isLoading: isLiking } = useLikePost(post.id);
  const [likeDialogOpen, setLikeDialogOpen] = useState(false);
  const [commentDialogOpen, setCommentDialogOpen] = useState(false);
  const router = useRouter();

  return (
    <article
      key={post.id}
      className="p-4 rounded-lg bg-white shadow-sm flex flex-col gap-5"
    >
      <div className="flex gap-4">
        <Image
          src={post?.author?.avatar || avatar}
          alt="avatar"
          width={50}
          height={50}
          className="rounded-full aspect-[1/1] object-cover cursor-pointer"
          onClick={() => router.push(`/profile/${post.author.username}`)}
        />

        <div className="flex items-center justify-between">
          <div>
            <h3
              className="font-medium text-base text-secondary-foreground hover:underline cursor-pointer"
              onClick={() => router.push(`/profile/${post.author.username}`)}
            >
              {post?.author?.profile.firstName} {post?.author?.profile.lastName}
            </h3>
            <div className="flex gap-1 items-center">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="text-xs text-gray-500">
                      {formatDistanceToNow(new Date(post.createdAt), {
                        addSuffix: true,
                      }).replace('about ', '')}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent className="text-xs">
                    {format(
                      new Date(post.createdAt),
                      "EEEE, MMMM do, yyyy 'at' h:mm a",
                    )}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="text-xs text-gray-500">
                      {VisibilityIcons[post.visibility]}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent className="text-xs">
                    {post.visibility}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </div>

        {user?.id === post.author.id ? (
          <CustomPostMe post={post} />
        ) : (
          <CustomPost post={post} />
        )}
      </div>

      <div className="flex-1">
        <div
          className="text-gray-700 text-sm font-normal mb-3"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {post.attachments?.length > 0 && (
          <AttachmentGallery attachments={post.attachments} />
        )}

        <div className="mt-4.5 space-y-3.5">
          <div className="flex items-center text-gray-500 text-sm">
            {post.likesCount > 0 && (
              <strong
                className="hover:underline cursor-pointer flex items-end gap-1"
                onClick={() => setLikeDialogOpen(true)}
              >
                <Heart size={16} className="fill-red-500 text-red-500" />
                <span className="leading-none">
                  {post.isLikedByMe &&
                    post.likesCount > 1 &&
                    `You and ${post.likesCount - 1} others`}
                  {post.isLikedByMe && post.likesCount === 1 && 'You'}
                  {!post.isLikedByMe && post.likesCount}
                </span>
              </strong>
            )}
            <div className="ml-auto flex justify-between gap-2">
              <strong
                className="hover:underline cursor-pointer"
                onClick={() => setCommentDialogOpen(true)}
              >
                {post.commentsCount} comments
              </strong>
              <span>•</span>
              <strong>0 shares</strong>
            </div>
          </div>

          <Separator />

          <div className="flex justify-between">
            <Button variant="ghost" onClick={toggleLike} disabled={isLiking}>
              <Heart
                className={`${post.isLikedByMe && 'fill-red-500 text-red-500'}`}
              />
              <span className={`${post.isLikedByMe && 'text-red-500'}`}>
                Love
              </span>
            </Button>
            <Button variant="ghost" onClick={() => setCommentDialogOpen(true)}>
              <MessageCircleMore />
              Comment
            </Button>
            <Button variant="ghost">
              <Share2 />
              Share
            </Button>
          </div>
        </div>
      </div>

      <LikeListModal
        isOpen={likeDialogOpen}
        onClose={() => setLikeDialogOpen(false)}
        postId={post.id}
      />

      <CommentListModal
        isOpen={commentDialogOpen}
        onClose={() => setCommentDialogOpen(false)}
        postId={post.id}
      />
    </article>
  );
};

export default PostCard;
