import { useMutation, useQuery, useQueryClient } from "react-query";
import { pluginsEndpoints } from "../../api/plugins";

export const usePlugins = () => {
  return useQuery({
    queryKey: ["plugins"],
    queryFn: async () => {
      const response = await pluginsEndpoints.getSources();
      return response.data;
    },
    refetchInterval: false,
    refetchOnWindowFocus: false,
  });
};

export const useUploadSource = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (sourceId: string) => pluginsEndpoints.uploadSource(sourceId),
    onSuccess: () => {
      queryClient.invalidateQueries(["plugins"]);
    },
  });
};

export const useUpdateSource = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (sourceId: string) => pluginsEndpoints.updateSource(sourceId),
    onSuccess: () => {
      queryClient.invalidateQueries(["plugins"]);
    },
  });
};