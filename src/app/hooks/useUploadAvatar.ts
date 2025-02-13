import { QueryKeyProfile } from '@/lib/enum';
import { ErrorServerResponse } from '@/lib/types';
import { uploadAvatar } from '@/services/users';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

export default function useUploadAvatar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ file }: { file: File }) => uploadAvatar(file),
    onSuccess: () => {
      toast.success('Avatar updated successfully');
      queryClient.invalidateQueries({
        queryKey: [`${QueryKeyProfile.Profile}`],
      });
      queryClient.invalidateQueries({
        queryKey: [`detail-${QueryKeyProfile.Profile}`],
      });
    },
    onError: (error: ErrorServerResponse) => {
      toast.error(`Upload avatar failed: ${error.response.data.message[0]}`);
    },
  });
}
