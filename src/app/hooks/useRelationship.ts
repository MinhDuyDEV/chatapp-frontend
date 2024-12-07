import { QueryKeyProfile } from '@/lib/enum';
import { getRelationship } from '@/services/friends';
import { useQuery } from '@tanstack/react-query';

export default function useRelationship(userId: string) {
  return useQuery({
    queryKey: [`${QueryKeyProfile.Relationship}:${userId}`],
    queryFn: () => getRelationship(userId),
    enabled: !!userId,
    staleTime: Infinity,
  });
}
