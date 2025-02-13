import type { Post, User } from "@/lib/types";
import Image from "next/image";
import avatar from "@/assets/avatar.png";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { format, formatDistanceToNow } from "date-fns";
import { VisibilityIcons } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Heart, MessageCircleMore, Share2 } from "lucide-react";
import AttachmentGallery from "./AttachmentGallery";
import useLikePost from "@/app/hooks/useLikePost";
import { useState } from "react";
import LikeListModal from "@/components/modals/like-list-modal";
import CommentListModal from "@/components/modals/comment-list-modal";
import CustomPostMe from "./CustomPostMe";
import CustomPost from "./CustomPost";

interface PostCardProps {
  post: Post;
  user: User | null;
}

const PostCard = ({ post, user }: PostCardProps) => {
  const { mutate: likePost } = useLikePost(post.id);
  const [likeDialogOpen, setLikeDialogOpen] = useState(false);
  const [commentDialogOpen, setCommentDialogOpen] = useState(false);

  const likeText = (() => {
    if (!post.likes || post.likes.length === 0) return "";

    if (post.isLikedByCurrentUser) {
      return (
        "You" +
        (post.remainingLikeCount > 0
          ? ` and ${post.remainingLikeCount} others`
          : "")
      );
    } else {
      const firstLikeUsername = post.likes[0]?.username;
      return (
        firstLikeUsername +
        (post.remainingLikeCount > 0
          ? ` and ${post.remainingLikeCount} others`
          : "")
      );
    }
  })();

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
          className="rounded-full aspect-[1/1] object-cover"
        />

        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-base text-secondary-foreground">
              {post?.author?.username}
            </h3>
            <div className="flex gap-1 items-center">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="text-xs text-gray-500">
                      {formatDistanceToNow(new Date(post.createdAt), {
                        addSuffix: true,
                      }).replace("about ", "")}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent className="text-xs">
                    {format(
                      new Date(post.createdAt),
                      "EEEE, MMMM do, yyyy 'at' h:mm a"
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
            <strong
              className="hover:underline cursor-pointer"
              onClick={() => setLikeDialogOpen(true)}
            >
              {likeText && <>{likeText}</>}
            </strong>
            <div className="ml-auto flex justify-between gap-2">
              <strong
                className="hover:underline cursor-pointer"
                onClick={() => setCommentDialogOpen(true)}
              >
                {post.commentCount} comments
              </strong>
              <span>•</span>
              <strong>123 shares</strong>
            </div>
          </div>

          <Separator />

          <div className="flex justify-between">
            <Button variant="ghost" onClick={() => likePost()}>
              <Heart
                className={`${
                  post.isLikedByCurrentUser && "fill-red-500 text-red-500"
                }`}
              />
              <span
                className={`${post.isLikedByCurrentUser && "text-red-500"}`}
              >
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
