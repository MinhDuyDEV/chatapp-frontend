'use client';

import { ScrollArea } from '../ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import {
  differenceInDays,
  differenceInHours,
  differenceInMinutes,
  differenceInSeconds,
  differenceInWeeks,
} from 'date-fns';
import { useParams, usePathname, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Conversation, Group } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useAuth } from '@/providers/auth-provider';
import { getRecipientFromConversation } from '@/lib/format';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageSquareLock, Users } from 'lucide-react';
import { useActiveTabStore } from '@/stores/active-tab-message.store';

const formatDateLabel = (dateStr: Date) => {
  const date = new Date(dateStr);
  const now = new Date();
  if (!dateStr) return '';
  const seconds = differenceInSeconds(now, date);
  if (seconds < 60) {
    return `${seconds}s`;
  }
  const minutes = differenceInMinutes(now, date);
  if (minutes < 60) {
    return `${minutes}m`;
  }
  const hours = differenceInHours(now, date);
  if (hours < 24) {
    return `${hours}h`;
  }
  const days = differenceInDays(now, date);
  if (days < 7) {
    return `${days}d`;
  }
  const weeks = differenceInWeeks(now, date);
  return `${weeks}w`;
};

const ConversationSidebar = () => {
  const router = useRouter();
  const params = useParams<{ conversationId: string; groupId: string }>();
  const pathname = usePathname();
  const { user } = useAuth();
  const { activeTab, setActiveTab } = useActiveTabStore();

  const { data: conversations } = useQuery<Conversation[]>({
    queryKey: ['conversations'],
    staleTime: Infinity,
  });
  const { data: groups } = useQuery<Group[]>({
    queryKey: ['groups'],
    staleTime: Infinity,
  });
  if (!conversations || !groups) return <div>Loading...</div>;
  if (
    pathname === '/messages' &&
    conversations.length > 0 &&
    activeTab === 'conversations'
  ) {
    router.push(`/messages/${activeTab}/${conversations[0].id}`);
  }
  if (pathname === '/messages' && groups.length > 0 && activeTab === 'groups') {
    router.push(`/messages/${activeTab}/${groups[0].id}`);
  }

  return (
    <Tabs
      value={activeTab}
      onValueChange={setActiveTab}
      className="flex-grow w-full h-full"
    >
      <TabsList className="grid w-full grid-cols-1 lg:grid-cols-2 h-fit gap-2">
        <TabsTrigger
          value="conversations"
          onClick={() => {
            if (conversations.length > 0) {
              router.push(`/messages/conversations/${conversations[0].id}`);
            }
          }}
        >
          <MessageSquareLock size={16} className="mr-2" />
          <span className="hidden lg:block">Private</span>
        </TabsTrigger>
        <TabsTrigger
          value="groups"
          onClick={() => {
            if (groups.length > 0) {
              router.push(`/messages/groups/${groups[0].id}`);
            }
          }}
        >
          <Users size={16} className="mr-2" />
          <span className="hidden lg:block">Groups</span>
        </TabsTrigger>
      </TabsList>
      <TabsContent
        value="conversations"
        className="flex-1 h-full overflow-hidden"
      >
        <ScrollArea className="flex-1 h-full overflow-auto">
          {conversations.length === 0 && (
            <div className="flex items-center justify-center h-full">
              <p className="text-foreground/60 text-lg font-bold">
                No conversations yet
              </p>
            </div>
          )}
          {conversations.map((conversation: Conversation) => {
            const recipient = getRecipientFromConversation(conversation, user);
            return (
              <div
                className={cn(
                  'flex p-3 transition-all mx-3 rounded-md cursor-pointer hover:bg-gray-100 gap-2.5 items-center',
                  params.conversationId === conversation.id &&
                    'bg-gray-200 hover:bg-gray-200',
                )}
                key={conversation.id}
                onClick={() =>
                  router.push(`/messages/conversations/${conversation.id}`)
                }
              >
                <Avatar className="size-10">
                  <AvatarImage
                    src={conversation.recipient.avatar || undefined}
                  />
                  <AvatarFallback>
                    {recipient?.username.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="lg:flex flex-col w-full hidden">
                  <p className="font-bold">{recipient?.username}</p>
                  <div className="flex items-center justify-start">
                    {conversation.lastMessageSent?.attachments?.length > 0 ? (
                      conversation.lastMessageSent.attachments[0].mimetype.startsWith(
                        'image',
                      ) ? (
                        <p className="text-sm font-normal text-foreground/60 truncate max-w-40">
                          Image
                        </p>
                      ) : conversation.lastMessageSent.attachments[0].mimetype.startsWith(
                          'video',
                        ) ? (
                        <p className="text-sm font-normal text-foreground/60 truncate max-w-40">
                          Video
                        </p>
                      ) : conversation.lastMessageSent.attachments[0].mimetype.startsWith(
                          'application',
                        ) ? (
                        <p className="text-sm font-normal text-foreground/60 truncate max-w-40">
                          Document
                        </p>
                      ) : (
                        <p className="text-sm font-normal text-foreground/60 truncate max-w-40">
                          Other
                        </p>
                      )
                    ) : (
                      <p className="text-sm font-normal text-foreground/60 truncate max-w-40">
                        {conversation.lastMessageSent?.content || '.'}
                      </p>
                    )}
                    <span className="size-0.5 rounded-full bg-accent-foreground/50 mx-2"></span>
                    <p className="text-sm font-normal text-foreground/60">
                      {formatDateLabel(conversation.lastMessageSent?.createdAt)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </ScrollArea>
      </TabsContent>
      <TabsContent value="groups" className="flex-1 h-full overflow-hidden">
        <ScrollArea className="flex-1 h-full overflow-auto">
          {groups.length === 0 && (
            <div className="flex items-center justify-center h-full">
              <p className="text-foreground/60 text-lg font-bold">
                No groups yet
              </p>
            </div>
          )}
          {groups.map((group: Group) => {
            return (
              <div
                className={cn(
                  'flex p-3 transition-all mx-3 rounded-md cursor-pointer hover:bg-gray-100 gap-2.5 items-center',
                  params.groupId === group.id &&
                    'bg-gray-200 hover:bg-gray-200',
                )}
                key={group.id}
                onClick={() => router.push(`/messages/groups/${group.id}`)}
              >
                <Avatar className="size-10">
                  <AvatarImage src={group.avatar} />
                  <AvatarFallback>
                    {group?.title?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="lg:flex flex-col w-full hidden">
                  <p className="font-bold">{group?.title}</p>
                  <div className="flex items-center justify-start">
                    <p className="text-sm font-normal text-foreground/60 truncate max-w-40">
                      {group.lastMessageSent?.content || '.'}
                    </p>
                    <span className="size-0.5 rounded-full bg-accent-foreground/50 mx-2"></span>
                    <p className="text-sm font-normal text-foreground/60">
                      {formatDateLabel(group.lastMessageSentAt)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </ScrollArea>
      </TabsContent>
    </Tabs>
  );
};

export default ConversationSidebar;
