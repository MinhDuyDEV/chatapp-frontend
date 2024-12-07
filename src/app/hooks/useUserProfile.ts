import { QueryKeyProfile } from '@/lib/enum';
import { getUserProfile } from '@/services/users';
import { useQuery } from '@tanstack/react-query';

export default function useUserProfile(username: string) {
  return useQuery({
    queryKey: [`${QueryKeyProfile.Profile}:${username}`],
    queryFn: () => getUserProfile(username),
    staleTime: Infinity,
  });
}
