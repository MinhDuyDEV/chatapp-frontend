import { format } from 'date-fns';

export const formatPostDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600)
    return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400)
    return `${Math.floor(diffInSeconds / 3600)} hours ago`;

  return `${Math.floor(diffInSeconds / 86400)} days ago`;
};

export const formatPostDetailDate = (dateString: string) => {
  return format(dateString, "EEEE, MMMM do, yyyy 'at' h:mm a");
};
