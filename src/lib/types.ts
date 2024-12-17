import { FriendRequestStatus, SocialPlatform, Visibility } from './enum';

export type ErrorServerResponse = {
  response: {
    data: {
      error: string;
      message: string[];
      statusCode: number;
    };
  };
};

export type Conversation = {
  id: string;
  creator: User;
  recipient: User;
  createdAt: string;
  lastMessageSent: LastMessageSent;
};

export type User = {
  id: string;
  email: string;
  avatar?: string;
  username: string;
};

export type Profile = {
  firstName: string | null;
  lastName: string | null;
  coverPhoto: string | null;
  bio: string;
  birthday: string | null;
  gender: string | null;
  address: string | null;
  socialLinks: SocialLink[] | null;
};

export type UserProfile = {
  id: string;
  username: string;
  avatar: string | null;
  profile: Profile;
};

export type SocialLink = {
  platform: SocialPlatform;
  url: string;
};

export type Message = {
  id: string;
  content: string;
  createdAt: string;
  author: User;
  attachments: AttachmentResponse[];
  parentMessage: Message | null;
};

export type AttachmentResponse = {
  id: string;
  createdAt: string;
  updatedAt: string;
  mimetype: string;
  url: string;
  name: string;
};

export type LastMessageSent = {
  id: string;
  content: string;
  createdAt: Date;
  attachments: Attachment[];
};

export type MessageEventPayload = {
  messages: Message[];
  conversation: Conversation;
};

export type CreateConversationParams = {
  email: string;
  message: string;
};

export type CreateGroupParams = {
  users: string[];
  title: string;
};

export type ConversationMessages = {
  conversationId: string;
  messages: Message[];
};

export interface Attachment {
  id: string;
  url: string;
  name?: string;
  mimetype: string;
}

export type Pagination<T> = {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
};

export type Post = {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  visibility: Visibility;
  author: UserProfile;
  attachments: Attachment[];
  likesCount: number;
  isLikedByMe: boolean;
  commentsCount: number;
};

export type Comment = {
  id: string;
  postId: string;
  content: string;
  user: UserProfile;
  parentCommentId: string | null;
  updatedAt: string;
};

export type Group = {
  id: string;
  title?: string;
  users: User[];
  creator: User;
  owner: User;
  messages: GroupMessage[];
  createdAt: number;
  lastMessageSent: Message;
  lastMessageSentAt: Date;
  avatar?: string;
};

export type GroupMessage = {
  id: string;
  content?: string;
  createdAt: string;
  author: User;
  group: Group;
  attachments: Attachment[];
  parentMessage: Omit<GroupMessage, 'group'> | null;
};

export type GroupMessages = {
  groupId: string;
  messages: GroupMessage[];
};

export type GroupMessageEventPayload = {
  messages: GroupMessage[];
  group: Group;
};

export type GroupMessageDeletePayload = {
  userId: string;
  groupId: string;
  messageId: string;
};

export type AddGroupUserMessagePayload = {
  group: Group;
  user: User;
};

export type RemoveGroupUserMessagePayload = {
  group: Group;
  user: User;
};

export type GroupParticipantLeftPayload = {
  group: Group;
  userId: string;
};

export type UserRelationship = {
  requestId: string;
  isFollowing: boolean;
  isFriend: boolean;
  hasPendingFriendRequest: boolean;
  pendingFriendRequestType?: 'sent' | 'received';
  friendRequestStatus: FriendRequestStatus;
};

export type UsersLikedPost = {
  user: UserProfile;
  relationship: UserRelationship;
};
