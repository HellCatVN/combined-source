import { Request } from 'express';
import { PathLike } from 'fs';

export interface FileUpload {
  filePath: string;
  content: string;
  sourceId: string;
  incrementType: string;
}

export interface UploadSourceRequest extends Request {
  body: {
    sourceId: string;
  };
}

export interface FileData {
  path: PathLike;
  content: string;
  modified: boolean;
}

export interface VersionControlAPIResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export interface FileVersion {
  filePath: string;
}

export interface SourceInfo {
  sourceName: string;
  filePaths: FileVersion[];
}

export interface RemoteFileContent {
  sourceId: string;
  filePath: string;
  content: string;
}

export interface ManifestFile {
  files: FileVersion[];
  name: string;
  version: string;
}