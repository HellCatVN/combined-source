export interface FileVersionItem {
  filePath: string;
  lastVersion: string;
}

export interface FileVersionPagination {
  total: number;
  page: number;
  totalPages: number;
}

export interface FileVersion {
  source: string;
  currentVersion: string;
  lastVersionedAt: string;
  totalFiles: number;
  totalChanges: number;
  files: FileVersionItem[];
  pagination: FileVersionPagination;
}

export interface FileVersionResponse {
  data: FileVersion;
  message: string;
}

export interface FileContent {
  filePath: string;
  content: string;
  version: string;
}

export interface FileContentResponse {
  data: FileContent[];
}

export interface ManifestFile {
  files: string[];
}

export type UpdateSourceFunction = () => Promise<FileContent[]>;

export interface FileWatcher {
  path: string;
  lastContent: string;
  updateSource: UpdateSourceFunction;
}