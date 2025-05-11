import { uploadFile } from '@api/upload';
import { useMutation } from 'react-query';

export const useUpload = () => {
  return useMutation({
    mutationFn: (files: File[]) => uploadFile(files),
  });
};
