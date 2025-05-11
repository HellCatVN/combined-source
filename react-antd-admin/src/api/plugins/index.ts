import { axiosInstance } from "../axiosClient";
import { IPluginResponse } from "../../interfaces/plugin";

export const pluginsEndpoints = {
  getSources: () => axiosInstance.get<IPluginResponse>("/sync-source/sources"),
  uploadSource: (sourceId: string) => axiosInstance.post("/upload-source", { sourceId }),
  updateSource: (sourceId: string) => axiosInstance.post("/sync-source/update-source", { sourceId }),
};