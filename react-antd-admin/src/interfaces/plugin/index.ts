export interface IPluginFile {
  filePath: string;
}

export interface IPluginMetadata {
  currentVersion: string;
  lastVersionedAt: string;
  watchingFiles: IPluginFile[];
  totalFiles: number;
  totalChanges: number;
}

export interface IPlugin {
  _id: string;
  sourceName: string;
  description: string;
  isActive: boolean;
  installed: boolean;
  sourceType: "plugins" | "source-code";
  metadata: IPluginMetadata;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface IPluginResponse {
  data: {
    sources: IPlugin[];
    isUpdateInProgress: boolean;
  };
}