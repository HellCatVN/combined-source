export interface Source {
  sourceName: string;
  version: string;
  files: SourceFile[];
  installed?: boolean;
}

export interface SourceFile {
  path: string;
  version: string;
  lastUpdated: string;
}

export interface SourceResponse {
  sources: Source[];
}